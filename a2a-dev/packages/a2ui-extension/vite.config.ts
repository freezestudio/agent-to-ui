import { defineConfig } from "vite-plus";
export default defineConfig({
  pack: { dts: { tsgo: true }, exports: true, deps: { neverBundle: ["@a2a-dev/a2ui-core", "@a2a-dev/core", "@a2a-dev/server", "pino"] } },
});
