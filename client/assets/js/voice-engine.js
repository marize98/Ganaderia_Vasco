/**
 * BASERRI-ADITU Voice Engine v2.0
 * Robust state management for field environments.
 */

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isRecording = false;
        this.language = 'es-ES';
        this.setupRecognition();
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = this.language;

        this.recognition.onstart = () => {
            console.log("[Voice] Recording started");
            this.isRecording = true;
            this.updateUI(true);
        };

        this.recognition.onend = () => {
            console.log("[Voice] Recording ended");
            this.isRecording = false;
            this.updateUI(false);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("[Voice] Error:", event.error);
            this.isRecording = false;
            this.updateUI(false);
        };
    }

    toggle() {
        if (!this.recognition) return;
        
        try {
            if (this.isRecording) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        } catch (e) {
            console.warn("[Voice] State conflict, resetting:", e);
            this.isRecording = false;
            this.updateUI(false);
        }
    }

    speak(text) {
        if (this.synth.speaking) this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;
        utterance.rate = 0.9;
        this.synth.speak(utterance);
    }

    updateUI(active) {
        const btn = document.getElementById('mic-btn');
        if (btn) btn.classList.toggle('active', active);
    }

    async processCommand(text) {
        console.log("[NLP] Analyzing:", text);
        const crotalMatch = text.match(/es\d{12}/i);
        const crotal = crotalMatch ? crotalMatch[0].toUpperCase() : null;

        if (text.includes("guía") || text.includes("mover")) {
            if (!crotal) {
                this.speak("Dime el número de crotal para la guía.");
                return;
            }
            this.speak("Validando guía con la Capa de Confianza.");
            // ... logic
        } else {
            this.speak("¿Qué gestión necesitas realizar?");
        }
    }
}

window.baserriVoice = new VoiceEngine();
