// Smart FeedCheck - Hands-free Voice Assistant Service

class VoiceService {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    const saved = localStorage.getItem('smart_feedcheck_voice');
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    localStorage.setItem('smart_feedcheck_voice', String(enable));
    if (!enable) {
      this.cancel();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public speak(text: string, lang: 'en' | 'hi' = 'en') {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Clear, measured pace for farm field conditions
      utterance.pitch = 1.0;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error handled gracefully without crashing
    }
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voice = new VoiceService();
