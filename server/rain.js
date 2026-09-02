export const RAIN_INITIAL_POOL = 250;
export const RAIN_DURATION_MS = (58 * 60 + 30) * 1000;
export const RAIN_JOIN_DURATION_MS = (1 * 60 + 30) * 1000;
export const RAIN_COOLDOWN_DURATION_MS = 20 * 1000;

function newRain(startedAt) {
  return {
    id: crypto.randomUUID(),
    pool: RAIN_INITIAL_POOL,
    phase: "active",
    startedAt,
    endsAt: startedAt + RAIN_DURATION_MS,
    joinEndsAt: startedAt + RAIN_DURATION_MS + RAIN_JOIN_DURATION_MS,
    cooldownEndsAt: startedAt + RAIN_DURATION_MS + RAIN_JOIN_DURATION_MS + RAIN_COOLDOWN_DURATION_MS,
    participantIds: new Set(),
  };
}

export function createSupabaseRainStore(env) {
  const url = (env?.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;

  const request = (path, init = {}) => fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers },
  });

  return {
    async loadCurrent() {
      const query = new URLSearchParams({
        status: "in.(active,joining,cooldown)",
        select: "id,pool,status,starts_at,ends_at,join_ends_at",
        order: "starts_at.desc",
        limit: "1",
      });
      const response = await request(`mm2wild_rains?${query}`);
      const rows = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(rows)) throw new Error("Rain could not be loaded.");
      if (!rows[0]) return null;

      const entriesQuery = new URLSearchParams({
        rain_id: `eq.${rows[0].id}`,
        select: "user_uuid",
      });
      const entriesResponse = await request(`mm2wild_rain_entries?${entriesQuery}`);
      const entries = await entriesResponse.json().catch(() => null);
      if (!entriesResponse.ok || !Array.isArray(entries)) throw new Error("Rain entries could not be loaded.");
      return { ...rows[0], participantIds: entries.map((entry) => entry.user_uuid) };
    },

    async save(rain) {
      const response = await request("mm2wild_rains?on_conflict=id", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: rain.id,
          pool: rain.pool,
          status: rain.phase,
          starts_at: new Date(rain.startedAt).toISOString(),
          ends_at: new Date(rain.endsAt).toISOString(),
          join_ends_at: new Date(rain.joinEndsAt).toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Rain could not be saved.");
    },

    async complete(rainId) {
      const response = await request(`mm2wild_rains?id=eq.${encodeURIComponent(rainId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ status: "completed", updated_at: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Rain could not be completed.");
    },

    async updatePool(rainId, pool) {
      const response = await request(`mm2wild_rains?id=eq.${encodeURIComponent(rainId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ pool, updated_at: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Rain pot could not be updated.");
    },

    async addParticipant(rainId, userUuid) {
      const response = await request("mm2wild_rain_entries?on_conflict=rain_id,user_uuid", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({ rain_id: rainId, user_uuid: userUuid }),
      });
      if (!response.ok) throw new Error("You could not join this rain.");
    },
  };
}

export function createRainState({ store = null, now = () => Date.now() } = {}) {
  let rain = newRain(now());
  let readyPromise;
  let transitionPromise;

  function load(row) {
    const startedAt = Date.parse(row.starts_at);
    const endsAt = Date.parse(row.ends_at);
    const joinEndsAt = Date.parse(row.join_ends_at);
    rain = {
      id: row.id,
      pool: Number(row.pool) || 0,
      phase: row.status === "joining" ? "joining" : "active",
      startedAt: Number.isFinite(startedAt) ? startedAt : now(),
      endsAt: Number.isFinite(endsAt) ? endsAt : now() + RAIN_DURATION_MS,
      joinEndsAt: Number.isFinite(joinEndsAt) ? joinEndsAt : now() + RAIN_DURATION_MS + RAIN_JOIN_DURATION_MS,
      cooldownEndsAt: (Number.isFinite(joinEndsAt) ? joinEndsAt : now() + RAIN_DURATION_MS + RAIN_JOIN_DURATION_MS) + RAIN_COOLDOWN_DURATION_MS,
      participantIds: new Set(row.participantIds || []),
    };
    if (row.status === "cooldown") rain.phase = "cooldown";
  }

  async function saveNewRain(candidate) {
    try {
      await store.save(candidate);
    } catch (error) {
      const stored = await store.loadCurrent();
      if (!stored) throw error;
      load(stored);
    }
  }

  function updatePhase() {
    const timestamp = now();
    if (timestamp >= rain.cooldownEndsAt) {
      const previousId = rain.id;
      rain = newRain(timestamp);
      const nextRain = rain;
      transitionPromise = (store
        ? store.complete(previousId).then(() => saveNewRain(nextRain))
        : Promise.resolve()).catch(() => {});
    } else if (timestamp >= rain.joinEndsAt && rain.phase !== "cooldown") {
      rain.phase = "cooldown";
      transitionPromise = (store ? store.save(rain) : Promise.resolve()).catch(() => {});
    } else if (timestamp >= rain.endsAt && rain.phase === "active") {
      rain.phase = "joining";
      transitionPromise = (store ? store.save(rain) : Promise.resolve()).catch(() => {});
    }
  }

  function state(userUuid) {
    updatePhase();
    const remaining = rain.phase === "active" ? Math.max(0, rain.endsAt - now()) : 0;
    const totalSeconds = Math.ceil(remaining / 1000);
    return {
      rainId: rain.id,
      pool: rain.pool,
      phase: rain.phase,
      canJoin: rain.phase === "joining",
      visible: rain.phase !== "cooldown",
      participantCount: rain.participantIds.size,
      joined: Boolean(userUuid && rain.participantIds.has(userUuid)),
      remaining,
      countdown: rain.phase === "joining"
        ? "00:00"
        : `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`,
      progress: rain.phase === "active" ? (remaining / RAIN_DURATION_MS) * 100 : 0,
    };
  }

  const api = {
    async ready() {
      if (!readyPromise) {
        readyPromise = (async () => {
          if (!store) return;
          const stored = await store.loadCurrent();
          if (stored) load(stored);
          else await saveNewRain(rain);
          updatePhase();
          if (transitionPromise) await transitionPromise;
        })().catch(() => {});
      }
      await readyPromise;
    },

    async tick(userUuid) {
      await api.ready();
      updatePhase();
      if (transitionPromise) await transitionPromise;
      return state(userUuid);
    },

    state,

    async tip(amount) {
      await api.ready();
      updatePhase();
      if (rain.phase === "cooldown") return { ok: false, error: "This rain has ended." };
      if (rain.phase !== "active") return { ok: false, error: "This rain is already open for joining." };
      const value = Math.max(0, Math.floor(Number(amount) || 0));
      if (!value) return { ok: false, error: "Enter a valid amount." };
      rain.pool += value;
      try {
        if (store) await store.updatePool(rain.id, rain.pool);
      } catch {
        rain.pool -= value;
        return { ok: false, error: "The rain pot could not be updated." };
      }
      return { ok: true, pool: rain.pool };
    },

    async join(userUuid) {
      await api.ready();
      updatePhase();
      if (rain.phase !== "joining") return { ok: false, error: "This rain is not open for joining." };
      if (!userUuid) return { ok: false, error: "Sign in to join the rain." };
      if (rain.participantIds.has(userUuid)) return { ok: true, joined: true };
      try {
        if (store) await store.addParticipant(rain.id, userUuid);
        rain.participantIds.add(userUuid);
        return { ok: true, joined: true };
      } catch (error) {
        return { ok: false, error: error.message || "You could not join this rain." };
      }
    },

    reset() {
      const previousId = rain.id;
      rain = newRain(now());
      const nextRain = rain;
      transitionPromise = (store
        ? store.complete(previousId).then(() => saveNewRain(nextRain))
        : Promise.resolve()).catch(() => {});
    },
  };

  return api;
}

export function formatRainState(rain, userUuid) {
  return { type: "rain", ...rain.state(userUuid) };
}
