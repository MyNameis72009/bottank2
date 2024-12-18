import axios from 'axios';

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.speaking = false;
    this.currentAudio = null;

    // Initialize voices
    this.initVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.initVoices.bind(this);
    }
  }

  initVoices() {
    this.voices = this.synth.getVoices();
    // Prefer a male voice for the investor
    this.selectedVoice = this.voices.find(
      voice => 
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Google US English Male') ||
        voice.name.includes('en-US Male') ||
        voice.name.includes('Daniel')
    ) || this.voices.find(voice => voice.lang === 'en-US') || this.voices[0];
  }

  async speak(text) {
    // Stop any current speech
    this.stop();

    // Use Web Speech API directly for better reliability
    this.speakFallback(text);
  }

  speakFallback(text) {
    if (!this.selectedVoice) {
      this.initVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.speaking = true;
    };

    utterance.onend = () => {
      this.speaking = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.speaking = false;
    };

    // Chrome bug workaround: reset synthesis if it gets stuck
    setTimeout(() => {
      if (this.speaking && !this.synth.speaking) {
        this.speaking = false;
      }
    }, 10000);

    this.synth.speak(utterance);
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.speaking = false;
    this.synth.cancel();
  }

  isSpeaking() {
    return this.speaking;
  }
}

export default new SpeechService();
