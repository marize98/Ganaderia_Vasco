/**
 * Multi-language strings for Baserri-Aditu.
 */
const I18N = {
    'es': {
        'welcome': 'Kaixo, {name}!',
        'expl_label': 'Explotación',
        'alert_title': 'ALERTA SANITARIA',
        'stats_census': 'Censo Bovino',
        'stats_tasks': 'Trámites Pendientes',
        'quick_guide': 'Solicitar Guía de Salida',
        'quick_birth': 'Registrar Nacimiento',
        'nav_home': 'Inicio',
        'nav_tasks': 'Trámites',
        'nav_health': 'Sanidad',
        'nav_profile': 'Mi Perfil'
    },
    'eu': {
        'welcome': 'Kaixo, {name}!',
        'expl_label': 'Ustiapena',
        'alert_title': 'OSASUN OHARRA',
        'stats_census': 'Behi-errolda',
        'stats_tasks': 'Zain dauden izapideak',
        'quick_guide': 'Irteera-gida eskatu',
        'quick_birth': 'Jaiotza erregistratu',
        'nav_home': 'Hasiera',
        'nav_tasks': 'Izapideak',
        'nav_health': 'Osasuna',
        'nav_profile': 'Nire Profila'
    }
};

class LanguageManager {
    constructor() {
        this.current = localStorage.getItem('baserri_lang') || 'es';
    }

    set(lang) {
        this.current = lang;
        localStorage.setItem('baserri_lang', lang);
        this.apply();
        if (window.baserriVoice) window.baserriVoice.setLanguage(lang === 'eu' ? 'eu-ES' : 'es-ES');
    }

    apply() {
        // Simple DOM replacement logic
        const strings = I18N[this.current];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (strings[key]) el.innerText = strings[key];
        });
    }
}

window.baserriLang = new LanguageManager();
window.addEventListener('load', () => window.baserriLang.apply());
