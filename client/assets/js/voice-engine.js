/**
 * BASERRI-ADITU Cognitive Voice Engine v3.0
 * Disruptive Zero-UI Assistant with Multilingual Dialogue Support.
 */

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isRecording = false;
        this.language = localStorage.getItem('baserri_lang') || 'es-ES';
        this.state = 'IDLE'; // IDLE, WAITING_FOR_CROTAL, WAITING_FOR_CONFIRMATION
        this.lastIntent = null;
        this.pendingData = null;
        
        this.setupRecognition();
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI(true);
            console.log(`[Voice] Model listening in ${this.language}`);
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.updateUI(false);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processDialogue(transcript);
        };

        this.recognition.onerror = (e) => {
            console.error("[Voice] Error:", e.error);
            this.isRecording = false;
            this.updateUI(false);
            if (e.error === 'network') {
                this.speak(this.language === 'eu-ES' ? "Konexio arazoa. Geroago saiatuko naiz." : "Problema de conexión. Lo intentaré más tarde.");
            }
        };
    }

    speak(text) {
        if (this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synth.speak(utterance);
    }

    toggle() {
        if (!this.recognition) return;
        try {
            if (this.isRecording) this.recognition.stop();
            else this.recognition.start();
        } catch (e) {
            this.isRecording = false;
            this.updateUI(false);
        }
    }

    updateUI(active) {
        const btn = document.getElementById('mic-btn');
        if (btn) btn.classList.toggle('active', active);
    }

    async processDialogue(text) {
        console.log(`[Cognitive] Processing (${this.state}):`, text);

        // 1. CONFIRMATION STATE
        if (this.state === 'WAITING_FOR_CONFIRMATION') {
            if (text.includes("sí") || text.includes("bai") || text.includes("confirmar") || text.includes("baietza")) {
                this.executeAction();
            } else {
                this.speak(this.language === 'eu-ES' ? "Ados, ezeztatuko dut." : "De acuerdo, cancelaré el trámite.");
                this.resetState();
            }
            return;
        }

        // 2. IDLE/INTENT STATE
        const intents = this.detectIntents(text);
        
        if (intents.birth) {
            this.handleBirth(text);
        } else if (intents.movement) {
            this.handleMovement(text);
        } else if (intents.health) {
            this.handleHealth(text);
        } else {
            this.speak(this.language === 'eu-ES' ? "Zer kudeaketa behar duzu?" : "¿Qué gestión necesitas realizar?");
        }
    }

    detectIntents(text) {
        return {
            birth: (text.includes("nacido") || text.includes("ternero") || text.includes("jaiotza") || text.includes("txahal")),
            movement: (text.includes("mover") || text.includes("guía") || text.includes("mugi") || text.includes("garraio")),
            health: (text.includes("sanidad") || text.includes("enfermo") || text.includes("albaitari") || text.includes("osasuna"))
        };
    }

    handleBirth(text) {
        const isEuskara = this.language === 'eu-ES';
        this.lastIntent = 'BIRTH';
        this.pendingData = { date: new Date().toISOString() };
        this.state = 'WAITING_FOR_CONFIRMATION';
        
        const msg = isEuskara ? 
            "Jaiotza erregistroa prestatu dut MUGIDE sistemarako. Konfirmatzen duzu?" : 
            "He preparado el registro de nacimiento para el sistema MUGIDE. ¿Confirmas?";
        this.speak(msg);
    }

    handleMovement(text) {
        const isEuskara = this.language === 'eu-ES';
        const crotalMatch = text.match(/es\d{12}/i);
        
        if (!crotalMatch) {
            this.speak(isEuskara ? "Mesedez, esan crotal zenbakia." : "Por favor, dime el número de crotal.");
            this.state = 'WAITING_FOR_CROTAL';
            this.lastIntent = 'MOVEMENT';
            return;
        }

        this.pendingData = { crotal: crotalMatch[0].toUpperCase() };
        this.lastIntent = 'MOVEMENT';
        this.state = 'WAITING_FOR_CONFIRMATION';
        
        const msg = isEuskara ? 
            `Irteera gida prestatu dut ${this.pendingData.crotal} animaliarentzat. Konfirmatzen duzu?` : 
            `He preparado la guía de salida para el animal ${this.pendingData.crotal}. ¿Confirmas la operación?`;
        this.speak(msg);
    }

    async executeAction() {
        const isEuskara = this.language === 'eu-ES';
        
        // Pass to App Bridge (which handles Trust Layer & Sync)
        if (window.baserriApp) {
            await window.baserriApp.processVoiceAction(this.lastIntent, this.pendingData);
        } else {
            this.speak(isEuskara ? "Errorea aplikazioan." : "Error en la aplicación.");
        }
        
        this.resetState();
    }

    resetState() {
        this.state = 'IDLE';
        this.lastIntent = null;
        this.pendingData = null;
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) this.recognition.lang = lang;
        localStorage.setItem('baserri_lang', lang);
    }
}

window.baserriVoice = new VoiceEngine();
