// Server-side roulette round lifecycle.
//
// The roulette is a single shared wheel: every connected client sees the
// same countdown, the same spin, and the same result. The result for each
// round is derived from a provably-fair HMAC(serverSeed, `${clientSeed}:${nonce}`)
// hash so players can verify outcomes after the seed is rotated.
//
// Round phases:
//   betting  — 20s countdown during which players place bets.
//   spinning — ~6s reel animation; betting is locked.
//   After spinning the round resolves, payouts are applied, and a new
//   betting phase begins automatically.

const encoder = new TextEncoder();

// Must match the client REEL_PATTERN in src/pages/RoulettePage.jsx.
const REEL_PATTERN = [
  "green", "gold", "blue", "gold", "blue",
  "purple", "blue", "gold", "blue", "gold",
  "blue", "gold", "blue", "gold", "blue",
];

export const ROULETTE_COLORS = ["blue", "green", "gold", "purple"];

export const ROULETTE_MULTIPLIERS = {
  blue: 2,
  green: 14,
  gold: 2,
  purple: 7,
};

export const ROULETTE_BETTING_MS = 20 * 1000;
export const ROULETTE_SPINNING_MS = 6 * 1000;
export const ROULETTE_TICK_MS = 250;

function generateServerSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function sha256Hex(input) {
  return crypto.subtle
    .digest("SHA-256", encoder.encode(input))
    .then((hash) =>
      Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join(""),
    );
}

// Derive the landing color for a round from the fairness seed.
async function computeResult(serverSeed, clientSeed, nonce) {
  const hash = await hmacSha256Hex(serverSeed, `${clientSeed}:${nonce}`);
  const value = parseInt(hash.slice(0, 8), 16);
  const index = value % REEL_PATTERN.length;
  return REEL_PATTERN[index];
}

// ── Supabase helpers ────────────────────────────────────────────────────────

function supabaseSettings(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function createSupabaseStore(env) {
  const settings = supabaseSettings(env);
  if (!settings) return null;

  const request = (path, init = {}) =>
    fetch(`${settings.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: settings.key,
        Authorization: `Bearer ${settings.key}`,
        ...init.headers,
      },
    });

  return {
    // ── Roulette seed ───────────────────────────────────────────────────────
    async loadActiveSeed() {
      const query = new URLSearchParams({
        active: "eq.true",
        select: "id,server_seed,server_seed_hash,client_seed,nonce",
        order: "created_at.desc",
        limit: "1",
      });
      const response = await request(`mm2wild_roulette_seed?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return null;
      return rows[0] || null;
    },

    async createSeed() {
      const serverSeed = generateServerSeed();
      const serverSeedHash = await sha256Hex(serverSeed);
      const response = await request("mm2wild_roulette_seed", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          server_seed: serverSeed,
          server_seed_hash: serverSeedHash,
          client_seed: "",
        }),
      });
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows) || !rows[0]) return null;
      return rows[0];
    },

    async bumpNonce(seedId, currentNonce) {
      const query = new URLSearchParams({ id: `eq.${seedId}`, select: "nonce" });
      const response = await request(`mm2wild_roulette_seed?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ nonce: currentNonce + 1 }),
      });
      const rows = await response.json().catch(() => null);
      return rows?.[0]?.nonce ?? currentNonce + 1;
    },

    async rotateSeed(currentSeedId) {
      const deactivateQuery = new URLSearchParams({ id: `eq.${currentSeedId}` });
      await request(`mm2wild_roulette_seed?${deactivateQuery}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          active: false,
          rotated_at: new Date().toISOString(),
        }),
      });
      return this.createSeed();
    },

    // ── Round history ───────────────────────────────────────────────────────
    async saveRound(round) {
      const response = await request("mm2wild_roulette_rounds", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          seed_id: round.seedId,
          nonce: round.nonce,
          client_seed: round.clientSeed,
          result: round.result,
          total_pot: round.totalPot,
          total_players: round.totalPlayers,
        }),
      });
      const rows = await response.json().catch(() => null);
      return rows?.[0]?.id || null;
    },

    // ── Per-player game records ─────────────────────────────────────────────
    async saveGame(game) {
      await request("mm2wild_roulette_games", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          round_id: game.roundId,
          user_uuid: game.userUuid,
          color: game.color,
          amount: game.amount,
          result: game.result,
          multiplier: game.multiplier,
          payout: game.payout,
          profit: game.profit,
          status: game.status,
        }),
      });
    },

    async loadRecentRounds(limit = 100) {
      const query = new URLSearchParams({
        select: "id,nonce,result,total_players,created_at",
        order: "created_at.desc",
        limit: String(limit),
      });
      const response = await request(`mm2wild_roulette_rounds?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return [];
      return rows.map((row) => ({
        id: row.id,
        roundNumber: row.nonce,
        color: row.result,
        players: row.total_players,
        time: row.created_at,
      }));
    },

    // ── User balance ────────────────────────────────────────────────────────
    async getUser(userUuid) {
      const query = new URLSearchParams({
        uuid: `eq.${userUuid}`,
        select: "uuid,username,mm2_balance,total_wagered",
        limit: "1",
      });
      const response = await request(`mm2wild_users?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) return null;
      return rows[0] || null;
    },

    async deductBalance(userUuid, amount) {
      // Read current balance, check, then patch. (Supabase REST doesn't support
      // atomic increments without an RPC, so we do a read-check-write.)
      const user = await this.getUser(userUuid);
      if (!user) return { ok: false, error: "Account not found." };
      const current = Number(user.mm2_balance || 0);
      if (current < amount) return { ok: false, error: "Insufficient balance." };
      const newBalance = current - amount;
      const newWagered = Number(user.total_wagered || 0) + amount;
      const query = new URLSearchParams({ uuid: `eq.${userUuid}` });
      const response = await request(`mm2wild_users?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          mm2_balance: newBalance,
          total_wagered: newWagered,
        }),
      });
      if (!response.ok) return { ok: false, error: "Could not deduct balance." };
      const rows = await response.json().catch(() => null);
      const finalBalance = rows?.[0]?.mm2_balance != null ? Number(rows[0].mm2_balance) : newBalance;
      return { ok: true, balance: finalBalance };
    },

    async creditBalance(userUuid, amount) {
      const user = await this.getUser(userUuid);
      if (!user) return { ok: false, error: "Account not found." };
      const newBalance = Number(user.mm2_balance || 0) + amount;
      const query = new URLSearchParams({ uuid: `eq.${userUuid}` });
      await request(`mm2wild_users?${query}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ mm2_balance: newBalance }),
      });
      return { ok: true, balance: newBalance };
    },

    // ── Bet record ──────────────────────────────────────────────────────────
    async recordBet(userUuid, amount, profit, status, multiplier) {
      await request("mm2wild_bets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_uuid: userUuid,
          game: "roulette",
          status,
          amount,
          profit,
          multiplier,
        }),
      });
    },
  };
}

