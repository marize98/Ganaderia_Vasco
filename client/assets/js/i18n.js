/**
 * BASERRI-ADITU Internationalization v2.0
 * Fully bilingual Support (Castellano / Euskera)
 */

const translations = {
    'es-ES': {
        dashboard: "Dashboard",
        reports: "Reportes Avanzados",
        health: "Sanidad Animal",
        profile: "Mi Perfil",
        logout: "Cerrar Sesión",
        welcome: "¡Hola, Ganadero!",
        system_ok: "Sistema de gestión magistral operativo. ✨",
        local_time: "Hora Local",
        sede_time: "Sede (Vitoria-Gasteiz)",
        census: "Censo Bovino",
        alerts: "Alertas Sanidad",
        birth_record: "Registro Nacimiento",
        exit_guide: "Guía Movimiento",
        trust_layer_ok: "Validado por Capa de Confianza",
        urgent_alert: "ALERTA MAGISTRAL URGENTE",
        read_more: "Leer detalles",
        confirm_op: "¿Confirmas la operación?",
        no_reports: "No hay reportes disponibles."
    },
    'eu-ES': {
        dashboard: "Arbel Nagusia",
        reports: "Txosten Aurreratuak",
        health: "Animalien Osasuna",
        profile: "Nire Profila",
        logout: "Saioa Itxi",
        welcome: "Kaixo, Baserritarra!",
        system_ok: "Kudeaketa sistema magistrala martxan. ✨",
        local_time: "Bertako Ordua",
        sede_time: "Egoitza (Gasteiz)",
        census: "Behi Errolda",
        alerts: "Osasun Alertak",
        birth_record: "Jaiotza Erregistroa",
        exit_guide: "Mugimendu Gida",
        trust_layer_ok: "Konfiantza Geruzak onartua",
        urgent_alert: "KOGNITIBO ALERTA URGENTEA",
        read_more: "Xehetasunak irakurri",
        confirm_op: "Eragiketa berresten duzu?",
        no_reports: "Ez dago txostenik erabilgarri."
    }
};

const i18n = {
    currentLang: localStorage.getItem('baserri_lang') || 'es-ES',
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('baserri_lang', lang);
        if (window.baserriVoice) window.baserriVoice.setLanguage(lang);
        this.apply();
    },

    t(key) {
        return translations[this.currentLang][key] || key;
    },

    apply() {
        // Simple DOM mapping for static elements
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (translations[this.currentLang][key]) {
                el.innerText = translations[this.currentLang][key];
            }
        });
        console.log(`[i18n] Applied ${this.currentLang}`);
    }
};

window.i18n = i18n;
