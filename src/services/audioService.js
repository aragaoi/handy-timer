class AudioService {
  constructor() {
    this.audioCtx = null;
  }

  ensureContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  ping(volume = 0.4) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);

    const attack = 0.005;
    const decay = 0.18;
    const sustain = 0.0001;
    const release = 0.12;

    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(sustain, 0.001),
      now + attack + decay
    );
    gain.gain.setTargetAtTime(0.00001, now + attack + decay, release);

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.setValueAtTime(660, now);
    o1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    o2.frequency.setValueAtTime(1320, now);
    o2.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.35, now);
    o1.connect(gain);
    o2.connect(g2);
    g2.connect(gain);
    gain.connect(ctx.destination);
    o1.start(now);
    o2.start(now);
    o1.stop(now + 0.35);
    o2.stop(now + 0.18);
  }

  pingAlt(volume = 0.45) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);

    const attack = 0.004;
    const decay = 0.12;
    const sustain = 0.0001;
    const release = 0.1;

    g.gain.linearRampToValueAtTime(volume, now + attack);
    g.gain.exponentialRampToValueAtTime(
      Math.max(sustain, 0.001),
      now + attack + decay
    );
    g.gain.setTargetAtTime(0.00001, now + attack + decay, release);

    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(520, now);
    o.frequency.exponentialRampToValueAtTime(740, now + 0.1);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.22);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, now + 0.22);
    g2.gain.linearRampToValueAtTime(volume * 0.85, now + 0.22 + attack);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + attack + decay);
    o2.type = "sine";
    o2.frequency.setValueAtTime(780, now + 0.22);
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.start(now + 0.22);
    o2.stop(now + 0.22 + 0.2);
  }

  pingFinal(volume = 0.6) {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(volume, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(440, now + 0.5);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.6);
  }
}

export default new AudioService();
