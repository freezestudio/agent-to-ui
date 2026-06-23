import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    // entry: 'src/index.ts',  — 默认值，无需显式指定
    dts: { tsgo: true },
    exports: {
      packageJson: true,
    },
    // 标记外部依赖（替代已废弃的 rollupOptions.external）
    deps: {
      neverBundle: ["@a2a-dev/core", "zod"],
    },
  },
});
