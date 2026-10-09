/**
 * Quick-commerce Sound Alert Generator using Web Audio API
 * Zero external audio files, zero network latency, 100% reliable across all browsers.
 */
class SoundAlerts {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('[SoundAlerts] AudioContext initialization failed:', e);
      return null;
    }
  }

  /**
   * Unlock AudioContext on first user interaction so sounds play seamlessly on mobile/browsers.
   */
  unlockAudio() {
    if (this.isUnlocked || typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        this.isUnlocked = true;
      }
    } catch {}
  }

  /**
   * Psychological Welcome Chime (Swiggy / Blinkit style signature welcome)
   * A warm, lush 3-chord harmonic shimmer (F5 -> A5 -> C6) with soft acoustic decay.
   */
  playWelcomeChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 698.46, time: 0.0, dur: 0.45 }, // F5
      { freq: 880.0, time: 0.1, dur: 0.55 },  // A5
      { freq: 1046.5, time: 0.22, dur: 0.8 }, // C6 - high celebratory bell
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.4, now + n.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * APK Download / VIP Pass Chime
   * High-tech energetic double swoop and bright chime (E5 -> G#5 -> B5).
   */
  playApkInstallChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.35 }, // E5
      { freq: 830.61, time: 0.08, dur: 0.4 }, // G#5
      { freq: 987.77, time: 0.16, dur: 0.7 }, // B5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.45, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * Order Confirmed Chime
   * Crisp, confident two-tone bell (E5 -> B5) giving the user instant confidence.
   */
  playOrderConfirmedChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bell 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Bell 2: B5 (high reassurance ping)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.6, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  }

  /**
   * Order Packed Chime
   * Crisp acoustic box snap + bright ring.
   */
  playPackedChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Snap transient
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Chime resonance: F#5 (739.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(739.99, now + 0.06);
    gain2.gain.setValueAtTime(0, now + 0.06);
    gain2.gain.linearRampToValueAtTime(0.5, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.55);
  }

  /**
   * Out for Delivery Chime
   * Accelerating high-tech bike swoosh + ring (D5 -> G5 -> D6).
   */
  playOutForDeliveryChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0.0, dur: 0.25 }, // D5
      { freq: 783.99, time: 0.09, dur: 0.35 }, // G5
      { freq: 1174.66, time: 0.18, dur: 0.7 }, // D6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.45, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * Delivered Celebration Chime
   * Triumphant 4-tone major chord sparkle (C5 -> E5 -> G5 -> C6).
   */
  playDeliveredChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  /**
   * Rider Delivery Task / Order Assignment Chime
   * Classic quick-commerce high-contrast two-tone chime (D5 -> A5)
   */
  playRiderAssignmentChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Tone 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.45, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: A5 (880 Hz) - sharp bell accent
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.55, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  }

  /**
   * Three-tone celebratory chime when Admin grants Rider/Admin rights
   * (C5 -> E5 -> G5)
   */
  playRoleGrantedChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.11;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * Crisp ping for order updates and admin alerts
   */
  playOrderAlertChime() {
    this.playOrderConfirmedChime();
  }
}

export const soundAlerts = new SoundAlerts();
