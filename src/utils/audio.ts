class AudioEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume() {
    return this.volume;
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gainNode.gain.setValueAtTime(0, this.ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.12 * this.volume, this.ctx.currentTime + delay + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn('Audio playTone failed:', e);
    }
  }

  playClick() {
    this.playTone(880, 'sine', 0.06);
  }

  playCorrect() {
    // Happy upward major arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.25, idx * 0.08);
    });
  }

  playWrong() {
    // Low buzzer style sound
    this.playTone(180, 'triangle', 0.35, 0);
    this.playTone(150, 'triangle', 0.35, 0.06);
  }

  playLevelUp() {
    // Triumph arpeggio
    const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.35, idx * 0.06);
    });
  }

  playAchievement() {
    // Upbeat sparkling fanfare
    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
    const delays = [0, 0.08, 0.16, 0.24, 0.36, 0.48];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.3, delays[idx]);
    });
  }
}

export const audioEngine = new AudioEngine();
