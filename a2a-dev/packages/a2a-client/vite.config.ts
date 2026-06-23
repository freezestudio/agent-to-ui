import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: { tsgo: true },
    exports: {
      packageJson: true,
    },
    deps: {
      neverBundle: ["@a2a-dev/core", "zod"],
    },
  },
});
