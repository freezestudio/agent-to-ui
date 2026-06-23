# 在 MCP 应用中实现 A2UI 动态渲染

本指南展示如何使用工具和内嵌资源在 [MCP 应用](https://modelcontextprotocol.io/extensions/apps/overview) 中提供丰富的交互式 A2UI 界面。最后，你将拥有一个可工作的 MCP 服务器，它返回一个可以渲染 A2UI 组件并处理 A2UI 交互的 MCP 应用。通过在 MCP 应用中支持原生 A2UI，你的 MCP 服务器可以在保持 UI 样式一致性的同时，安全地与远程代理协作。

## 前提条件

- **[Python 3.10+](https://www.python.org/)**
- **[uv](https://docs.astral.sh/uv/)** — 快速的 Python 包管理器
- **[Node.js 18+](https://nodejs.org/)**（用于 MCP Inspector）

## 架构概述

系统由三个主要参与者组成，通过通信链进行交互：

1. **客户端宿主应用**：连接到 MCP 服务器的外部容器（例如 Angular 应用），并为 MCP 应用托管安全沙箱。
2. **MCP 应用（沙箱化）**：在双 iframe 沙箱内运行的不受信任的第三方 Web 应用（例如 Lit 或 Angular 微应用）。此应用包含 A2UI 表面。
3. **MCP 服务器**：提供应用资源和处理工具调用的后端服务器。

## 深入：通信流程

此模式的一个关键方面是 **MCP 应用**直接渲染 A2UI 负载，而不是依赖客户端宿主应用。

### 在 MCP 应用中加载 A2UI 组件

动态加载 A2UI 组件到 MCP 应用中的事件序列：

1. **触发**：MCP 应用决定需要获取或更新 UI 内容。
2. **请求**：MCP 应用通过 `window.parent.postMessage` 向宿主发送 JSON-RPC 请求。
3. **中继**：沙箱代理将此消息中继到客户端宿主。
4. **MCP 调用**：客户端宿主将此自定义消息转换为对 MCP 服务器的标准 MCP `tools/call` 请求。
5. **响应**：MCP 服务器执行工具并返回包含 `application/a2ui+json` 资源的结果。
6. **响应转发**：宿主接收工具结果并通过沙箱代理将其转发回 MCP 应用。
7. **渲染**：MCP 应用从资源中提取 A2UI JSON 负载，并将其送入其本地的 A2UI `MessageProcessor`，动态更新 A2UI 表面。

### 处理用户操作

渲染的 A2UI 表面内的交互性通过反转流程来处理。

## 如何实现

### 第 1 步：内联渲染器

MCP 应用通常从 MCP 服务器作为单个 HTML 资源交付。使用后构建脚本将所有外部脚本和样式内联到 `index.html` 中。

### 第 2 步：利用 A2UI-over-MCP

内联后的应用现在在沙箱中运行。要利用 A2UI：

1. 在应用包中包含 A2UI Angular/Lit 库。
2. 与宿主定义通信契约以与 MCP 服务器交互。
3. 当收到来自宿主的响应时，查找内容中的 `application/a2ui+json` mimeType。
4. 解析 JSON 文本并将其传递给 A2UI `MessageProcessor`。

### 第 3 步：处理 A2UI 组件上的用户操作

要处理渲染的 A2UI 表面内的交互性，你的 MCP 应用必须捕获 A2UI 事件并使用 JSON-RPC 将其转发到宿主。

## 安全考虑

- **显式目标源**：在调用 `postMessage` 时，始终使用特定的目标源（如 `'https://trusted-host.com'`），而不是 `*`，以防止恶意 iframe 拦截你的 RPC 请求。
- **Null Origin 处理**：在严格沙箱内（`sandbox="allow-scripts"` 没有 `allow-same-origin`），`window.location.origin` 将返回 `"null"`。你必须通过将 `event.source` 与预期的 window 对象（如 `window.parent`）进行比较来仔细验证传入消息。
