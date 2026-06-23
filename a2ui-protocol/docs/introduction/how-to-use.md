# 如何使用 A2UI

选择与你角色和用例匹配的集成路径。

## 三种路径

### 路径 1：构建宿主应用（前端）

将 A2UI 渲染集成到你现有的应用中，或构建一个新的 AI 驱动前端。

**选择一个渲染器：**

- **Web：** Lit、Angular、React。
- **移动端/桌面端：** Flutter GenUI SDK。

**快速设置：**

Angular：

```bash
npm install @a2ui/angular @a2ui/web_core
```

React：

```bash
npm install @a2ui/react @a2ui/web_core
```

连接到代理消息（SSE、WebSocket 或 A2A），并自定义样式以匹配你的品牌。

**下一步：** [客户端设置指南](../guides/client-setup.md) | [主题化](../guides/theming.md)

---

### 路径 2：构建代理（后端）

创建能够为任何兼容客户端生成 A2UI 响应的代理。

**选择你的框架：**

- **Python：** Google ADK、LangChain、自定义。
- **Node.js：** A2A SDK、Vercel AI SDK、自定义。

在你的 LLM 提示词中包含 A2UI 模式，生成 JSONL 消息，并通过 SSE、WebSocket 或 A2A 流式传输到客户端。

**下一步：** [代理开发指南](../guides/agent-development.md)

---

### 路径 3：使用现有框架

通过具有内置支持的框架使用 A2UI：

- **[AG-UI / CopilotKit](https://ag-ui.com/)** - 全栈代理应用框架，支持 A2UI 渲染。
- **[Flutter GenUI SDK](https://docs.flutter.dev/ai/genui)** - 跨平台生成式 UI（内部使用 A2UI）。

**下一步：** [代理 UI 生态系统](agent-ui-ecosystem.md) | [A2UI 在现实中的应用](../ecosystem/a2ui-in-the-world.md)
