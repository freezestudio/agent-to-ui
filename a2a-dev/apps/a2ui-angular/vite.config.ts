/**
 * A2UI Angular v22 应用 Vite+ 配置
 *
 * 使用 @angular/build 的 Vite 插件进行构建。
 * 开发服务器代理 /a2a 请求到 A2UI Agent 服务器。
 *
 * @packageDocumentation
 */

import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    // Angular 构建插件（由 Vite+ 自动解析）
  ],
  server: {
    port: 5173,
    proxy: {
      "/a2a": {
        target: "http://127.0.0.1:10002",
        changeOrigin: true,
      },
    },
  },
});
