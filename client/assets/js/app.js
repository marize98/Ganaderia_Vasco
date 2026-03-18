/**
 * BASERRI-ADITU Application Engine v1.2.0
 * Playformance Edition
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
        
        console.log("Baserri-Aditu Playformance Edition Initialized");
    },

    async syncProfile() {
        try {
            const res = await fetch(`${this.apiBase}/user/profile`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const profile = await res.json();
            if (profile.id) {
                this.user = { ...this.user, ...profile };
                this.renderProfile();
            }
        } catch (e) {
            console.warn("Offline or profile sync failed.");
        }
    },

    renderGreeting() {
        const greetingEl = document.getElementById('greeting-text');
        if (greetingEl) {
            const hour = new Date().getHours();
            let salute = "¡Buenas noches";
            if (hour >= 6 && hour < 12) salute = "¡Buenos días";
            else if (hour >= 12 && hour < 20) salute = "¡Buenas tardes";
            
            greetingEl.innerHTML = `${salute}, <span class="accent-blue">${this.user.full_name || this.user.username || 'Samuel'}</span>! 🧑‍🌾`;
        }
    },

    renderProfile() {
        const nameEl = document.getElementById('profile-name-full');
        const idEl = document.getElementById('profile-id');
        const emailEl = document.getElementById('profile-email-val');
        const phoneEl = document.getElementById('profile-phone-val');
        
        if (nameEl) nameEl.innerText = this.user.full_name || this.user.username;
        if (idEl) idEl.innerText = this.user.id || 'N/A';
        if (emailEl) emailEl.innerText = this.user.email || 'N/A';
        if (phoneEl) phoneEl.innerText = this.user.phone || 'N/A';
        
        // Populate Modal
        document.getElementById('edit-name').value = this.user.full_name || '';
        document.getElementById('edit-email').value = this.user.email || '';
        document.getElementById('edit-phone').value = this.user.phone || '';
    },

    setupRealTime() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            if(document.getElementById('sede-time')) document.getElementById('sede-time').innerText = timeStr;
            if(document.getElementById('local-time')) document.getElementById('local-time').innerText = timeStr;
        };
        updateTime();
        setInterval(updateTime, 60000);
    },

    logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        const activeView = document.getElementById(viewId);
        if (activeView) activeView.style.display = 'block';
        
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`[data-view="${viewId}"]`);
        if (navItem) navItem.classList.add('active');
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) this.navigate(view);
            };
        });

        // Edit Profile Form
        document.getElementById('edit-profile-form').onsubmit = async (e) => {
            e.preventDefault();
            const payload = {
                full_name: document.getElementById('edit-name').value,
                email: document.getElementById('edit-email').value,
                phone: document.getElementById('edit-phone').value
            };
            
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
                closeEditModal();
            }
        };
    },

    async loadDashboardData() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/census`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            const censusEl = document.getElementById('census-count');
            if (censusEl && data.animals) censusEl.innerText = data.animals.length;
            
            this.loadReports();
        } catch (e) {
            console.warn("Error loading dashboard data.");
        }
    },

    async loadReports() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/reports`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            const tbody = document.getElementById('reports-body');
            if (tbody) {
                tbody.innerHTML = data.map(m => `
                    <tr>
                        <td>${m.fecha}</td>
                        <td>Guía ${m.animal_id}</td>
                        <td><span class="status-dot" style="background: ${m.guia_status === 'Firmado' ? 'var(--success)' : 'var(--accent)'};"></span> ${m.guia_status}</td>
                        <td><i class="fa-solid fa-ellipsis"></i></td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.warn("Error loading reports.");
        }
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.baserriApp = App;
