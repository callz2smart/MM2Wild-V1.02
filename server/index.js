const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

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

    return env.ASSETS.fetch(request);
  },
};
