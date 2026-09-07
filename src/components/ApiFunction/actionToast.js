"use client";

let activeListeners = [];
let lastTriggerTime = 0;
const COOLDOWN_MS = 5000;

const DEFAULT_LOGIN_MESSAGE =
  "Please log in to complete your request and access all features.";

export function subscribeLoginRequest(callback) {
  activeListeners.push(callback);
  return () => {
    activeListeners = activeListeners.filter((listener) => listener !== callback);
  };
}

export function triggerLoginRequest(message) {
  const now = Date.now();
  if (now - lastTriggerTime < COOLDOWN_MS) return;
  lastTriggerTime = now;
  const finalMessage = message || DEFAULT_LOGIN_MESSAGE;
  activeListeners.forEach((listener) => listener(finalMessage));
}

export function resetLoginRequest() {
  lastTriggerTime = 0;
}

export function isLoginRequestActive() {
  return Date.now() - lastTriggerTime < COOLDOWN_MS;
}