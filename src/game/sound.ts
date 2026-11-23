// Synthesized Web Audio sound engine for MU Online ARPG feedback
class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private pitchJitter(baseFreq: number): number {
    return baseFreq * (1 + (Math.random() * 0.16 - 0.08));
  }

  public playAttack(type: 'slash' | 'magic' | 'arrow' | 'heavy') {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(this.pitchJitter(240), now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.11);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'magic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.pitchJitter(520), now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.18);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (type === 'arrow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(this.pitchJitter(680), now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(this.pitchJitter(150), now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.24);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // ignore audio context errors
    }
  }

  public playHit(heavy = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = heavy ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(this.pitchJitter(heavy ? 130 : 195), now);
      osc.frequency.exponentialRampToValueAtTime(45, now + (heavy ? 0.15 : 0.08));
      gain.gain.setValueAtTime(heavy ? 0.12 : 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.16 : 0.09));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (heavy ? 0.16 : 0.09));
    } catch {}
  }

  public playJewelDrop() {
    // Classic MU high-pitched metallic jewel "cling!" chime
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [1318.5, 1760, 2637].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.09, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.34);
      });
    } catch {}
  }

  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.11, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
