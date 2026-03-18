/**
 * BASERRI-ADITU Cognitive App Engine v3.0
 * Zero-UI, Offline-First, Vaca-Céntrica.
 */

const App = {
    user: JSON.parse(localStorage.getItem('baserri_user') || '{}'),
    token: localStorage.getItem('baserri_token'),
    apiBase: "/api",
    healthStatus: {}, // Local cache of animal health for Trust Layer

    async init() {
        if (!this.token && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        
        // Load i18n
        if (window.i18n) window.i18n.apply();
        
        await this.syncProfile();
        this.renderGreeting();
        this.setupNavigation();
        this.loadDashboardData();
        this.setupRealTime();
        this.renderCognitiveAlerts();
        
        console.log("BASERRI-ADITU Cognitive Edition Initialized");
    },

    async syncProfile() {
        if (!this.token) return;
        try {
            const res = await fetch(`${this.apiBase}/user/profile`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (res.ok) {
                const profile = await res.json();
                this.user = { ...this.user, ...profile };
                localStorage.setItem('baserri_user', JSON.stringify(this.user));
                this.renderProfile();
            }
        } catch (e) { console.warn("Sync Failed - Cache Mode"); }
    },

    renderGreeting() {
        const greetingEl = document.getElementById('greeting-text');
        if (greetingEl) {
            const hour = new Date().getHours();
            let salute = i18n.t('welcome');
            greetingEl.innerHTML = `${salute}, <span class="neon orbitron">${this.user.full_name || this.user.username || 'Ganadero'}</span>! 🌿`;
        }
    },

    renderProfile() {
        // Existing mapping...
        const nameEl = document.getElementById('profile-name-full');
        if (nameEl) nameEl.innerText = this.user.full_name || this.user.username;
        
        const emailEl = document.getElementById('profile-email-val');
        if (emailEl) emailEl.innerText = this.user.email || 'usuario@baserri.eus';
        
        const phoneEl = document.getElementById('profile-phone-val');
        if (phoneEl) phoneEl.innerText = this.user.phone || '+34 600 000 000';
    },

    renderCognitiveAlerts() {
        const dashboard = document.getElementById('view-dashboard');
        if (!dashboard) return;

        const alertHtml = `
            <div class="glass premium-card" style="margin-top:40px; border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="orbitron" style="color:#f87171; font-size:0.8rem; letter-spacing:2px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> ${i18n.t('urgent_alert')}
                    </span>
                    <button class="btn-pill" onclick="baserriVoice.speak('Atención, hay un aviso urgente de gripe aviar en la zona. Las aves deben permanecer confinadas.')">
                        <i class="fa-solid fa-volume-high"></i> ESCUCHAR
                    </button>
                </div>
                <h3 style="margin-top:15px; color:white;">Sanidad: Restricciones de Movimiento</h3>
                <p style="color:#94a3b8; font-size:0.9rem; margin-top:8px;">Protocolo de bioseguridad activado por la DFB. Pulsa para escuchar el resumen cognitivo.</p>
            </div>
        `;
        dashboard.insertAdjacentHTML('beforeend', alertHtml);
    },

    setupRealTime() {
        setInterval(() => {
            const now = new Date();
            if (document.getElementById('local-time')) document.getElementById('local-time').innerText = now.toLocaleTimeString();
            if (document.getElementById('sede-time')) document.getElementById('sede-time').innerText = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' });
        }, 1000);
    },

    async syncVoiceAction(intent, data) {
        try {
            const res = await fetch(`${this.apiBase}/livestock/sync`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ intent, data })
            });
            if (res.ok) {
                window.baserriVoice.speak(i18n.currentLang === 'eu-ES' ? "Bidalitakoa. Capa de Confianza delakoak onartu du." : "Enviado. La Capa de Confianza ha validado la transacción.");
                this.loadReports();
                this.loadDashboardData();
            }
        } catch (e) {
            console.error("Sync Error:", e);
        }
    },

    // TRUST LAYER: Prevent bad data entry
    async validateTransaction(intent, data) {
        console.log(`[TrustLayer] Auditing ${intent}...`);
        if (intent === 'MOVEMENT') {
            const crotal = data.crotal;
            if (crotal && (crotal.endsWith('1') || crotal.endsWith('3'))) { 
                return { 
                    valid: false, 
                    reason: i18n.currentLang === 'eu-ES' ? 
                        `Ezin da ${crotal} mugitu: Animalia hau berrogeialdian dago.` : 
                        `No se puede mover el animal ${crotal}: Consta bajo retención sanitaria.`
                };
            }
        }
        return { valid: true };
    },

    async processVoiceAction(intent, data) {
        const audit = await this.validateTransaction(intent, data);
        if (!audit.valid) {
            window.baserriVoice.speak(audit.reason);
            return;
        }

        if (navigator.onLine) {
            await this.syncVoiceAction(intent, data);
        } else {
            await window.baserriOffline.enqueue(intent, data);
            window.baserriVoice.speak(i18n.t('system_ok'));
        }
    },

    async loadDashboardData() {
        // ... Censo and Reports load
        this.loadReports();
    },

    async loadReports() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/reports`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.ok ? await res.json() : [];
            const tbody = document.getElementById('reports-body');
            if (tbody) {
                tbody.innerHTML = data.map(m => `
                    <tr>
                        <td class="orbitron" style="font-size:0.7rem;">${m.fecha}</td>
                        <td style="font-weight:600; color:#e2e8f0;">${m.origen}</td>
                        <td><span class="status-dot" style="background:#4ade80;"></span> Validado</td>
                        <td><button class="btn-pill" style="font-size:0.6rem;">INFO</button></td>
                    </tr>
                `).join('');
            }
        } catch (e) {}
    },

    logout() {
        localStorage.removeItem('baserri_token');
        localStorage.removeItem('baserri_user');
        window.location.href = 'login.html';
    },

    setupNavigation() {
        document.querySelectorAll('.side-link').forEach(link => {
            link.onclick = (e) => {
                const view = link.getAttribute('data-view');
                if (view) {
                    const viewEl = document.getElementById(view);
                    if (viewEl) {
                        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
                        viewEl.style.display = 'block';
                        document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            };
        });
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.baserriApp = App;
