"use client";

// Global singleton AudioContext and unlock state
let audioCtx = null;
let isAudioUnlocked = false;
let preloadedAudio = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

/**
 * Pre-warm and unlock audio capabilities on first user gesture (click, touch, keydown)
 * to comply with modern browser Autoplay policies (Chrome/Safari/Edge/Firefox).
 */
export const initAudioUnlock = () => {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = async () => {
    try {
      // 1. Unlock Web Audio Context
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        // Play 1-sample silent buffer to unlock the audio thread
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      // 2. Pre-warm HTML5 Audio element
      if (!preloadedAudio) {
        preloadedAudio = new Audio("/notification.wav");
        preloadedAudio.volume = 1.0;
        preloadedAudio.preload = "auto";
        // Attempt quick muted play/pause to unlock HTML5 audio element
        preloadedAudio.muted = true;
        const playPromise = preloadedAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              preloadedAudio.pause();
              preloadedAudio.currentTime = 0;
              preloadedAudio.muted = false;
            })
            .catch(() => {});
        }
      }

      isAudioUnlocked = true;
      console.log("[NotificationSound] Audio system unlocked successfully.");
    } catch (err) {
      console.warn("[NotificationSound] Audio unlock notice:", err);
    } finally {
      // Remove listeners once unlocked
      ["click", "touchstart", "keydown", "pointerdown", "mousedown"].forEach((evt) => {
        window.removeEventListener(evt, unlock);
        document.removeEventListener(evt, unlock);
      });
    }
  };

  ["click", "touchstart", "keydown", "pointerdown", "mousedown"].forEach((evt) => {
    window.addEventListener(evt, unlock, { once: true, passive: true });
    document.addEventListener(evt, unlock, { once: true, passive: true });
  });
};

/**
 * Synthesizes a loud, crisp, elegant Ding-Dong notification chime using Web Audio API.
 * 100% self-contained, does not require loading any external audio file.
 */
export const playWebAudioChime = async () => {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Master Volume Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.9, now);
    masterGain.connect(ctx.destination);

    // Note 1: High ding (784 Hz - G5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.85, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Harmonic sparkle for Note 1
    const osc1b = ctx.createOscillator();
    const gain1b = ctx.createGain();
    osc1b.type = "triangle";
    osc1b.frequency.setValueAtTime(1567.98, now);
    gain1b.gain.setValueAtTime(0.25, now);
    gain1b.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1b.connect(gain1b);
    gain1b.connect(masterGain);
    osc1b.start(now);
    osc1b.stop(now + 0.35);

    // Note 2: Resolution dong (1046.5 Hz - C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, now + 0.14);
    gain2.gain.setValueAtTime(0.9, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.75);

    // Harmonic sparkle for Note 2
    const osc2b = ctx.createOscillator();
    const gain2b = ctx.createGain();
    osc2b.type = "triangle";
    osc2b.frequency.setValueAtTime(2093.0, now + 0.14);
    gain2b.gain.setValueAtTime(0.2, now + 0.14);
    gain2b.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2b.connect(gain2b);
    gain2b.connect(masterGain);
    osc2b.start(now + 0.14);
    osc2b.stop(now + 0.55);

    console.log("[NotificationSound] Synthesized chime played successfully.");
  } catch (err) {
    console.warn("[NotificationSound] Web Audio chime error:", err);
  }
};

// Cooldown timestamp to prevent duplicate/overlapping sound triggers
let lastSoundPlayedTime = 0;
const SOUND_COOLDOWN_MS = 2500; // 2.5 seconds cooldown

/**
 * Main function to play notification sound.
 * Includes a 2.5-second cooldown so rapid/simultaneous notification events only play once.
 * Tries HTML5 Audio first (/notification.wav). If blocked or fails, falls back to Web Audio Synth.
 */
export const playNotificationSound = (force = false) => {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (!force && now - lastSoundPlayedTime < SOUND_COOLDOWN_MS) {
    console.log(
      `[NotificationSound] Cooldown active (${now - lastSoundPlayedTime}ms < ${SOUND_COOLDOWN_MS}ms). Skipping duplicate sound.`
    );
    return;
  }
  lastSoundPlayedTime = now;

  console.log("[NotificationSound] Playing notification audio alert...");

  try {
    const audio = new Audio("/notification.wav");
    audio.volume = 1.0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("[NotificationSound] Audio played via HTML5 Audio element.");
        })
        .catch((err) => {
          console.warn("[NotificationSound] HTML5 Audio blocked, playing Web Audio synth:", err);
          playWebAudioChime();
        });
    } else {
      playWebAudioChime();
    }
  } catch (err) {
    console.warn("[NotificationSound] Error initializing HTML5 Audio, using synth:", err);
    playWebAudioChime();
  }
};

// Expose globally on window for easy testing and cross-context access
if (typeof window !== "undefined") {
  window.playNotificationSound = playNotificationSound;
  initAudioUnlock();
}
