# 传输层（消息传递）

传输层将 A2UI 消息从代理传递到客户端。A2UI 与传输层无关：使用任何能发送 JSON 的方法均可。

实际的组件渲染由[渲染器](../reference/renderers.md)完成，[代理](../reference/agents.md)负责生成 A2UI 消息。将消息从代理传递到客户端是传输层的职责。

## 工作原理

```
代理 → 传输层 → 客户端渲染器
```

A2UI 定义了一系列 JSON 消息。传输层负责将这些序列从代理传递到客户端。常见的传输机制是使用类似 JSON Lines (JSONL) 格式的流，其中每一行是一条 A2UI 消息。

## 可用的传输层

| 传输层                        | 状态      | 用例                                                       |
| ---------------------------- | --------- | ---------------------------------------------------------- |
| **A2A 协议**                 | ✅ 稳定   | 多代理系统、企业网状网络                                    |
| **AG-UI**                    | ✅ 稳定   | 全栈 React、Vue、Angular 应用（CopilotKit）                |
| **REST API**                 | 📋 计划中 | 简单的 HTTP 端点                                           |
| **WebSocket**                | 💡 提议   | 实时双向通信                                                |
| **SSE（服务器推送事件）**    | 💡 提议   | Web 流式传输                                                |

## A2A 协议

[Agent2Agent (A2A) 协议](https://a2a-protocol.org)提供安全、标准化的代理通信。A2A 扩展可与 A2UI 轻松集成。

**优势：**

- 内置安全和认证。
- 支持多种消息格式、认证和传输协议。
- 关注点清晰分离。

如果你正在使用 A2A，这几乎是自动完成的。

TODO：添加详细指南。

**参见：** [A2A 扩展规范](../specification/v0.8-a2a-extension.md)

## AG-UI

[AG-UI](https://ag-ui.com/) 将 A2UI 消息转换为 AG-UI 事件，并自动处理传输和状态同步。常用于全栈 React、Vue 和 Angular 应用。CopilotKit 是 AG-UI 的创建者和主要使用者。

**参见：** [使用任意代理框架配合 A2UI（使用 AG-UI）](../guides/a2ui-with-any-agent-framework.md)：使用你选择的代理框架设置 CopilotKit 并启用 A2UI 渲染。

## 自定义传输层

你可以使用任何能发送 JSON 的传输方式：

**HTTP/REST：**

```javascript
// TODO：添加示例
```

**WebSocket：**

```javascript
// TODO：添加示例
```

**服务器推送事件：**

```javascript
// TODO：添加示例
```

## 下一步

- **[A2A 协议文档](https://a2a-protocol.org)**：了解 A2A
- **[A2A 扩展规范](../specification/v0.8-a2a-extension.md)**：A2UI + A2A 详情
