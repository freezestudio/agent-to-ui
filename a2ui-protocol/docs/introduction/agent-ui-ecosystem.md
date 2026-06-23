# A2UI 如何比较？

代理 UI 领域正在快速发展。以下是 A2UI 与其他主要方法的对比。

## 概览

|                    | **A2UI**                                        | **MCP 应用**                                                                     | **AG-UI**                                                |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **方法**           | 声明式组件蓝图                                   | 通过 `ui://` URI 提供预构建 HTML                                                  | 连接后端和前端的带宽协议                                 |
| **渲染**           | 原生组件（Angular、Flutter、Lit 等）             | 沙箱化 `iframe`                                                                   | 开发者定义（任意框架）                                    |
| **样式**           | 宿主应用控制：继承设计系统                        | 隔离：远程服务器控制外观                                                          | 开发者控制：作为宿主应用的一部分                          |
| **安全性**         | 声明式数据，无代码执行                            | 沙箱化 iframe 隔离                                                                | 应用内的受信代码                                          |
| **多代理**         | ✅ 跨信任边界                                    | ✅ 多个 MCP 服务器                                                               | ⚠️ 主要是单代理                                          |
| **跨平台**         | ✅ Web、移动端、桌面端、原生                      | ⚠️ 主要是 Web（iframe）                                                           | ✅ 协议框架无关                                          |
| **LLM 生成**       | ✅ 为流式输出设计                                 | ❌ 由服务器预构建                                                                  | ✅ 通过 A2UI 集成                                        |
| **规范**           | 开放协议（Apache 2.0）                           | [MCP 扩展](https://modelcontextprotocol.io/docs/extensions/apps)（SEP-1865）       | 开源（由 CopilotKit 提供）                                |

## A2UI vs MCP 应用

[MCP 应用](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/) 将 UI 视为**资源**：服务器通过 `ui://` URI 提供预构建的 HTML，在沙箱化 iframe 中渲染。远程集成控制所有内容和外观，配置通过工具调用完成。A2UI 采用**声明式 UI**方法：代理发送组件蓝图，但宿主应用控制样式、主题以及组件的配置和渲染方式。当服务器应该拥有完整的 UI 体验时选择 MCP 应用；当你需要动态的、跨平台的、自然融入应用的 UI 时选择 A2UI。

## A2UI vs AG-UI / CopilotKit

[AG-UI](https://ag-ui.com/) 是一种**传输协议**，连接代理后端与前端，实现实时状态同步。A2UI 是一种**UI 格式**：描述要渲染内容的负载。它们互为补充：使用 AG-UI 作为管道，A2UI 作为内容。AG-UI 是 [CopilotKit](https://copilotkit.ai) 团队的项目，该团队还贡献了 [A2UI Composer](../composer.md)。AG-UI 具有开箱即用的 A2UI 兼容性。

## A2UI vs ChatKit（OpenAI）

[ChatKit](https://platform.openai.com/docs/guides/chatkit) 在 OpenAI 生态系统中提供了紧密集成的体验。A2UI 与 ChatKit 共享部分设计理念：两者都定义了一组基本组件，并使用可配置的声明式抽象层。A2UI **平台无关**，专为构建自己的代理界面（跨 Web、移动端和桌面端）的开发者设计，也适用于需要在信任边界间渲染 UI 的多代理系统。

## 协同使用

这些方法是互补而非竞争的：

- **A2UI + AG-UI**：AG-UI 作为传输层，A2UI 作为生成式 UI 格式。
- **A2UI + A2A**：通过 [A2A 协议](../concepts/transports.md) 发送 A2UI 消息，用于多代理系统。
- **A2UI + MCP**：即将推出的桥梁让 MCP 服务器可以同时提供 A2UI 蓝图和 HTML 资源。

## 进一步阅读

更多信息，请参见以下资源：

- [什么是 A2UI？](what-is-a2ui.md)：协议概述。
- [传输层](../concepts/transports.md)：A2UI 消息如何在代理和客户端之间传输。
- [A2UI 在现实中的应用](../ecosystem/a2ui-in-the-world.md)：案例研究和采用者。
