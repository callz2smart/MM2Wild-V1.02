const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

const verificationWords = [
  "acorn", "amber", "anchor", "apple", "autumn", "bamboo", "beacon",
  "berry", "birch", "blossom", "breeze", "brook", "candle", "canyon",
  "cabin", "care", "cedar", "chart", "cherry", "cloud", "clover", "coral", "cottage", "creek",
  "crystal", "daisy", "dawn", "dolphin", "dove", "dream", "drum",
  "duck", "eagle", "elm", "fair", "feather", "fern", "field", "finch", "flame",
  "forest", "garden", "glow", "grape", "grove", "harbor", "harp",
  "hamster", "hazel", "helmet", "heron", "hill", "honey", "horse", "island", "ivy", "jade",
  "lake", "lantern", "leaf", "lemon", "lily", "loom", "maple", "meadow",
  "melon", "mint", "moon", "mountain", "oak", "ocean", "olive", "orbit", "orchid",
  "owl", "pearl", "pebble", "pillar", "pine", "pond", "quick", "rainbow", "real", "reed", "river",
  "robin", "rose", "sage", "shell", "signal", "sky", "snow", "sparrow", "spring",
  "stag", "star", "stone", "stream", "summer", "summit", "sun", "swan", "tree",
  "tulip", "valley", "violet", "wave", "whale", "willow", "winter", "wise",
];

const encoder = new TextEncoder();
const challengeLifetimeSeconds = 10 * 60;
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;

function secureRandomIndex(maximum) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return Math.floor((value[0] / 4294967296) * maximum);
}

function createVerificationPhrase() {
  const words = [...verificationWords];
  for (let index = words.length - 1; index > 0; index -= 1) {
    const randomIndex = secureRandomIndex(index + 1);
    [words[index], words[randomIndex]] = [words[randomIndex], words[index]];
  }
  return words.slice(0, 17).join(", ");
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function authSecret(env) {
  const secret = (env.MM2WILD_USER_SECRET || "").trim();
  return secret.length >= 32 ? secret : null;
}

async function createSignedToken(payload, secret) {
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(encodedPayload),
  );
  return `${encodedPayload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifySignedToken(token, secret) {
  try {
    const [encodedPayload, encodedSignature, remainder] = token.split(".");
    if (!encodedPayload || !encodedSignature || remainder) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      decodeBase64Url(encodedSignature),
      encoder.encode(encodedPayload),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function phraseWords(value) {
  return value.toLowerCase().match(/[a-z]+/g) || [];
}

function containsWordSequence(source, sequence) {
  if (sequence.length === 0 || source.length < sequence.length) return false;
  for (let start = 0; start <= source.length - sequence.length; start += 1) {
    if (sequence.every((word, offset) => source[start + offset] === word)) return true;
  }
  return false;
}

async function getRobloxAvatar(userId) {
  const response = await fetch(
    "https://thumbnails.roblox.com/v1/users/avatar-headshot?" +
      new URLSearchParams({
        userIds: String(userId),
        size: "180x180",
        format: "Webp",
        isCircular: "false",
      }),
  );
  if (!response.ok) throw new Error("Roblox avatar could not be loaded.");
  const payload = await response.json();
  const avatarUrl = payload.data?.[0]?.imageUrl;
  if (!avatarUrl) throw new Error("Roblox avatar is still processing.");
  return avatarUrl;
}

async function getRobloxUser(request) {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") || "").trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return json({ error: "Enter a valid Roblox username." }, 400);
  }

  const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
  });
  if (!userResponse.ok) return json({ error: "Roblox is unavailable right now." }, 502);
  const user = (await userResponse.json()).data?.[0];
  if (!user) return json({ error: "Roblox user not found." }, 404);

  try {
    return json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarUrl: await getRobloxAvatar(user.id),
    });
  } catch (error) {
    return json({ error: error.message }, 502);
  }
}

async function getVerificationPhrase(request, env) {
  const secret = authSecret(env);
  if (!secret) return json({ error: "Secure sign-in is not configured." }, 503);

  const url = new URL(request.url);
  const userId = (url.searchParams.get("userId") || "").trim();
  if (!/^\d+$/.test(userId)) {
    return json({ error: "A valid Roblox user ID is required." }, 400);
  }

  const phrase = createVerificationPhrase();
  const now = Math.floor(Date.now() / 1000);
  const challenge = await createSignedToken(
    { type: "roblox-bio", userId, phrase, iat: now, exp: now + challengeLifetimeSeconds },
    secret,
  );
  return json({ userId, phrase, challenge, wordCount: 17 });
}

function supabaseSettings(env) {
  const url = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && serviceKey ? { url, serviceKey } : null;
}

async function supabaseRequest(env, path, init = {}) {
  const settings = supabaseSettings(env);
  if (!settings) throw new Error("Secure account storage is not configured.");
  return fetch(`${settings.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: settings.serviceKey,
      Authorization: `Bearer ${settings.serviceKey}`,
      ...init.headers,
    },
  });
}

