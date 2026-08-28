// Real-time chat hub for the local Vite dev server.
// Tracks connected clients, broadcasts messages, and reports a live online count.
// In production the same protocol is handled by the ChatRoom Durable Object
// in server/index.js so the client code is identical between environments.

import { WebSocketServer } from "ws";

const HISTORY_LIMIT = 50;
const MAX_BODY_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 2000;

// Fallback profile used for guests and unknown users. The client also keeps a
// local lookup table for the demo users that previously existed in the sidebar.
const guestProfile = {
  level: 1,
  color: "#BEBEBE",
  avatar:
    "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-9E12919EC1A578390B1018D597D9FC67-Png/180/180/AvatarHeadshot/Webp/noFilter",
};

function colorForLevel(level) {
  if (level >= 30) return "#F33972";
  if (level >= 20) return "#F36D39";
  return "#BEBEBE";
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function safeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}

// Resolve the user identity for a connecting client from the session cookie.
// Returns null for anonymous connections (they may still observe the chat).
async function resolveUser(cookieHeader, verifySession) {
  if (!cookieHeader || typeof verifySession !== "function") return null;
  const match = cookieHeader.match(/mm2wild_session=([^;]+)/);
  if (!match) return null;
  try {
    const session = await verifySession(match[1]);
    if (!session) return null;
    return {
      name: session.username || `User ${session.robloxUserId}`,
      level: session.level ?? 1,
      avatar: session.avatar_headshot || guestProfile.avatar,
    };
  } catch {
    return null;
  }
}

function profileFor(user) {
  if (!user) return { ...guestProfile };
  return {
    level: user.level ?? 1,
    color: colorForLevel(user.level ?? 1),
    avatar: user.avatar || guestProfile.avatar,
  };
}

export function attachChatServer(httpServer, options = {}) {
  const verifySession = options.verifySession;
  const wss = new WebSocketServer({
    noServer: true,
    path: "/api/chat",
  });

  const history = [];
  const clients = new Set();

  function broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const client of clients) {
      if (client.readyState === client.OPEN) client.send(data);
    }
  }

  function broadcastPresence() {
    broadcast({ type: "presence", online: clients.size });
  }

  function recordMessage(message) {
    history.push(message);
    if (history.length > HISTORY_LIMIT) history.shift();
  }

  function handleConnection(socket, user) {
    const profile = profileFor(user);
    const identity = {
      name: user?.name || "Guest",
      anonymous: !user,
      ...profile,
    };

    clients.add(socket);

    socket.send(
      JSON.stringify({
        type: "init",
        online: clients.size,
        messages: history,
        you: identity,
      }),
    );
    broadcastPresence();

    let lastMessageAt = 0;

    socket.on("message", (raw) => {
      if (identity.anonymous) {
        socket.send(
          JSON.stringify({
            type: "error",
            error: "Sign in to send messages to the chat.",
          }),
        );
        return;
      }

      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (payload?.type !== "chat") return;

      const body = safeString(payload.body, MAX_BODY_LENGTH).trim();
      if (!body) return;

      const now = Date.now();
      if (now - lastMessageAt < RATE_LIMIT_WINDOW_MS) {
        socket.send(
          JSON.stringify({
            type: "error",
            error:
              "Slow mode is enabled. Please wait before sending another message",
          }),
        );
        return;
      }
      lastMessageAt = now;

      const message = {
        type: "chat",
        name: identity.name,
        body,
        time: nowTime(),
        user: profile,
      };
      recordMessage(message);
      broadcast(message);
    });

    socket.on("close", () => {
      if (clients.delete(socket)) broadcastPresence();
    });
    socket.on("error", () => {
      if (clients.delete(socket)) broadcastPresence();
    });
  }

  httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url, "http://localhost");
    if (requestUrl.pathname !== "/api/chat") return;

    wss.handleUpgrade(request, socket, head, async (ws) => {
      const cookieHeader = request.headers.cookie || "";
      const user = await resolveUser(cookieHeader, verifySession);
      handleConnection(ws, user);
    });
  });

  return wss;
}
