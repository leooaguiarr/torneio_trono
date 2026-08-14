/**
 * Web Audio API synthesized sound effects and Haptic Feedback
 * Includes realistic, hilarious synthesized fart sound generator with multiple comical variations
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function triggerHaptic(pattern: number | number[] = 25) {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

/**
 * Creates a soft distortion curve for organic, raspy fart harmonics
 */
function makeDistortionCurve(amount: number = 20): Float32Array {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/**
 * Play a hilarious synthesized fart sound with multiple comical variations!
 * Matches effort level if provided, or picks a random funny fart style.
 */
export function playFartSound(muted: boolean = false, effortLevel?: number) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const style = effortLevel ? effortLevel : Math.floor(Math.random() * 5) + 1;

    // Vibration feedback tailored to the fart
    switch (style) {
      case 1:
        triggerHaptic([20, 15, 30]);
        break;
      case 2:
        triggerHaptic([35, 20, 45]);
        break;
      case 4:
        triggerHaptic([50, 25, 60, 20, 40]);
        break;
      case 5:
        triggerHaptic([70, 30, 80, 20, 90, 30, 60]);
        break;
      default:
        triggerHaptic([40, 25, 50, 30]);
    }

    if (style === 1) {
      // Variation 1: Squeaky "Pfeeeet" fart
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.22);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.22);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

    } else if (style === 2) {
      // Variation 2: Quick Rip "Prrrt"
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.35);

      // Fast flutter / tremolo (flapping effect)
      lfo.frequency.setValueAtTime(28, now);
      lfo.frequency.linearRampToValueAtTime(18, now + 0.35);
      lfoGain.gain.setValueAtTime(25, now);

      lfo.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.linearRampToValueAtTime(220, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.4);
      lfo.stop(now + 0.4);

    } else if (style === 3) {
      // Variation 3: Classic hearty rumble rip "BRRRRRR-T"
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const distortion = ctx.createWaveShaper();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(115, now);
      osc1.frequency.linearRampToValueAtTime(55, now + 0.52);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(57, now);
      osc2.frequency.linearRampToValueAtTime(30, now + 0.52);

      lfo.frequency.setValueAtTime(32, now);
      lfo.frequency.linearRampToValueAtTime(14, now + 0.52);
      lfoGain.gain.setValueAtTime(30, now);

      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      distortion.curve = makeDistortionCurve(15);
      distortion.oversample = '2x';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.linearRampToValueAtTime(180, now + 0.52);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(distortion);
      osc2.connect(distortion);
      distortion.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);
      osc1.stop(now + 0.56);
      osc2.stop(now + 0.56);
      lfo.stop(now + 0.56);

    } else if (style === 4) {
      // Variation 4: Wet & Bubbly raspy sputter "PLUP-BRRR-T-T"
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Initial bubble pop
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(180, now);
      popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      popGain.gain.setValueAtTime(0.3, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(now);
      popOsc.stop(now + 0.09);

      // Main wet rasp
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now + 0.05);
      osc.frequency.linearRampToValueAtTime(45, now + 0.65);

      lfo.frequency.setValueAtTime(36, now + 0.05);
      lfo.frequency.linearRampToValueAtTime(16, now + 0.65);
      lfoGain.gain.setValueAtTime(35, now + 0.05);

      lfo.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now + 0.05);
      filter.frequency.linearRampToValueAtTime(160, now + 0.65);
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.48, now + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.05);
      lfo.start(now + 0.05);
      osc.stop(now + 0.7);
      lfo.stop(now + 0.7);

    } else {
      // Variation 5: The Apocalyptic Thunder Fart (Level 5 Maximum Effort)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const distortion = ctx.createWaveShaper();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.85);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(70, now);
      osc2.frequency.exponentialRampToValueAtTime(25, now + 0.85);

      lfo.frequency.setValueAtTime(38, now);
      lfo.frequency.linearRampToValueAtTime(10, now + 0.85);
      lfoGain.gain.setValueAtTime(45, now);

      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      distortion.curve = makeDistortionCurve(25);
      distortion.oversample = '2x';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.85);
      filter.Q.value = 2;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(distortion);
      osc2.connect(distortion);
      distortion.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);
      osc1.stop(now + 0.92);
      osc2.stop(now + 0.92);
      lfo.stop(now + 0.92);
    }
  } catch (err) {
    console.error('Audio synthesis error:', err);
  }
}

/**
 * Fanfare sound for special royal celebrations
 */
export function playSuccessSound(muted: boolean = false) {
  triggerHaptic([30, 40, 50]);
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Play triumphant 4-tone royal fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  } catch {
    // Graceful fallback
  }
}

export function playPopSound(muted: boolean = false) {
  triggerHaptic(15);
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // ignore
  }
}

export function playFlushSound(muted: boolean = false) {
  triggerHaptic([40, 30, 40]);
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Generate white noise whoosh simulating flush
    const bufferSize = Math.floor(ctx.sampleRate * 0.85);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.75);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.85);
  } catch {
    // ignore
  }
}
