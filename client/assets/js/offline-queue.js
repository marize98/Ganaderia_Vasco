/**
 * BASERRI-ADITU Offline Queue System v1.0
 * Persistence for voice instructions in coverage shadows.
 */

const OfflineQueue = {
    dbName: 'BaserriQueue',
    storeName: 'instructions',
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log("[Offline] Queue initialized");
                this.checkSync();
                resolve();
            };
            request.onerror = (e) => reject(e);
        });
    },

    async enqueue(intent, data) {
        const item = {
            intent,
            data,
            timestamp: new Date().toISOString(),
            synced: false
        };
        const tx = this.db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.add(item);
        console.log("[Offline] Instruction queued:", intent);
    },

    async checkSync() {
        if (!navigator.onLine) return;
        
        const tx = this.db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = async () => {
            const items = request.result.filter(i => !i.synced);
            if (items.length > 0) {
                console.log(`[Offline] Syncing ${items.length} items...`);
                for (const item of items) {
                    await this.syncItem(item);
                }
            }
        };
    },

    async syncItem(item) {
        // Simulating API call to backend
        try {
            const res = await fetch('/api/livestock/sync', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('baserri_token')}`
                },
                body: JSON.stringify(item)
            });
            
            if (res.ok) {
                const tx = this.db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                item.synced = true;
                store.put(item);
                console.log("[Offline] Synced successfully:", item.id);
            }
        } catch (e) {
            console.warn("[Offline] Sync failed, will retry later.");
        }
    }
};

window.addEventListener('online', () => OfflineQueue.checkSync());
window.baserriOffline = OfflineQueue;
OfflineQueue.init();
