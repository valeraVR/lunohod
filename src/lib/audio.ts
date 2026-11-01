type SoundName =
  | "ui"
  | "start"
  | "step"
  | "shard"
  | "star"
  | "void"
  | "danger"
  | "gameover"
  | "blocked"
  | "pause";

type ToneOptions = {
  freq: number;
  to?: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  attack?: number;
};

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.26, this.ctx.currentTime, 0.03);
    }
  }

  isMuted() {
    return this.muted;
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.26;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(options: ToneOptions) {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.muted) return;
    const {
      freq,
      to,
      duration = 0.18,
      type = "sine",
      gain = 0.2,
      delay = 0,
      attack = 0.012,
    } = options;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to && to !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration);
    }
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.linearRampToValueAtTime(gain, start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  }

  private noise(duration = 0.12, gain = 0.08, frequency = 900) {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.muted) return;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    const amp = ctx.createGain();
    amp.gain.value = gain;
    source.connect(filter);
    filter.connect(amp);
    amp.connect(this.master);
    source.start();
  }

  play(name: SoundName) {
    if (this.muted) return;
    switch (name) {
      case "ui":
        this.tone({ freq: 620, to: 540, duration: 0.07, type: "triangle", gain: 0.1 });
        break;
      case "start":
        this.tone({ freq: 392, duration: 0.5, type: "sine", gain: 0.13 });
        this.tone({ freq: 523.25, duration: 0.55, type: "sine", gain: 0.11, delay: 0.08 });
        this.tone({ freq: 659.25, duration: 0.7, type: "triangle", gain: 0.08, delay: 0.16 });
        break;
      case "step":
        this.tone({ freq: 190, to: 140, duration: 0.09, type: "triangle", gain: 0.08 });
        this.noise(0.05, 0.03, 650);
        break;
      case "shard":
        this.tone({ freq: 784, duration: 0.16, type: "sine", gain: 0.15 });
        this.tone({ freq: 1046.5, duration: 0.2, type: "sine", gain: 0.11, delay: 0.06 });
        this.tone({ freq: 1568, duration: 0.26, type: "triangle", gain: 0.07, delay: 0.12 });
        break;
      case "star":
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) =>
          this.tone({
            freq,
            duration: 0.4,
            type: i > 2 ? "triangle" : "sine",
            gain: 0.12 - i * 0.012,
            delay: i * 0.055,
          })
        );
        break;
      case "void":
        this.noise(0.22, 0.11, 420);
        this.tone({ freq: 120, to: 70, duration: 0.3, type: "sine", gain: 0.1 });
        break;
      case "danger":
        this.tone({ freq: 130, to: 100, duration: 0.2, type: "sawtooth", gain: 0.07 });
        this.tone({ freq: 130, to: 96, duration: 0.24, type: "sawtooth", gain: 0.06, delay: 0.18 });
        break;
      case "gameover":
        this.tone({ freq: 293.66, to: 277, duration: 0.5, type: "triangle", gain: 0.12 });
        this.tone({ freq: 220, duration: 0.7, type: "triangle", gain: 0.1, delay: 0.16 });
        this.tone({ freq: 164.81, to: 110, duration: 1.1, type: "sine", gain: 0.11, delay: 0.34 });
        this.noise(0.7, 0.05, 300);
        break;
      case "blocked":
        this.tone({ freq: 140, to: 110, duration: 0.1, type: "square", gain: 0.04 });
        break;
      case "pause":
        this.tone({ freq: 440, duration: 0.12, type: "sine", gain: 0.08 });
        this.tone({ freq: 330, duration: 0.16, type: "sine", gain: 0.06, delay: 0.09 });
        break;
    }
  }
}

export const audio = new GameAudio();
export type { SoundName };
