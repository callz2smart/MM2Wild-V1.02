import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFile, mkdir, writeFile } from "node:fs/promises";

function sitesStaticOutput() {
  return {
    name: "sites-static-output",
    async closeBundle() {
      await mkdir("dist/server", { recursive: true });
      await mkdir("dist/.openai", { recursive: true });
      await writeFile(
        "dist/server/index.js",
        "export default { fetch(request, env) { return env.ASSETS.fetch(request); } };\n",
      );
      await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/static",
  },
  plugins: [react(), tailwindcss(), sitesStaticOutput()],
});