// In-memory fallback store for local dev without Supabase.
function createMemoryStore() {
  let seed = null;
  const rounds = [];
  const balances = new Map(); // userUuid -> balance

  return {
    async loadActiveSeed() {
      if (!seed) {
        const serverSeed = generateServerSeed();
        seed = {
          id: crypto.randomUUID(),
          server_seed: serverSeed,
          server_seed_hash: await sha256Hex(serverSeed),
          client_seed: "",
          nonce: 0,
        };
      }
      return seed;
    },
    async createSeed() {
      const serverSeed = generateServerSeed();
      seed = {
        id: crypto.randomUUID(),
        server_seed: serverSeed,
        server_seed_hash: await sha256Hex(serverSeed),
        client_seed: "",
        nonce: 0,
      };
      return seed;
    },
    async bumpNonce(seedId, currentNonce) {
      if (seed && seed.id === seedId) seed.nonce = currentNonce + 1;
      return seed ? seed.nonce : currentNonce + 1;
    },
    async rotateSeed() {
      return this.createSeed();
    },
    async saveRound(round) {
      const roundId = crypto.randomUUID();
      rounds.unshift({
        id: roundId,
        roundNumber: round.nonce,
        color: round.result,
        players: round.totalPlayers,
        time: new Date().toISOString(),
      });
      if (rounds.length > 100) rounds.pop();
      return roundId;
    },
    async saveGame() {
      // no-op in memory mode
    },
    async loadRecentRounds(limit = 100) {
      return rounds.slice(0, limit);
    },
    async getUser(userUuid) {
      const balance = balances.get(userUuid) ?? 10000;
      return { uuid: userUuid, username: `User-${userUuid.slice(0, 6)}`, mm2_balance: balance };
    },
    async deductBalance(userUuid, amount) {
      const current = balances.get(userUuid) ?? 10000;
      if (current < amount) return { ok: false, error: "Insufficient balance." };
      const newBalance = current - amount;
      balances.set(userUuid, newBalance);
      return { ok: true, balance: newBalance };
    },
    async creditBalance(userUuid, amount) {
      const current = balances.get(userUuid) ?? 10000;
      const newBalance = current + amount;
      balances.set(userUuid, newBalance);
      return { ok: true, balance: newBalance };
    },
    async recordBet() {
      // no-op in memory mode
    },
  };
}

