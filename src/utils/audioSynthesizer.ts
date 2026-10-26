/**
 * Web Audio Procedural Sound & Beat Synthesizer for AutoCash AI Video Engine
 * Zero dependencies, royalty-free, works completely offline in any modern browser.
 */

export class VideoAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: number | null = null;
  private currentTrack: string = 'cyberpunk_synth';
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.createMediaStreamDestination) {
          this.destinationNode = this.ctx.createMediaStreamDestination();
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioStream(): MediaStream | null {
    this.init();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public start(track: string = 'cyberpunk_synth') {
    this.init();
    if (!this.ctx) return;
    this.currentTrack = track;
    this.isPlaying = true;

    // Tempo in BPM
    let bpm = 120;
    if (track === 'high_energy_trap') bpm = 140;
    if (track === 'lofi_chill') bpm = 85;
    if (track === 'cinematic_epic') bpm = 100;

    const intervalMs = (60 / bpm / 2) * 1000; // eighth-note clock
    let step = 0;

    this.timer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.playStep(step, track);
      step = (step + 1) % 16;
    }, intervalMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private playStep(step: number, track: string) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Connect to both speakers and recorder stream
    const connectOut = (node: AudioNode) => {
      node.connect(this.ctx!.destination);
      if (this.destinationNode) {
        node.connect(this.destinationNode);
      }
    };

    // Kick on steps 0, 4, 8, 12
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      connectOut(gain);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    // Hi-hat on every odd step
    if (step % 2 === 1) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(8000, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      connectOut(gain);
      osc.start(now);
      osc.stop(now + 0.06);
    }

    // Bass / Synth chords
    if (step === 0 || step === 6 || step === 10) {
      const freqs = [110, 138.59, 164.81]; // A minor chord notes
      const freq = freqs[Math.floor(step / 4) % freqs.length];

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = track === 'cyberpunk_synth' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.4);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      connectOut(gain);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  }
}
