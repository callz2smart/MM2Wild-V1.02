// Shared rain-pot logic used by both the local Vite dev chat server
// (server/chat.js) and the production Cloudflare Durable Object
// (server/index.js). The rain pot starts at 300 coins and counts down
// from 5 minutes (300 seconds). When the timer hits zero the pot resets
// back to 300 and the cycle repeats. Tips add to the current pot.

export const RAIN_INITIAL_POOL = 300;
export const RAIN_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function createRainState() {
  let pool = RAIN_INITIAL_POOL;
  // Align to the top of the current hour: the round that started at the
  // last X:00:00 and ends at the next X:00:00.
  let startedAt = Math.floor(Date.now() / RAIN_DURATION_MS) * RAIN_DURATION_MS;

  function remainingMs() {
    const elapsed = Date.now() - startedAt;
    const left = RAIN_DURATION_MS - elapsed;
    return left > 0 ? left : 0;
  }

  function maybeReset() {
    const hourStart = Math.floor(Date.now() / RAIN_DURATION_MS) * RAIN_DURATION_MS;
    if (hourStart !== startedAt) {
      pool = RAIN_INITIAL_POOL;
      startedAt = hourStart;
      return true;
    }
    return false;
  }

  return {
    state() {
      maybeReset();
      const remaining = remainingMs();
      const totalSeconds = Math.ceil(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return {
        pool,
        remaining,
        countdown: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        progress: ((RAIN_DURATION_MS - remaining) / RAIN_DURATION_MS) * 100,
      };
    },
    tip(amount) {
      maybeReset();
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (value <= 0) return { ok: false, error: "Enter a valid amount." };
      pool += value;
      return { ok: true, pool };
    },
    reset() {
      pool = RAIN_INITIAL_POOL;
      startedAt = Math.floor(Date.now() / RAIN_DURATION_MS) * RAIN_DURATION_MS;
    },
  };
}

export function formatRainState(rain) {
  return { type: "rain", ...rain.state() };
}
