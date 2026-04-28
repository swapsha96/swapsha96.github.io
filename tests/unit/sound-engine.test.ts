import { describe, it, expect, beforeEach } from 'vitest';
import { SoundEngine, updateMuteIcon } from '../../src/lib/sound-engine';

describe('SoundEngine', () => {
  it('exports expected methods', () => {
    expect(typeof SoundEngine.init).toBe('function');
    expect(typeof SoundEngine.playClick).toBe('function');
    expect(typeof SoundEngine.playTone).toBe('function');
    expect(typeof SoundEngine.select).toBe('function');
    expect(typeof SoundEngine.switch).toBe('function');
    expect(typeof SoundEngine.toggleMute).toBe('function');
  });

  it('does not throw when called without AudioContext', () => {
    expect(() => SoundEngine.playClick()).not.toThrow();
    expect(() => SoundEngine.playTone(440, 'sine', 0.1)).not.toThrow();
    expect(() => SoundEngine.select()).not.toThrow();
    expect(() => SoundEngine.switch()).not.toThrow();
  });

  it('toggleMute flips isMuted and returns state', () => {
    // Start from known state - call toggleMute twice to verify it toggles
    const first = SoundEngine.toggleMute();
    const second = SoundEngine.toggleMute();
    expect(first).not.toBe(second);
  });
});

describe('updateMuteIcon', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('does not throw when element is missing', () => {
    expect(() => updateMuteIcon()).not.toThrow();
  });

  it('updates icon visibility when element exists', () => {
    const el = document.createElement('span');
    el.id = 'hud-mute';
    document.body.appendChild(el);

    updateMuteIcon();
    // Should set visibility based on muted state
    expect(['visible', 'hidden']).toContain(el.style.visibility);
  });
});
