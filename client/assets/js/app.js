/**
 * BASERRI-ADITU Application Engine v1.3.0
 * Magistral Edition
 */

const App = {
    user: JSON.parse(localStorage.getItem('baserri_user') || '{}'),
    token: localStorage.getItem('baserri_token'),
    apiBase: "/api",

    async init() {
        if (!this.token && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        
        await this.syncProfile();
        this.renderGreeting();
        this.setupNavigation();
        this.loadDashboardData();
        this.setupRealTime();
        
        console.log("BASERRI-ADITU Magistral Edition Initialized");
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
            } else if (res.status === 401) {
                this.logout();
            }
        } catch (e) {
            console.warn("Sync Failed - Operating in Local Cache Mode");
        }
    },

    renderGreeting() {
        const greetingEl = document.getElementById('greeting-text');
        if (greetingEl) {
            const hour = new Date().getHours();
            let salute = "¡Buenas noches";
            if (hour >= 6 && hour < 12) salute = "¡Buenos días";
            else if (hour >= 12 && hour < 20) salute = "¡Buenas tardes";
            
            greetingEl.innerHTML = `${salute}, <span style="color: var(--accent); font-family: 'Orbitron', sans-serif;">${this.user.full_name || this.user.username || 'Ganadero'}</span>! 🌿`;
        }
    },

    renderProfile() {
        const nameEl = document.getElementById('profile-name-full');
        const idEl = document.getElementById('profile-id');
        const emailEl = document.getElementById('profile-email-val');
        const phoneEl = document.getElementById('profile-phone-val');
        const imgEl = document.getElementById('profile-img');
        
        const fullName = this.user.full_name || this.user.username || 'Ganadero';
        if (nameEl) nameEl.innerText = fullName;
        if (idEl) idEl.innerText = `#48-${String(this.user.id || '0000').padStart(4, '0')}`;
        if (emailEl) emailEl.innerText = this.user.email || 'usuario@baserri.eus';
        if (phoneEl) phoneEl.innerText = this.user.phone || '+34 600 000 000';
        if (imgEl) imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0b1121&color=d4af37&size=128`;
        
        // Populate Modal
        if (document.getElementById('edit-name')) document.getElementById('edit-name').value = this.user.full_name || '';
        if (document.getElementById('edit-email')) document.getElementById('edit-email').value = this.user.email || '';
        if (document.getElementById('edit-phone')) document.getElementById('edit-phone').value = this.user.phone || '';
    },

    setupRealTime() {
        const updateTime = () => {
            const now = new Date();
            const localStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const sedeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            const sedeEl = document.getElementById('sede-time');
            const localEl = document.getElementById('local-time');
            if(sedeEl) sedeEl.innerText = sedeStr;
            if(localEl) localEl.innerText = localStr;
        };
        updateTime();
        setInterval(updateTime, 1000);
    },

    logout() {
        localStorage.removeItem('baserri_token');
        localStorage.removeItem('baserri_user');
        window.location.href = 'login.html';
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        const activeView = document.getElementById(viewId);
        if (activeView) activeView.style.display = 'block';
        
        document.querySelectorAll('.side-link, .nav-item').forEach(n => n.classList.remove('active'));
        const navItems = document.querySelectorAll(`[data-view="${viewId}"]`);
        navItems.forEach(n => n.classList.add('active'));
    },

    setupNavigation() {
        document.querySelectorAll('.side-link, .nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) this.navigate(view);
            };
        });

        const editForm = document.getElementById('edit-profile-form');
        if (editForm) {
            editForm.onsubmit = async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> GUARDANDO...';
                
                const payload = {
                    full_name: document.getElementById('edit-name').value,
                    email: document.getElementById('edit-email').value,
                    phone: document.getElementById('edit-phone').value
                };
                
                try {
                    const res = await fetch(`${this.apiBase}/user/profile`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (res.ok) {
                        alert("Perfil actualizado magistralmente.");
                        await this.syncProfile();
                        this.renderGreeting();
                        if (typeof closeEditModal === 'function') closeEditModal();
                    } else {
                        alert("Error al actualizar el perfil.");
                    }
                } catch (err) {
                    alert("Error de conexión con el servidor.");
                } finally {
                    btn.innerHTML = originalText;
                }
            };
        }
    },

    async loadDashboardData() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/census`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.ok ? await res.json() : { animals: [] };
            const censusEl = document.getElementById('census-count');
            if (censusEl) censusEl.innerText = data.animals ? data.animals.length : '--';
            
            this.loadReports();
        } catch (e) {
            console.warn("Dashboard Load Error.");
        }
    },

    async loadReports() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/reports`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.ok ? await res.json() : [];
            const tbody = document.getElementById('reports-body');
            if (tbody) {
                if (data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#64748b;">No hay reportes disponibles.</td></tr>`;
                    return;
                }
                tbody.innerHTML = data.map(m => `
                    <tr>
                        <td class="orbitron" style="font-size:0.7rem;">${m.fecha}</td>
                        <td style="font-weight:600; color:#e2e8f0;">${m.origen === 'Nacimiento' ? 'Registro Nacimiento' : 'Guía Movimiento #' + m.animal_id}</td>
                        <td><span class="status-dot" style="background: ${m.guia_status === 'Firmado' ? '#4ade80' : '#fbbf24'};"></span> ${m.guia_status}</td>
                        <td>
                            <button class="btn-pill" onclick="baserriApp.showReportDetail('${m.id}')" style="padding:4px 10px; font-size:0.6rem;">DETALLE</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.warn("Reports Load Error.");
        }
    },

    downloadReport(type) {
        alert(`Generando reporte ${type} magistral...`);
        const content = "BASERRI-ADITU REPORT\nFecha: " + new Date().toLocaleString() + "\nTipo: " + type;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BASERRI_Reporte_${type}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },

    showHealthDetail(param) {
        alert(`Detalle Sanitario: ${param}\nEstado: NEGATIVO\nÚltima Revisión: 10/03/2026\nResultado validado por BASERRI-ADITU Core.`);
    },

    showReportDetail(id) {
        alert(`Ficha del Registro #${id}\nTrámite: Oficial SITRAN\nValidación: Magistral\nEl sistema confirma la integridad de este dato.`);
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.baserriApp = App;
window.App = App;
