# 客户端设置指南

将 A2UI 集成到你的应用中，使用适合你平台的渲染器。

## 渲染器

| 渲染器                                                                                 | 平台           | v0.8 | v0.9 | 状态             |
| ---------------------------------------------------------------------------------------- | ------------------ | ---- | ---- | ------------------ |
| **[React](https://github.com/a2ui-project/a2ui/tree/main/renderers/react)**              | Web                | ✅   | ✅   | ✅ 稳定          |
| **[Lit（Web 组件）](https://github.com/a2ui-project/a2ui/tree/main/renderers/lit)** | Web                | ✅   | ✅   | ✅ 稳定          |
| **[Angular](https://github.com/a2ui-project/a2ui/tree/main/renderers/angular)**          | Web                | ✅   | ✅   | ✅ 稳定          |
| **[Flutter（GenUI SDK）](https://docs.flutter.dev/ai/genui)**                             | 移动端/桌面端/Web | ✅   | ✅   | ✅ 稳定          |
| **Jetpack Compose**                                                                      | Android            | —    | —    | 🚧 计划于 2026 年 Q2 |

更多请参见所有 [A2UI 渲染器](../reference/renderers.md) 和 [社区 A2UI 渲染器](../ecosystem/renderers.md)。

## 组件目录

组件目录是任何组件的集合。A2UI 提供了一个"基本目录"，但我们期望你将添加自己的组件，或共享库，或完全用你自己的组件替换基本组件。

**你的设计系统才是关键。** 你可以注册任何组件和函数的集合，A2UI 将与它们一起工作。目录只是代理和渲染器之间的契约。

参见[定义自己的目录](defining-your-own-catalog.md)了解如何定义与你的设计系统匹配的目录。

## 共享 Web 库

所有 Web 渲染器（Lit、Angular、React）共享一个公共基础：**`@a2ui/web_core`**。该库提供了每个 Web 渲染器所需的消息处理器、状态管理和数据绑定逻辑。每个特定框架的渲染器都在此基础上构建，只添加其框架的渲染层。

这意味着核心协议处理在 Web 平台之间是一致的——只有组件渲染不同。

共享的 `web_core` 库提供：

- **消息处理器**：管理 A2UI 状态并处理传入消息。

## Web 组件（Lit）

```bash
npm install @a2ui/lit @a2ui/web_core
```

安装后，你可以在应用中使用渲染器。Lit 渲染器使用：

- **消息处理器**：封装 A2UI 消息处理器。
- **`<a2ui-surface>` 组件**：在你的应用中渲染表面。
- **Lit Signals**：提供用于自动 UI 更新的响应式状态管理。

**查看工作示例：** [Lit shell 示例](https://github.com/a2ui-project/a2ui/tree/main/samples/client/lit/shell) — 查看其 README 获取详细的运行说明。

## Angular

```bash
npm install @a2ui/angular @a2ui/web_core
```

安装后，你可以在应用中使用渲染器。Angular 渲染器提供：

- **`A2uiRendererService`**：管理 A2UI 消息处理器和响应式模型的服务。
- **`a2ui-v09-component-host` 组件**：渲染来自表面的 A2UI 组件的动态组件宿主。
- **`A2UI_RENDERER_CONFIG` 令牌**：用于配置渲染器的目录和操作处理程序。

### 设置示例（v0.9）

A2UI 为其协议特定实现使用版本化导入。对于 v0.9，按如下方式配置你的应用提供者：

```typescript
import {ApplicationConfig} from '@angular/core';
import {A2UI_RENDERER_CONFIG, A2uiRendererService, minimalCatalog} from '@a2ui/angular/v0_9';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: A2UI_RENDERER_CONFIG,
      useValue: {
        catalogs: [minimalCatalog],
        actionHandler: action => {
          console.log('操作已分发：', action);
        },
      },
    },
    A2uiRendererService,
  ],
};
```

**查看工作示例：** [Angular 示例](https://github.com/a2ui-project/a2ui/tree/main/samples/client/angular)

### 流式传输

默认情况下，Angular 客户端使用流式 API。要禁用流式传输，请在启动应用前将 `ENABLE_STREAMING` 环境变量设置为 `false`：

```bash
export ENABLE_STREAMING=false
yarn start restaurant
```

> **包管理器使用说明：** 上面的 `yarn start` 命令特定于在 A2UI 单仓库内运行示例应用。对于你自己的常规使用和此仓库之外的独立项目，请使用你选择的包管理器（如 npm、pnpm）。

## React

```bash
npm install @a2ui/react @a2ui/web_core
```

React 渲染器提供：

- **`MessageProcessor` 类**：管理 A2UI 消息处理器和响应式模型的类。
- **`<A2UISurface>` 组件**：在你的 React 应用中渲染 A2UI 表面。
- **`useA2UI()` 钩子**：从任何组件访问消息处理器。

**查看工作示例：** [React shell](https://github.com/a2ui-project/a2ui/tree/main/samples/client/react/shell)

## Flutter（GenUI SDK）

```bash
flutter pub add flutter_genui
```

Flutter 使用 GenUI SDK，提供原生 A2UI 渲染。

**文档：** [GenUI SDK](https://docs.flutter.dev/ai/genui) | [GitHub](https://github.com/flutter/genui) | [GenUI Flutter 包中的 README](https://github.com/flutter/genui/blob/main/packages/genui/README.md#getting-started-with-genui)

## 连接到代理

你的客户端应用需要：

1. **从代理接收 A2UI 消息**（通过传输层）
2. **使用消息处理器处理消息**
3. **将用户操作发送回代理**

常见的传输选项：

- **服务器推送事件（SSE）**：从服务器到客户端的单向流式传输
- **WebSocket**：双向实时通信
- **A2A 协议**：支持 A2UI 的标准化代理间通信

参见 [samples/client/lit/shell/client.ts](https://github.com/a2ui-project/a2ui/tree/main/samples/client/lit/shell/client.ts) 获取使用 A2A 协议客户端的示例。

**参见：** [传输层指南](../concepts/transports.md)

## 处理用户操作

当用户与 A2UI 组件交互（点击按钮、提交表单等）时，客户端：

1. 从组件捕获操作事件
2. 解析操作所需的任何数据上下文
3. 将操作发送给代理
4. 处理代理的响应消息

参见 `#maybeRenderData` 中的 `@a2uiaction` 事件处理器，位于 [samples/client/lit/shell/app.ts](https://github.com/a2ui-project/a2ui/tree/main/samples/client/lit/shell/app.ts)，获取处理按钮点击和表单提交的示例。

## 错误处理

需要处理的常见错误：

- **无效的表面 ID**：在收到 `beginRendering`（v0.8）或 `createSurface`（v0.9）之前引用的表面。
- **无效的组件 ID**：组件 ID 在表面内必须唯一。
- **无效的数据路径**：检查数据模型结构和 JSON Pointer 语法。
- **模式验证失败**：验证消息格式是否符合 A2UI 规范。

参见 `#sendMessage` 中的 `try...catch` 块，位于 [samples/client/lit/shell/app.ts](https://github.com/a2ui-project/a2ui/tree/main/samples/client/lit/shell/app.ts)，获取处理通信错误的示例。

## 下一步

- **[快速入门](../quickstart.md)**：尝试演示应用
- **[主题化和样式](theming.md)**：自定义外观和感觉
- **[定义自己的目录](defining-your-own-catalog.md)**：扩展组件目录
- **[代理开发](agent-development.md)**：构建生成 A2UI 的代理
- **[参考文档](../reference/messages.md)**：深入了解协议
