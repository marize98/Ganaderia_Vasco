/**
 * BASERRI-ADITU Main App Logic
 * Handles data synchronization, offline storage, and UI updates.
 */

const App = {
    db: null,
    apiBase: "http://localhost:3000/api",
    token: localStorage.getItem('baserri_token'),
    
    init() {
        if (!this.token && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
        console.log("Baserri-Aditu Initialized");
        if (window.baserriLang) window.baserriLang.apply();
        this.setupDB();
        this.registerServiceWorker();
        this.bindEvents();
        
        if (this.token) this.syncWithServer();
    },

    async syncWithServer() {
        try {
            const res = await fetch(`${this.apiBase}/livestock/census`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            if (data.count !== undefined) {
                document.querySelector('h2').innerText = data.count;
                this.saveToLocal("censos", { id: "EXPLO_01", count: data.count });
            }
        } catch (e) {
            console.warn("Offline mode - using local cache");
        }
    },

    async setupDB() {
        // Open/Create IndexedDB for Offline-First capability
        const request = indexedDB.open("BaserriDB", 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("censos")) db.createObjectStore("censos", { keyPath: "id" });
            if (!db.objectStoreNames.contains("tramites")) db.createObjectStore("tramites", { keyPath: "id", autoIncrement: true });
            if (!db.objectStoreNames.contains("alertas")) db.createObjectStore("alertas", { keyPath: "id" });
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log("IndexedDB metadata ready");
            this.loadInitialData();
        };
    },

    loadInitialData() {
        // Mocking data retrieval from MUGIDE
        const mockCenso = { id: "ES481230009876", count: 42, details: "38 Adultos, 4 Terneros" };
        this.saveToLocal("censos", mockCenso);
    },

    saveToLocal(storeName, data) {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(data);
    },

    registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("sw.js")
                .then(() => console.log("Service Worker registered"))
                .catch(err => console.error("SW failed", err));
        }
    },

    bindEvents() {
        // Handle UI Nav switching (Mock)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                // Navigation logic would go here
            });
        });
    }
};

window.addEventListener('load', () => App.init());
