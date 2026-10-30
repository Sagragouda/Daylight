/**
 * Synthesized Ambient Audio Generator using Web Audio API
 * Generates continuous soothing ambient soundscapes in-browser with 0 external asset dependencies.
 */

export type AmbientSoundType =
  | 'binaural'
  | 'noise'
  | 'rainfall'
  | 'cafe'
  | 'ocean'
  | 'office';

export interface SoundPreset {
  id: AmbientSoundType;
  name: string;
  description: string;
  gradient: string;
  iconBg: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'binaural',
    name: 'Binaural beats',
    description: '10 Hz Alpha waves for flow state and deep focus',
    gradient: 'from-amber-500 via-rose-500 to-emerald-500',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-emerald-400',
  },
  {
    id: 'noise',
    name: 'Noise',
    description: 'Soft velvet brown noise to mask environmental chatter',
    gradient: 'from-slate-600 via-slate-700 to-zinc-900',
    iconBg: 'bg-gradient-to-tr from-zinc-600 to-slate-800',
  },
  {
    id: 'rainfall',
    name: 'Rainfall',
    description: 'Gentle raindrops falling on lush forest foliage',
    gradient: 'from-emerald-700 via-teal-800 to-slate-900',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-800',
  },
  {
    id: 'cafe',
    name: 'Cafe music',
    description: 'Warm harmonic acoustic resonance and soft ambient air',
    gradient: 'from-amber-700 via-orange-800 to-stone-900',
    iconBg: 'bg-gradient-to-tr from-amber-600 to-stone-800',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Rhythmic ocean swells and calming coastline tides',
    gradient: 'from-blue-600 via-sky-700 to-indigo-950',
    iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-800',
  },
  {
    id: 'office',
    name: 'Office',
    description: 'Subtle low hum and peaceful library study atmosphere',
    gradient: 'from-slate-700 via-zinc-800 to-stone-900',
    iconBg: 'bg-gradient-to-tr from-slate-600 to-zinc-800',
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private currentType: AmbientSoundType | null = null;
  private currentVolume = 0.25;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(type: AmbientSoundType, volume = this.currentVolume) {
    this.stop();
    this.currentType = type;
    this.currentVolume = volume;

    try {
      const ctx = this.initContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      master.connect(ctx.destination);
      this.masterGain = master;

      switch (type) {
        case 'binaural':
          this.createBinauralBeats(ctx, master);
          break;
        case 'noise':
          this.createBrownNoise(ctx, master);
          break;
        case 'rainfall':
          this.createRainfall(ctx, master);
          break;
        case 'ocean':
          this.createOceanWaves(ctx, master);
          break;
        case 'cafe':
          this.createCafeAtmosphere(ctx, master);
          break;
        case 'office':
          this.createOfficeAtmosphere(ctx, master);
          break;
      }
    } catch (e) {
      console.warn('[AmbientSoundEngine] Audio generation warning:', e);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
    this.currentType = null;
  }

  public getCurrentType(): AmbientSoundType | null {
    return this.currentType;
  }

  // 1. Binaural Beats (216 Hz left, 226 Hz right -> 10 Hz Alpha frequency)
  private createBinauralBeats(ctx: AudioContext, destination: GainNode) {
    const merger = ctx.createChannelMerger(2);

    // Left channel carrier: 216 Hz
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, ctx.currentTime);

    const gainL = ctx.createGain();
    gainL.gain.setValueAtTime(0.5, ctx.currentTime);
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0); // Left channel

    // Right channel carrier: 226 Hz (10 Hz beat difference)
    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(226, ctx.currentTime);

    const gainR = ctx.createGain();
    gainR.gain.setValueAtTime(0.5, ctx.currentTime);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1); // Right channel

    // Sub-harmonic warm base drone (108 Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(108, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(destination);

    merger.connect(destination);

    oscL.start();
    oscR.start();
    subOsc.start();

    this.activeNodes.push(oscL, oscR, subOsc, gainL, gainR, subGain, merger);
  }

  // 2. Brown Noise (Calming velvet noise)
  private createBrownNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter);
  }

  // 3. Gentle Rainfall (Filtered noise with droplet frequencies)
  private createRainfall(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        data[i] = (b0 + b1 + b2) * 0.2;
      }
    }

    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;

    // Highpass to eliminate heavy mud
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(400, ctx.currentTime);

    // Soft lowpass for gentle rain
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, ctx.currentTime);

    rain.connect(hp);
    hp.connect(lp);
    lp.connect(destination);
    rain.start();

    this.activeNodes.push(rain, hp, lp);
  }

  // 4. Ocean Waves (LFO modulated swell)
  private createOceanWaves(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = data[i];
      data[i] *= 4.0;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter that sweeps like a breaking wave
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    // Gain node modulated by LFO (swell cycle: ~5 seconds)
    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.3, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5s wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(destination);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, swellGain, lfo, lfoGain);
  }

  // 5. Cafe Atmosphere (Warm harmonic chords + soft pink drone)
  private createCafeAtmosphere(ctx: AudioContext, destination: GainNode) {
    // Soft room drone
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.02;
      b1 = 0.95 * b1 + white * 0.04;
      data[i] = (b0 + b1) * 0.3;
    }

    const drone = ctx.createBufferSource();
    drone.buffer = buffer;
    drone.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(800, ctx.currentTime);

    // Gentle warm harmonic chord triad (Fmaj9: F3, A3, C4, E4)
    const chordFrequencies = [174.61, 220.0, 261.63, 329.63];
    const oscillators: OscillatorNode[] = [];
    const chordGain = ctx.createGain();
    chordGain.gain.setValueAtTime(0.08, ctx.currentTime);

    chordFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(chordGain);
      osc.start();
      oscillators.push(osc);
    });

    drone.connect(lp);
    lp.connect(destination);
    chordGain.connect(destination);
    drone.start();

    this.activeNodes.push(drone, lp, chordGain, ...oscillators);
  }

  // 6. Office Atmosphere (Low air circulation + subtle tone)
  private createOfficeAtmosphere(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.015 * white) / 1.015;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    const hum = ctx.createBufferSource();
    hum.buffer = buffer;
    hum.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    // Subtle 60Hz grounding harmonic
    const groundOsc = ctx.createOscillator();
    groundOsc.type = 'sine';
    groundOsc.frequency.setValueAtTime(60, ctx.currentTime);
    const groundGain = ctx.createGain();
    groundGain.gain.setValueAtTime(0.06, ctx.currentTime);
    groundOsc.connect(groundGain);
    groundGain.connect(destination);

    hum.connect(filter);
    filter.connect(destination);

    hum.start();
    groundOsc.start();

    this.activeNodes.push(hum, filter, groundOsc, groundGain);
  }
}

export const ambientSound = new AmbientSoundEngine();
