import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import robloxBackend from "./server/index.js";

function localBackend(backendEnv) {
  return {
    name: "local-backend",
    configureServer(devServer) {
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
    AUTH_SECRET: loadedEnv.AUTH_SECRET,
    SUPABASE_URL: loadedEnv.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: loadedEnv.SUPABASE_SERVICE_ROLE_KEY,
  };

  return {
    plugins: [react(), tailwindcss(), localBackend(backendEnv)],
  };
});
