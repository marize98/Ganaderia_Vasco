/**
 * BASERRI-ADITU Voice Engine
 * Low-friction natural language processor for agriculture.
 */

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isRecording = false;
        this.language = 'es-ES'; // Default to Spanish, supports 'eu-ES'
        this.setupRecognition();
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = this.language;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processCommand(transcript);
        };
    }

    updateUI(active) {
        const btn = document.getElementById('voice-trigger');
        if (active) {
            btn.classList.add('active');
            this.speak("Te escucho...", true);
        } else {
            btn.classList.remove('active');
        }
    }

    async processCommand(text) {
        console.log("[NLP] Analizando intención:", text);
        
        // Entity Extraction (Regex-based NLP)
        const crotalMatch = text.match(/es\d{12}/i);
        const crotal = crotalMatch ? crotalMatch[0].toUpperCase() : null;

        if (text.includes("guía") || text.includes("mover") || text.includes("traslado")) {
            if (!crotal) {
                this.speak("He detectado que quieres una guía. Por favor, dime el número de crotal del animal.");
                return;
            }
            this.speak(`Validando guía para el crotal ${crotal.split('').join(' ')} con la Capa de Confianza...`);
            const validation = await window.baserriConfianza.validateMovement(crotal, "Matadero");
            if (validation.valid) {
                this.speak("Todo en orden. Solicitando guía oficial a la sede electrónica.");
                await window.baserriTramites.createGuia("Matadero", crotal);
            } else {
                this.speak(validation.message);
            }
        } else if (text.includes("nacimiento") || text.includes("parido") || text.includes("ternero")) {
            this.speak("Entendido, registro de nacimiento. ¿Dime el crotal de la madre?");
        } else if (crotal && (text.includes("madre") || text.includes("es"))) {
            this.speak(`Verificando madre ${crotal.split('').join(' ')} en el sistema...`);
            const validation = await window.baserriConfianza.validateBirth(crotal);
            if (validation.valid) {
                this.speak("La madre es válida. He registrado el nacimiento en MUGIDE exitosamente.");
                await window.baserriTramites.registerBirth(crotal);
            } else {
                this.speak(validation.message);
            }
        } else {
            this.speak("No he entendido bien. Prueba con: 'Solicitar guía para el crotal ES seguido de doce números'.");
        }
    }

    speak(text, lowVolume = false) {
        if (this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = lowVolume ? 0.3 : 1.0;
        this.synth.speak(utterance);
    }

    toggle() {
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) this.recognition.lang = lang;
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.baserriVoice = new VoiceEngine();
    const trigger = document.getElementById('voice-trigger');
    if (trigger) {
        trigger.addEventListener('click', () => window.baserriVoice.toggle());
    }
});
