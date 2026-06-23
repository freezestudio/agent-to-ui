<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

<!--PROJECT KNOWLEDGE-->

# A2A 协议开发经验记录

## Monorepo 包管理规范

- 每个包必须包含 `build`（`vp pack`）、`check`（`vp check`）、`test`（`vp test`）三个 script
- `package.json` 的 `exports` 指向 `./dist/index.mjs`，`types` 指向 `./dist/index.d.mts`，添加 `files: ["dist"]`
- 运行子包脚本用 `vp run <package-name>#<script>`，根 scripts 中简写为 `vp run @scope/name#script`

## tsdown / vp pack 配置规范

- `vite.config.ts` 中 `pack` 块配置传递给 tsdown，**不**支持 `rollupOptions` 字段
- 标记外部依赖使用 `deps.neverBundle`（**不是** `external` 或 `rollupOptions.external`——后者在 tsdown 中已废弃）
- 生成类型声明用 `dts: { tsgo: true }`
- 生成 exports 用 `exports: { packageJson: true }`
- 参考配置模板：
  ```ts
  // packages/<name>/vite.config.ts
  import { defineConfig } from "vite-plus";
  export default defineConfig({
    pack: {
      dts: { tsgo: true },
      exports: { packageJson: true },
      deps: { neverBundle: ["@a2a-dev/core", "zod"] },
    },
  });
  ```

## Zod v4 注意事项

- `errorMap` 回调在 v4 中**已移除**——改用 `z.enum([...]).refine(v => ..., { message })` 实现自定义错误消息
- `z.record(z.unknown())` 单参数形式虽兼容但推荐 `z.record(z.string(), z.unknown())` 双参数形式
- `z.nativeEnum()` 保留但优先使用 `z.enum([...])`
- 所有 `url()`、`datetime()` 等校验器应附加中文 `describe()` 和 `message`

## A2A 协议实现要点

- 任务生命周期：`handleSendMessage` 必须遍历所有事件合并状态，不能只取第一个 Task 事件
- 错误处理：按规范 §5.4 将 A2A 错误类型映射到不同 HTTP 状态码（TaskNotFound→404，其他→400/500）
- TypeScript 枚举：使用 `Role.ROLE_AGENT` 而非 `"ROLE_AGENT" as const`，避免 TS2322 类型错误
- 多轮对话（input-required）：handler 的 `handleSendMessage` 需根据 `message.taskId` 从 TaskStore 恢复已有任务，传给 executor 的 `context.task` 应为现有任务而非空任务
- 多轮智能体：用 `sessionStore`（Map<taskId, phase>）跟踪对话阶段，而非依赖 `context.task` 是否为 undefined（handler 始终会创建 Task 对象）

<!--PROJECT KNOWLEDGE END-->
