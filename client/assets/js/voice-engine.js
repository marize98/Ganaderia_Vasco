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
        // Simple NLP Mapping for Agriculture
        if (text.includes("guía") || text.includes("mover") || text.includes("traslado")) {
            this.speak("Preparando solicitud de guía de traslado. ¿A qué matadero o destino?");
            // Logic for movement guide flow
        } else if (text.includes("nacimiento") || text.includes("parido") || text.includes("ternero")) {
            this.speak("Entendido, registrando nuevo nacimiento. ¿Cuál es el número de crotal de la madre?");
            // Logic for birth registration
        } else if (text.includes("censo") || text.includes("vaca") || text.includes("cuántos")) {
            const count = document.querySelector('h2').innerText; // Mock reading from UI
            this.speak(`Tienes ${count} animales registrados en tu censo actual.`);
        } else if (text.includes("sanidad") || text.includes("alerta") || text.includes("enfermo")) {
            this.speak("Hay una alerta por gripe aviar en tu zona. Las aves deben estar confinadas.");
        } else {
            this.speak("No he entendido bien. Por favor, dime si quieres registrar un nacimiento o pedir una guía.");
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
