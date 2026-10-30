/**
 * Original System sounds, synthesized with WebAudio: no files to download and
 * nothing sampled from the series. Muted until the visitor turns sound on;
 * the AudioContext is only created inside that click, which satisfies
 * browser autoplay rules.
 */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;

function audio() {
  if (!enabled || typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.5;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 6;
    out.connect(limiter);
    limiter.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) audio();
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  at?: number;
  dur?: number;
  gain?: number;
  attack?: number;
  glideTo?: number;
  dest?: AudioNode;
}

function tone(c: AudioContext, o: ToneOpts) {
  const t = c.currentTime + (o.at ?? 0);
  const dur = o.dur ?? 0.6;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.2, t + (o.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(o.dest ?? out!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noiseSweep(
  c: AudioContext,
  o: {
    at?: number;
    dur: number;
    gain: number;
    type: BiquadFilterType;
    from: number;
    to: number;
    q?: number;
    attack?: number;
  },
) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + (o.at ?? 0);
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.Q.value = o.q ?? 1;
  f.frequency.setValueAtTime(o.from, t);
  f.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain, t + (o.attack ?? 0.04));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(f).connect(g).connect(out!);
  src.start(t);
  src.stop(t + o.dur + 0.05);
}

function lowpass(c: AudioContext, hz: number) {
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = hz;
  f.connect(out!);
  return f;
}

export const sfx = {
  /** A window materializes. */
  chime() {
    const c = audio();
    if (!c) return;
    tone(c, { freq: 880, dur: 0.9, gain: 0.16 });
    tone(c, { freq: 1318.5, at: 0.07, dur: 1.2, gain: 0.13 });
    tone(c, { freq: 2637, at: 0.07, dur: 0.5, gain: 0.025 });
    tone(c, { freq: 1760, type: "triangle", dur: 0.25, gain: 0.035 });
  },
  /** One step of the level count-up; pitch climbs with the level. */
  tick(level: number) {
    const c = audio();
    if (!c) return;
    tone(c, { freq: 440 * 2 ** (level / 20), type: "triangle", dur: 0.07, gain: 0.06 });
  },
  levelUp() {
    const c = audio();
    if (!c) return;
    [1046.5, 1318.5, 1568, 2093].forEach((freq, i) => {
      tone(c, { freq, type: "triangle", at: i * 0.07, dur: 0.6, gain: 0.1 });
      tone(c, { freq: freq / 2, at: i * 0.07, dur: 0.5, gain: 0.05 });
    });
  },
  /** A small confirmation, e.g. spending a point. */
  blip() {
    const c = audio();
    if (!c) return;
    tone(c, { freq: 1244.5, dur: 0.08, gain: 0.07 });
    tone(c, { freq: 1864.7, at: 0.04, dur: 0.1, gain: 0.04 });
  },
  warn() {
    const c = audio();
    if (!c) return;
    const f = lowpass(c, 1100);
    tone(c, { freq: 220, type: "square", dur: 0.14, gain: 0.07, dest: f });
    tone(c, { freq: 174.6, type: "square", at: 0.17, dur: 0.2, gain: 0.07, dest: f });
  },
  /** The red gate seals behind the visitor. */
  lock() {
    const c = audio();
    if (!c) return;
    tone(c, { freq: 82, glideTo: 38, dur: 0.6, gain: 0.45 });
    noiseSweep(c, { dur: 0.35, gain: 0.18, type: "lowpass", from: 900, to: 120 });
  },
  portal() {
    const c = audio();
    if (!c) return;
    noiseSweep(c, { dur: 1.25, gain: 0.16, type: "bandpass", from: 220, to: 2600, q: 2.5, attack: 0.5 });
    tone(c, { freq: 55, glideTo: 120, dur: 1.25, gain: 0.22, attack: 0.4 });
  },
  arise() {
    const c = audio();
    if (!c) return;
    tone(c, { freq: 110, glideTo: 36, dur: 1.8, gain: 0.55 });
    noiseSweep(c, { dur: 0.9, gain: 0.22, type: "lowpass", from: 600, to: 80 });
    const f = lowpass(c, 650);
    [73.4, 110, 146.8, 174.6].forEach((freq) =>
      tone(c, { freq, type: "sawtooth", at: 0.1, dur: 2.4, gain: 0.045, attack: 0.6, dest: f }),
    );
    tone(c, { freq: 1760, at: 0.4, dur: 1.4, gain: 0.025, attack: 0.3 });
  },
  complete() {
    const c = audio();
    if (!c) return;
    [784, 1046.5, 1318.5, 1568].forEach((freq, i) =>
      tone(c, { freq, type: "triangle", at: i * 0.09, dur: 0.5, gain: 0.1 }),
    );
    [1046.5, 1318.5, 1568, 2093].forEach((freq) =>
      tone(c, { freq, type: "triangle", at: 0.4, dur: 1.6, gain: 0.06, attack: 0.02 }),
    );
  },
};
