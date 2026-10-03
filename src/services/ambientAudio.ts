// Synthesizer for ambient nature sounds using the Web Audio API

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;

  private windNode: AudioNode | null = null;
  private windGain: GainNode | null = null;

  private campfireNode: AudioNode | null = null;
  private campfireGain: GainNode | null = null;

  private oceanNode: AudioNode | null = null;
  private oceanGain: GainNode | null = null;

  private masterGain: GainNode | null = null;
  private isInitialized = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create White/Pink Noise Buffer
  private createNoiseBuffer(durationSeconds = 5): AudioBuffer {
    const bufferSize = this.ctx!.sampleRate * durationSeconds;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. Rain Synthesizer
  public setRain(active: boolean, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (active) {
      if (!this.rainNode) {
        const noiseBuffer = this.createNoiseBuffer(5);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(highpass);
        highpass.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);

        noiseSource.start();
        this.rainNode = noiseSource;
      } else if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 0.1);
      }
    } else {
      if (this.rainNode) {
        try {
          (this.rainNode as AudioBufferSourceNode).stop();
        } catch {}
        this.rainNode.disconnect();
        this.rainNode = null;
        this.rainGain = null;
      }
    }
  }

  // 2. Wind Synthesizer
  public setWind(active: boolean, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (active) {
      if (!this.windNode) {
        const noiseBuffer = this.createNoiseBuffer(6);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        // Slow LFO to modulate wind gusts
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(volume * 0.6, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        noiseSource.start();
        this.windNode = noiseSource;
      } else if (this.windGain) {
        this.windGain.gain.setTargetAtTime(volume * 0.6, this.ctx.currentTime, 0.1);
      }
    } else {
      if (this.windNode) {
        try {
          (this.windNode as AudioBufferSourceNode).stop();
        } catch {}
        this.windNode.disconnect();
        this.windNode = null;
        this.windGain = null;
      }
    }
  }

  // 3. Campfire Synthesizer
  public setCampfire(active: boolean, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (active) {
      if (!this.campfireNode) {
        const noiseBuffer = this.createNoiseBuffer(4);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        this.campfireGain = this.ctx.createGain();
        this.campfireGain.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(this.campfireGain);
        this.campfireGain.connect(this.masterGain);

        noiseSource.start();
        this.campfireNode = noiseSource;
      } else if (this.campfireGain) {
        this.campfireGain.gain.setTargetAtTime(volume * 0.45, this.ctx.currentTime, 0.1);
      }
    } else {
      if (this.campfireNode) {
        try {
          (this.campfireNode as AudioBufferSourceNode).stop();
        } catch {}
        this.campfireNode.disconnect();
        this.campfireNode = null;
        this.campfireGain = null;
      }
    }
  }

  // 4. Ocean Waves Synthesizer
  public setOcean(active: boolean, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (active) {
      if (!this.oceanNode) {
        const noiseBuffer = this.createNoiseBuffer(8);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);

        // LFO for wave surges
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10s wave period
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.oceanGain = this.ctx.createGain();
        this.oceanGain.gain.setValueAtTime(volume * 0.55, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(this.oceanGain);
        this.oceanGain.connect(this.masterGain);

        noiseSource.start();
        this.oceanNode = noiseSource;
      } else if (this.oceanGain) {
        this.oceanGain.gain.setTargetAtTime(volume * 0.55, this.ctx.currentTime, 0.1);
      }
    } else {
      if (this.oceanNode) {
        try {
          (this.oceanNode as AudioBufferSourceNode).stop();
        } catch {}
        this.oceanNode.disconnect();
        this.oceanNode = null;
        this.oceanGain = null;
      }
    }
  }

  public stopAll() {
    this.setRain(false);
    this.setWind(false);
    this.setCampfire(false);
    this.setOcean(false);
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
