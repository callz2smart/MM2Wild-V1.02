
import { WebSocketServer } from "ws";
import { createRainState, createSupabaseRainStore, formatRainState } from "./rain.js";

const HISTORY_LIMIT = 50;
const MAX_BODY_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 2000;


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


async function resolveUser(cookieHeader, verifySession) {
  if (!cookieHeader || typeof verifySession !== "function") return null;
  const match = cookieHeader.match(/mm2wild_session=([^;]+)/);
  if (!match) return null;
  try {
    const session = await verifySession(match[1]);
    if (!session) return null;
    return {
      uuid: session.uuid,
      name: session.username || `User ${session.robloxUserId}`,
      rank: session.rank || "user",
      level: session.level ?? 1,
      avatar: session.avatar_headshot,
    };
  } catch {
    return null;
  }
}

function profileFor(user) {
  if (!user) return null;
  return {
    rank: user.rank || "user",
    level: user.level ?? 1,
    color: colorForLevel(user.level ?? 1),
    avatar: user.avatar,
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
  const clientSockets = new Map();
  const rain = createRainState({ store: createSupabaseRainStore(options.env) });
  let rainInterval = null;

  async function broadcastRain() {
    await rain.tick();
    broadcast(formatRainState(rain));
  }

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

  function announceUserTip({ sender, recipient, amount, balanceType }) {
    const tipMessage = {
      type: "chat",
      name: "Tip Bot",
      body: `${sender} tipped ${recipient} ${amount} ${balanceType === "crypto" ? "crypto" : "MM2"} coins!`,
      time: nowTime(),
      user: { level: 99, color: "#E5AD4E", avatar: "/coin.webp" },
    };
    recordMessage(tipMessage);
    broadcast(tipMessage);
  }

  async function handleConnection(socket, user, clientId) {
    const profile = profileFor(user);
    const identity = user ? { name: user.name, ...profile } : null;

    const previousSocket = clientSockets.get(clientId);
    if (previousSocket && previousSocket !== socket) {
      clients.delete(previousSocket);
      previousSocket.close(1000, "Replaced by a refreshed connection");
    }
    clientSockets.set(clientId, socket);
    clients.add(socket);

    await rain.ready();
    socket.send(
      JSON.stringify({
        type: "init",
        online: clients.size,
        messages: history,
        you: identity,
        rain: rain.state(user?.uuid),
      }),
    );
    broadcastPresence();


    if (!rainInterval) {
      rainInterval = setInterval(() => {
        if (clients.size === 0) {
          clearInterval(rainInterval);
          rainInterval = null;
          return;
        }
        void broadcastRain();
      }, 1000);
    }

    let lastMessageAt = 0;

    socket.on("message", async (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!["chat", "rain_tip", "rain_join"].includes(payload?.type)) return;

      if (!identity) {
        const action = payload.type === "chat" ? "send messages to the chat" : payload.type === "rain_tip" ? "tip the rain" : "join the rain";
        socket.send(JSON.stringify({ type: "error", error: `Sign in to ${action}.` }));
        return;
      }

      if (payload.type === "rain_tip") {
        const result = await rain.tip(payload.amount);
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await broadcastRain();
        const tipMessage = {
          type: "chat",
          name: "Rain Bot",
          body: `${identity.name} tipped ${payload.amount} coins to the rain pot!`,
          time: nowTime(),
          user: { level: 99, color: "#E5AD4E", avatar: "/coin.webp" },
        };
        recordMessage(tipMessage);
        broadcast(tipMessage);
        return;
      }

      if (payload.type === "rain_join") {
        const result = await rain.join(user.uuid);
        if (!result.ok) {
          socket.send(JSON.stringify({ type: "error", error: result.error }));
          return;
        }
        await broadcastRain();
        socket.send(JSON.stringify({ type: "rain_joined", rainId: rain.state().rainId }));
        return;
      }

      const body = safeString(payload.body, MAX_BODY_LENGTH).trim();
      if (!body) return;
      const replyName = safeString(payload.reply?.name, 64).trim();
      const replyBody = safeString(payload.reply?.body, MAX_BODY_LENGTH).trim();
      const repliedMessage = [...history]
        .reverse()
        .find((entry) => entry.name === replyName && entry.body === replyBody);
      const reply =
        replyName && replyBody
          ? {
              name: replyName,
              body: replyBody,
              ...(repliedMessage?.user ? { user: repliedMessage.user } : {}),
            }
          : null;

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
        ...(reply ? { reply } : {}),
      };
      recordMessage(message);
      broadcast(message);
    });

    socket.on("close", () => {
      if (clientSockets.get(clientId) === socket) clientSockets.delete(clientId);
      if (clients.delete(socket)) broadcastPresence();
    });
    socket.on("error", () => {
      if (clientSockets.get(clientId) === socket) clientSockets.delete(clientId);
      if (clients.delete(socket)) broadcastPresence();
    });
  }

  httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url, "http://localhost");
    if (requestUrl.pathname !== "/api/chat") return;

    wss.handleUpgrade(request, socket, head, async (ws) => {
      const cookieHeader = request.headers.cookie || "";
      const user = await resolveUser(cookieHeader, verifySession);
      const clientId = requestUrl.searchParams.get("clientId")?.slice(0, 128) || crypto.randomUUID();
      await handleConnection(ws, user, clientId);
    });
  });

  return { wss, rain, announceUserTip };
}
