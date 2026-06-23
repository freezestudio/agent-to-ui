# 代理（服务器端）

代理是生成 A2UI 消息以响应用户请求的服务器端程序。

实际的组件渲染由[渲染器](renderers.md)完成，消息通过[传输层](../concepts/transports.md)传递到客户端。代理只负责生成 A2UI 消息。

## 代理的工作原理

代理工作流程通常包括以下步骤：

1. **接收**用户消息。
2. **使用 LLM 处理**（Gemini、GPT、Claude 等）。
3. **生成** A2UI JSON 消息作为结构化输出。
4. **通过传输层发送**到客户端。

来自客户端的用户交互可以被视为新的用户输入。

## 示例代理

A2UI 仓库包含你可以学习的示例代理：

- [餐厅查找](https://github.com/a2ui-project/a2ui/tree/main/samples/agent/adk/restaurant_finder)
    - 带表单的餐桌预订。
    - 使用 ADK 编写。
- [Rizzcharts](https://github.com/a2ui-project/a2ui/tree/main/samples/community/agent/adk/rizzcharts/python)
    - A2UI 自定义组件演示。
    - 使用 ADK 编写。
- [编排器](https://github.com/a2ui-project/a2ui/tree/main/samples/community/agent/adk/orchestrator)
    - 传递来自远程子代理的 A2UI 消息。
    - 使用 ADK 编写。

## A2A 中的代理类型

### 1. 面向用户的代理（独立）

面向用户的代理是用户直接交互的代理。

### 2. 作为远程代理宿主的面向用户代理

这是一种模式，其中面向用户的代理是一个或多个远程代理的宿主。面向用户的代理将调用远程代理，远程代理将生成 A2UI 消息。这是 [A2A](https://a2a-protocol.org) 中的常见模式，客户端代理调用服务器代理。

在这种模式中，面向用户的代理可以通过两种方式处理消息：

- 面向用户的代理可以"透传"A2UI 消息而不改变它们。
- 面向用户的代理可以在将 A2UI 消息发送到客户端之前更改它们。

### 3. 远程代理

远程代理不是直接面向用户 UI 的一部分。相反，它注册为远程代理，可以由面向用户的代理调用。这是 [A2A](https://a2a-protocol.org) 中的常见模式，客户端代理调用服务器代理。
