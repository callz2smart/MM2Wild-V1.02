import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import robloxBackend, { resolveSessionUser } from "./server/index.js";
import { attachChatServer } from "./server/chat.js";

function localBackend(backendEnv) {
  return {
    name: "local-backend",
    configureServer(devServer) {
      // Attach the real-time chat WebSocket server to the dev HTTP server so
      // /api/chat upgrades are handled alongside the REST API below.
      attachChatServer(devServer.httpServer, {
        verifySession: (token) => resolveSessionUser(token, backendEnv),
        env: backendEnv,
      });

      devServer.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url, "http://localhost");
        if (!requestUrl.pathname.startsWith("/api/")) return next();

        try {
          const requestBody = await new Promise((resolve, reject) => {
            if (request.method === "GET" || request.method === "HEAD") {
              resolve(undefined);
              return;
            }

            const chunks = [];
            request.on("data", (chunk) => chunks.push(chunk));
            request.on("end", () => resolve(Buffer.concat(chunks)));
            request.on("error", reject);
          });
          const backendResponse = await robloxBackend.fetch(
            new Request(requestUrl, {
              method: request.method,
              headers: request.headers,
              body: requestBody,
            }),
            backendEnv,
          );

          response.statusCode = backendResponse.status;
          backendResponse.headers.forEach((value, name) => {
            response.setHeader(name, value);
          });
          response.end(Buffer.from(await backendResponse.arrayBuffer()));
        } catch {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "The server could not complete the request." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "");
  const backendEnv = {
    MM2WILD_USER_SECRET: loadedEnv.MM2WILD_USER_SECRET,
    SUPABASE_URL: loadedEnv.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: loadedEnv.SUPABASE_SERVICE_ROLE_KEY,
  };

  return {
    plugins: [react(), tailwindcss(), localBackend(backendEnv)],
  };
});