async function upsertMM2WildUser(env, profile, avatarUrl) {
  const response = await supabaseRequest(
    env,
    "mm2wild_users?on_conflict=roblox_user_id",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        roblox_user_id: Number(profile.id),
        username: profile.name,
        avatar_headshot: avatarUrl,
      }),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload) || !payload[0]) {
    throw new Error(payload?.message || "Your account could not be saved.");
  }
  return payload[0];
}

async function verifyRobloxBio(request, env) {
  const secret = authSecret(env);
  if (!secret) return json({ error: "Secure sign-in is not configured." }, 503);

  const body = await request.json().catch(() => null);
  const userId = String(body?.userId || "").trim();
  const phrase = String(body?.phrase || "").trim();
  const challengeToken = String(body?.challenge || "").trim();
  const words = phraseWords(phrase);
  if (!/^\d+$/.test(userId)) return json({ error: "A valid Roblox user ID is required." }, 400);
  if (words.length !== 17 || words.some((word) => !verificationWords.includes(word))) {
    return json({ error: "The verification phrase is invalid." }, 400);
  }

  const challenge = await verifySignedToken(challengeToken, secret);
  if (
    challenge?.type !== "roblox-bio" ||
    challenge.userId !== userId ||
    challenge.phrase !== phrase
  ) {
    return json({ error: "The verification phrase has expired. Please try again." }, 400);
  }

  const profileResponse = await fetch(`https://users.roblox.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { accept: "application/json" },
  });
  if (!profileResponse.ok) {
    return json(
      { error: profileResponse.status === 404 ? "Roblox user not found." : "Roblox is unavailable right now." },
      profileResponse.status === 404 ? 404 : 502,
    );
  }

  const profile = await profileResponse.json();
  if (String(profile.id) !== userId) {
    return json({ error: "Roblox returned an invalid profile." }, 502);
  }
  if (!containsWordSequence(phraseWords(profile.description || ""), words)) {
    return json({ error: "Your Roblox bio doesn't match the verification phrase." }, 409);
  }

  try {
    const account = await upsertMM2WildUser(env, profile, await getRobloxAvatar(profile.id));
    const now = Math.floor(Date.now() / 1000);
    const session = await createSignedToken(
      { type: "session", uuid: account.uuid, robloxUserId: String(profile.id), iat: now, exp: now + sessionLifetimeSeconds },
      secret,
    );
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return json(
      { verified: true, user: account },
      200,
      {
        "set-cookie": `mm2wild_session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeSeconds}${secure}`,
      },
    );
  } catch (error) {
    return json({ error: error.message || "Your account could not be saved." }, 503);
  }
}

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

function missingSession(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return json(
    { error: "The login session could not be found" },
    401,
    {
      "set-cookie": `mm2wild_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
    },
  );
}

async function getSession(request, env) {
  const sessionCookie = cookieValue(request, "mm2wild_session");
  if (!sessionCookie) return json({ user: null });
  const secret = authSecret(env);
  if (!secret) return missingSession(request);
  const session = await verifySignedToken(sessionCookie, secret);
  if (session?.type !== "session" || !session.uuid) return missingSession(request);

  try {
    const query = new URLSearchParams({ uuid: `eq.${session.uuid}`, select: "*", limit: "1" });
    const response = await supabaseRequest(env, `mm2wild_users?${query}`);
    const rows = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(rows) || !rows[0]) return missingSession(request);
    if (String(rows[0].roblox_user_id) !== session.robloxUserId) return missingSession(request);
    return json({ user: rows[0] });
  } catch {
    return missingSession(request);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/roblox-user" && request.method === "GET") {
      try {
        return await getRobloxUser(request);
      } catch {
        return json({ error: "Roblox is unavailable right now." }, 502);
      }
    }
    if (url.pathname === "/api/verification-phrase" && request.method === "GET") {
      return getVerificationPhrase(request, env);
    }
    if (url.pathname === "/api/verify-roblox-bio" && request.method === "POST") {
      try {
        return await verifyRobloxBio(request, env);
      } catch {
        return json({ error: "The verification request could not be completed." }, 500);
      }
    }
    if (url.pathname === "/api/session" && request.method === "GET") {
      return getSession(request, env);
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "API route not found." }, 404);
    return env.ASSETS.fetch(request);
  },
};
