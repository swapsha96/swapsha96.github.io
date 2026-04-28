import { FRAME_DURATION } from './constants';
import { getStoredBoolean, setStoredValue } from './storage';

const MUTE_STORAGE_KEY = 'gb_muted';

export function updateMuteIcon() {
  const muteIcon = document.getElementById('hud-mute') as HTMLElement | null;
  if (!muteIcon) return;
  muteIcon.style.visibility = SoundEngine.muted ? 'visible' : 'hidden';
}

function withActiveAudioContext(
  ctx: AudioContext | null,
  callback: (audioContext: AudioContext) => void,
) {
  if (!ctx || SoundEngine.muted) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    callback(ctx);
  } catch (e) {
    console.error('Audio error', e);
  }
}

function getAudioContextConstructor() {
  return window.AudioContext || (window as any).webkitAudioContext;
}

export const SoundEngine = {
  ctx: null as AudioContext | null,
  muted: getStoredBoolean(MUTE_STORAGE_KEY, false),

  init() {
    if (!this.ctx) {
      const AudioContextConstructor = getAudioContextConstructor();
      this.ctx = new AudioContextConstructor();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    setStoredValue(MUTE_STORAGE_KEY, String(this.muted));
    updateMuteIcon();
    return this.muted;
  },

  playClick(duration = 0.015, vol = 0.25) {
    withActiveAudioContext(this.ctx, (ctx) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4000;
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    });
  },

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.25) {
    withActiveAudioContext(this.ctx, (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
  },

  hover() {
    this.playTone(440, 'sine', (FRAME_DURATION * 6) / 1000, 0.15);
  },

  select() {
    this.playTone(660, 'square', (FRAME_DURATION * 6) / 1000, 0.15);
    setTimeout(
      () => this.playTone(880, 'square', (FRAME_DURATION * 12) / 1000, 0.15),
      FRAME_DURATION * 6,
    );
  },

  back() {
    this.playTone(150, 'sawtooth', (FRAME_DURATION * 9) / 1000, 0.15);
  },

  switch() {
    this.playTone(300, 'triangle', (FRAME_DURATION * 6) / 1000, 0.15);
  },
};
