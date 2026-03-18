/**
 * BASERRI-ADITU Application Engine
 * Handles SPA navigation, Perfil, and reports.
 */

const App = {
    user: JSON.parse(localStorage.getItem('baserri_user') || '{}'),
    token: localStorage.getItem('baserri_token'),
    apiBase: "/api",

    init() {
        if (!this.token && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        
        this.renderWelcome();
        this.setupNavigation();
        this.loadDashboardData();
        console.log("Baserri-Aditu Magistral Initialized");
    },

    renderWelcome() {
        const welcomeEl = document.getElementById('welcome-msg');
        if (welcomeEl) {
            welcomeEl.innerText = `Kaixo, ${this.user.username || 'Ganadero'}!`;
        }
    },

    logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    },

    navigate(viewId) {
        console.log("Navigating to:", viewId);
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
    },

    async loadDashboardData() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/census`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            const censusEl = document.getElementById('census-count');
            if (censusEl && data.animals) censusEl.innerText = data.animals.length;
        } catch (e) {
            console.warn("Error loading dashboard data.");
        }
    },

    generateReport() {
        alert("Generando reporte magistral de explotación... (SITRAN sync activo)");
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.baserriApp = App;
