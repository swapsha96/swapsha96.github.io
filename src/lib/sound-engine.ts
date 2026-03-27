import { FRAME_DURATION } from './constants';

export function updateMuteIcon() {
    const muteIcon = document.getElementById('hud-mute') as HTMLElement | null;
    if (!muteIcon) return;
    muteIcon.style.visibility = SoundEngine.muted ? 'visible' : 'hidden';
}

export const SoundEngine = {
    ctx: null as AudioContext | null,
    muted: localStorage.getItem('gb_muted') === 'true',

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
        } else if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('gb_muted', String(this.muted));
        updateMuteIcon();
        return this.muted;
    },

    playClick(duration = 0.015, vol = 0.25) {
        if (!this.ctx || this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 4000;
            filter.Q.value = 3;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch (e) { console.error('Audio error', e); }
    },

    playTone(freq: number, type: OscillatorType, duration: number, vol = 0.25) {
        if (!this.ctx || this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { console.error('Audio error', e); }
    },

    hover() {
        this.playTone(440, 'sine', (FRAME_DURATION * 6) / 1000, 0.15);
    },

    select() {
        this.playTone(660, 'square', (FRAME_DURATION * 6) / 1000, 0.15);
        setTimeout(() => this.playTone(880, 'square', (FRAME_DURATION * 12) / 1000, 0.15), FRAME_DURATION * 6);
    },

    back() {
        this.playTone(150, 'sawtooth', (FRAME_DURATION * 9) / 1000, 0.15);
    },

    switch() {
        this.playTone(300, 'triangle', (FRAME_DURATION * 6) / 1000, 0.15);
    }
};
