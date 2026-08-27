const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
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

function getVerificationPhrase(request) {
  const url = new URL(request.url);
  const userId = (url.searchParams.get("userId") || "").trim();

  if (!/^\d+$/.test(userId)) {
    return json({ error: "A valid Roblox user ID is required." }, 400);
  }

  return json({
    userId,
    phrase: createVerificationPhrase(),
    wordCount: 17,
  });
}

async function getRobloxUser(request) {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") || "").trim();

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return json({ error: "Enter a valid Roblox username." }, 400);
  }

  const userResponse = await fetch(
    "https://users.roblox.com/v1/usernames/users",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true,
      }),
    },
  );

  if (!userResponse.ok) {
    return json({ error: "Roblox is unavailable right now." }, 502);
  }

  const userPayload = await userResponse.json();
  const user = userPayload.data?.[0];
  if (!user) return json({ error: "Roblox user not found." }, 404);

  const thumbnailResponse = await fetch(
    "https://thumbnails.roblox.com/v1/users/avatar-headshot?" +
      new URLSearchParams({
        userIds: String(user.id),
        size: "180x180",
        format: "Webp",
        isCircular: "false",
      }),
  );

  if (!thumbnailResponse.ok) {
    return json({ error: "Roblox avatar could not be loaded." }, 502);
  }

  const thumbnailPayload = await thumbnailResponse.json();
  const thumbnail = thumbnailPayload.data?.[0];
  if (!thumbnail?.imageUrl) {
    return json({ error: "Roblox avatar is still processing." }, 503);
  }

  return json({
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    avatarUrl: thumbnail.imageUrl,
  });
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

    if (
      url.pathname === "/api/verification-phrase" &&
      request.method === "GET"
    ) {
      return getVerificationPhrase(request);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "API route not found." }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