export function createRouletteState({ env = null, now = () => Date.now() } = {}) {
  const store = env ? (createSupabaseStore(env) || createMemoryStore()) : createMemoryStore();

  // Round state.
  let phase = "betting";
  let phaseEndsAt = now() + ROULETTE_BETTING_MS;
  let currentResult = null;
  let history = [];
  let pots = emptyPots();
  let bets = new Map(); // userUuid -> { color, amount, name }
  let seedRow = null;
  let roundNonce = 0;
  let readyPromise = null;
  let tickTimer = null;
  let spinTimer = null;
  let listeners = new Set();

  function emptyPots() {
    const obj = {};
    for (const color of ROULETTE_COLORS) obj[color] = { players: new Map(), amount: 0 };
    return obj;
  }

  function publicPots() {
    const obj = {};
    for (const color of ROULETTE_COLORS) {
      const playerList = [];
      for (const [uuid, info] of pots[color].players) {
        playerList.push({ uuid, name: info.name, avatar: info.avatar, amount: info.amount });
      }
      obj[color] = {
        players: pots[color].players.size,
        amount: pots[color].amount,
        playerList,
      };
    }
    return obj;
  }

  function snapshot(userUuid) {
    const remaining = Math.max(0, phaseEndsAt - now());
    const playerBets = userUuid ? bets.get(userUuid) : null;
    return {
      type: "roulette_state",
      phase,
      remaining,
      totalDuration: phase === "betting" ? ROULETTE_BETTING_MS : ROULETTE_SPINNING_MS,
      result: currentResult,
      history: history.slice(0, 100),
      pots: publicPots(),
      myBet: playerBets ? playerBets.map((b) => ({ color: b.color, amount: b.amount })) : null,
      fairness: seedRow
        ? {
            serverSeedHash: seedRow.server_seed_hash,
            clientSeed: seedRow.client_seed,
            nonce: roundNonce,
          }
        : null,
    };
  }

  function broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const listener of listeners) {
      try { listener(data, null); } catch {}
    }
  }

  // Send a payload only to a specific user's listener.
  function sendToUser(userUuid, payload) {
    const data = JSON.stringify(payload);
    for (const listener of listeners) {
      try { listener(data, userUuid); } catch {}
    }
  }

  async function ready() {
    if (!readyPromise) {
      readyPromise = (async () => {
        seedRow = await store.loadActiveSeed();
        if (!seedRow) seedRow = await store.createSeed();
        roundNonce = seedRow.nonce || 0;
        history = await store.loadRecentRounds(100);
      })().catch(() => {});
    }
    await readyPromise;
  }

  function startBetting() {
    phase = "betting";
    phaseEndsAt = now() + ROULETTE_BETTING_MS;
    currentResult = null;
    pots = emptyPots();
    bets = new Map();
    broadcast({ type: "roulette_phase", phase: "betting", endsAt: phaseEndsAt });
  }

  async function startSpin() {
    await ready();
    phase = "spinning";
    phaseEndsAt = now() + ROULETTE_SPINNING_MS;

    const result = await computeResult(
      seedRow.server_seed,
      seedRow.client_seed || "",
      roundNonce,
    );
    currentResult = result;

    broadcast({
      type: "roulette_spin",
      color: result,
      nonce: roundNonce,
      serverSeedHash: seedRow.server_seed_hash,
      clientSeed: seedRow.client_seed || "",
      endsAt: phaseEndsAt,
    });

    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(() => resolveRound(result), ROULETTE_SPINNING_MS);
  }

  async function resolveRound(result) {
    const completedRoundNonce = roundNonce;
    let totalPot = 0;
    const playerSet = new Set();
    for (const color of ROULETTE_COLORS) {
      totalPot += pots[color].amount;
      for (const uuid of pots[color].players.keys()) playerSet.add(uuid);
    }

    // Save round for verification and capture the round ID.
    let roundId = null;
    try {
      roundId = await store.saveRound({
        seedId: seedRow.id,
        nonce: roundNonce,
        clientSeed: seedRow.client_seed || "",
        result,
        totalPot,
        totalPlayers: playerSet.size,
      });
    } catch {}

    // Bump nonce.
    try {
      roundNonce = await store.bumpNonce(seedRow.id, roundNonce);
    } catch {
      roundNonce += 1;
    }

    history.unshift({
      id: roundId,
      roundNumber: completedRoundNonce,
      color: result,
      players: playerSet.size,
      time: new Date().toISOString(),
    });
    if (history.length > 100) history.pop();

    // Payout winners and record each player's games.
    const multiplier = ROULETTE_MULTIPLIERS[result];
    const payouts = []; // { userUuid, payout, balance }
    for (const [userUuid, userBets] of bets) {
      let totalPayout = 0;
      for (const bet of userBets) {
        const won = bet.color === result;
        const payout = won ? bet.amount * multiplier : 0;
        const profit = won ? payout - bet.amount : -bet.amount;
        const status = won ? "won" : "lost";

        // Record the game in the dedicated roulette games table.
        try {
          await store.saveGame({
            roundId,
            userUuid,
            color: bet.color,
            amount: bet.amount,
            result,
            multiplier: won ? multiplier : 0,
            payout,
            profit,
            status,
          });
        } catch {}

        // Also record in the generic bets table for the bet history page.
        try {
          await store.recordBet(userUuid, bet.amount, profit, status, won ? multiplier : 0);
        } catch {}

        if (won) totalPayout += payout;
      }

      // Credit the total payout once per user.
      if (totalPayout > 0) {
        try {
          const creditResult = await store.creditBalance(userUuid, totalPayout);
          if (creditResult.ok) payouts.push({ userUuid, payout: totalPayout, balance: creditResult.balance });
        } catch {}
      }
    }

    broadcast({
      type: "roulette_result",
      color: result,
      multiplier,
      history: history.slice(0, 100),
      pots: publicPots(),
      payouts,
    });

    // Send each player their updated balance via a user-scoped message.
    for (const [userUuid, userBets] of bets) {
      let totalPayout = 0;
      for (const bet of userBets) {
        if (bet.color === result) totalPayout += bet.amount * multiplier;
      }
      const won = totalPayout > 0;
      // Re-fetch the user's balance from the store.
      try {
        const user = await store.getUser(userUuid);
        if (user) {
          sendToUser(userUuid, {
            type: "roulette_balance",
            balance: Number(user.mm2_balance || 0),
            won,
            payout: totalPayout,
          });
        }
      } catch {}
    }

    startBetting();
  }

  function tick() {
    if (phase === "betting" && now() >= phaseEndsAt) {
      void startSpin();
      return;
    }
    // Emit periodic state for countdown display.
    broadcast({ type: "roulette_tick", phase, remaining: Math.max(0, phaseEndsAt - now()) });
  }

  function startTickTimer() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      if (listeners.size === 0) {
        clearInterval(tickTimer);
        tickTimer = null;
        return;
      }
      tick();
    }, ROULETTE_TICK_MS);
  }

  const api = {
    async ready() {
      await ready();
      return snapshot();
    },

    snapshot,
    getBet: (userUuid) => {
      const userBets = bets.get(userUuid);
      if (!userBets || userBets.length === 0) return null;
      return userBets; // array of { color, amount, name, avatar }
    },

    subscribe(listener) {
      listeners.add(listener);
      startTickTimer();
      return () => { listeners.delete(listener); };
    },

    async placeBet(userUuid, userName, color, amount, avatar = null) {
      await ready();
      if (phase !== "betting") return { ok: false, error: "Betting is closed for this round." };
      if (!ROULETTE_COLORS.includes(color)) return { ok: false, error: "Invalid color." };
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (!value) return { ok: false, error: "Enter a valid bet amount." };

      // Deduct balance on the server.
      const deduction = await store.deductBalance(userUuid, value);
      if (!deduction.ok) return { ok: false, error: deduction.error };

      // Accumulate the bet — players can bet multiple times per round,
      // on the same or different colors.
      const existing = bets.get(userUuid) || [];
      const existingOnColor = existing.find((b) => b.color === color);
      if (existingOnColor) {
        existingOnColor.amount += value;
      } else {
        existing.push({ color, amount: value, name: userName, avatar });
      }
      bets.set(userUuid, existing);

      // Update the pot: accumulate the player's amount on this color.
      const potPlayer = pots[color].players.get(userUuid);
      if (potPlayer) {
        potPlayer.amount += value;
      } else {
        pots[color].players.set(userUuid, { name: userName, avatar, amount: value });
      }
      pots[color].amount += value;

      broadcast({ type: "roulette_pots", pots: publicPots() });

      return { ok: true, bet: { color, amount: value }, balance: deduction.balance };
    },

    async start() {
      await ready();
      if (phase === "betting" && phaseEndsAt <= now()) {
        phaseEndsAt = now() + ROULETTE_BETTING_MS;
      }
      startTickTimer();
      return snapshot();
    },

    reset() {
      phase = "betting";
      phaseEndsAt = now() + ROULETTE_BETTING_MS;
      currentResult = null;
      history = [];
      pots = emptyPots();
      bets = new Map();
    },
  };

  return api;
}
