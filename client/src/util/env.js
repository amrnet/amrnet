/**
 * Environment helpers for runtime feature gating.
 *
 * Preferred signal is the build-time var REACT_APP_ENVIRONMENT
 * (set to "development" in the dev deploy, "production" in prod).
 * Falls back to hostname so the gate still works if the var is missing.
 * Same pattern as registerServiceWorker.js.
 */

const isProdHost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') return false;
  if (host.startsWith('dev.')) return false;
  return host.endsWith('amrnet.org');
};

export function isProduction() {
  const envVar = process.env.REACT_APP_ENVIRONMENT;
  if (envVar === 'production') return true;
  if (envVar === 'development') return false;
  return isProdHost();
}

export function isDevelopment() {
  return !isProduction();
}
