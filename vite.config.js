import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import robloxBackend from "./server/index.js";

function localBackend() {
  return {
    name: "local-backend",
    configureServer(devServer) {
      devServer.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url, "http://localhost");
        if (!requestUrl.pathname.startsWith("/api/")) return next();

        try {
          const backendResponse = await robloxBackend.fetch(
            new Request(requestUrl, { method: request.method }),
            {},
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

export default defineConfig({
  plugins: [react(), tailwindcss(), localBackend()],
});
