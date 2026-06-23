# A2UI 表面的 MCP 应用集成

本指南解释**模型上下文协议（MCP）应用**如何在 **A2UI** 表面内集成和显示，以及安全模型和测试指南。

> 寻找核心 A2UI-over-MCP 协议？参见 [A2UI over MCP](a2ui_over_mcp.md) 了解如何从 MCP 工具调用返回 A2UI JSON 负载。

## 概述

模型上下文协议（MCP）允许 MCP 服务器向宿主提供丰富的交互式基于 HTML 的用户界面。A2UI 提供了一个安全的环境来运行这些第三方应用。

## 双 Iframe 隔离模式

为了安全地运行不受信任的第三方代码，A2UI 使用**双 iframe** 隔离模式。这种方法将原始 DOM 注入与主应用程序隔离，同时维护结构化的 JSON-RPC 通道。

### 安全原理

标准的单 iframe 沙箱化使用 `allow-scripts`，但如果与 `allow-same-origin` 结合使用，通常会被绕过，这将破坏容器化。任何具有 `allow-scripts` 和 `allow-same-origin` 的 iframe 都可以通过编程方式与其父 DOM 交互或移除自身的沙箱属性来逃逸。

为防止这种情况，A2UI 严格排除运行第三方应用的内部 iframe 的 `allow-same-origin`。

### 架构

1. **沙箱代理（`sandbox.html`）**：来自同一源的中间 `iframe`。它将原始 DOM 注入与主应用隔离，同时维护结构化的 JSON-RPC 通道。
2. **嵌入应用（内部 iframe）**：最内层的 `iframe`。通过 `srcdoc` 动态注入，具有受限权限。

### 物理 Iframe 嵌套

```
宿主应用 → 沙箱代理 (iframe) → 嵌入应用 (内部 iframe)
```

### 端到端架构和生命周期流程

完整的周期涉及 MCP 服务器、AI 代理和宿主应用之间的链式通信。

## 使用 / 代码示例

MCP 应用组件通常解析为 A2UI 目录中的 `custom` 节点。

### 1. 在目录中注册

你必须在目录应用中注册该组件。例如，在 Angular 中：

```typescript
import {Catalog} from '@a2ui/angular';
import {inputBinding} from '@angular/core';

export const DEMO_CATALOG = {
  McpApp: {
    type: () => import('./mcp-app').then(r => r.McpApp),
    bindings: ({properties}) => [
      inputBinding('content', () => ('content' in properties && properties['content']) || undefined),
      inputBinding('title', () => ('title' in properties && properties['title']) || undefined),
    ],
  },
} as Catalog;
```

### 2. 在 A2UI 消息中使用

在宿主或代理上下文中，发送翻译为此自定义节点的 A2UI 消息。

## 通信协议

宿主和嵌入的内部 iframe 之间的通信通过 `postMessage` 上的结构化 JSON-RPC 通道进行。

### 限制

由于内部 iframe 严格省略了 `allow-same-origin`，适用以下条件：

- MCP 应用**不能**使用 `localStorage`、`sessionStorage`、`IndexedDB` 或 cookie。每个应用使用唯一的源运行。
- 父级无法进行直接 DOM 操作。所有交互必须通过消息传递进行。

## 示例

有两个主要示例演示 MCP 应用集成。每个示例需要运行**多个终端**。

### 示例 1：MCP 应用独立示例（Lit 客户端和 ADK 代理）

### 示例 2：MCP 应用（计算器 + Pong）（Angular 客户端 + MCP 服务器 + 代理代理）

## 用于测试的 URL 选项

出于测试目的，你可以使用特定的 URL 查询参数退出安全自检。

### `disable_security_self_test=true`

此查询参数允许你绕过验证 iframe 隔离的安全自检。

## 故障排除

| 问题                                           | 解决方案                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GEMINI_API_KEY` 环境变量未设置     | 导出密钥或在代理目录中添加 `.env` 文件                                       |
| Python 版本错误                            | 安装 Python 3.13+                                                                 |
| `yarn build:renderer` 失败                       | 确保你首先在 `samples/client/lit/` 中运行了 `yarn install`                                  |
| Angular 客户端显示空白页面                   | 确保你在 `yarn start` 之前运行了 `yarn build:sandbox`                                          |
| MCP 应用 iframe 未加载                       | 检查 MCP 服务器（端口 8000）和代理代理（端口 10006）都在运行              |
| "URL with hostname not allowed"                   | Angular 21 限制允许的宿主。使用 `localhost`（默认）——不要传递 `--host 0.0.0.0` |
| 安全自检在开发中失败                   | 在 URL 中添加 `?disable_security_self_test=true`                                                |
