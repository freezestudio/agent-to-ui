# 下一步

恭喜您完成 A2A Python SDK 教程！您已经学会了如何：

- 为 A2A 开发设置环境。
- 使用 SDK 的类型定义智能体技能和智能体卡片。
- 实现基本的 HelloWorld A2A 服务器和客户端。
- 理解并实现流式传输功能。
- 使用 LangGraph 集成更复杂的智能体，演示任务状态管理和工具使用。

您现在已经有了构建和集成您自己的符合 A2A 的智能体的坚实基础。

## 接下来去哪里？

以下是一些继续您的 A2A 之旅的想法和资源：

- **探索其他示例：**
    - 查看 [a2a-samples GitHub 仓库](https://github.com/a2aproject/a2a-samples/tree/main/samples) 中的其他示例，了解更复杂的智能体集成和功能。
- **加深对协议的理解：**
    - 📚 阅读完整的 [A2A 协议文档网站](https://a2a-protocol.org) 以获取全面概述。
    - 📝 查看详细的 [A2A 协议规范](../../specification.md) 以了解所有数据结构和 RPC 方法的细微差别。
- **回顾关键 A2A 主题：**
    - [A2A 和 MCP](../../topics/a2a-and-mcp.md)：了解 A2A 如何补充模型上下文协议以用于工具使用。
    - [企业级特性](../../topics/enterprise-ready.md)：了解安全、可观测性和其他企业考虑因素。
    - [流式传输与异步操作](../../topics/streaming-and-async.md)：获取关于 SSE 和推送通知的更多细节。
    - [智能体发现](../../topics/agent-discovery.md)：探索智能体可以互相发现的不同方式。
- **构建您自己的智能体：**
    - 尝试使用您最喜欢的 Python 智能体框架（如 LangChain、CrewAI、AutoGen、Semantic Kernel 或自定义解决方案）创建新的 A2A 智能体。
    - 实现 `a2a.server.agent_execution.AgentExecutor` 接口，将智能体的逻辑与 A2A 协议桥接起来。
    - 思考您的智能体可以提供哪些独特技能，以及其智能体卡片如何表示这些技能。
- **尝试高级功能：**
    - 如果您的智能体处理长时间运行或多会话任务，请使用持久化 `TaskStore` 实现健壮的任务管理。
    - 如果智能体的任务生命周期非常长，请探索实现推送通知。
    - 考虑更复杂的输入和输出模态（例如，通过文件部件处理文件上传/下载，或通过数据部件处理结构化数据）。
- **为 A2A 社区做贡献：**
    - 加入 [A2A GitHub Discussions 页面](https://github.com/a2aproject/A2A/discussions) 的讨论。
    - 通过 [GitHub Issues](https://github.com/a2aproject/A2A/issues) 报告问题或提出改进建议。
    - 考虑贡献代码、示例或文档。请参阅 [CONTRIBUTING.md](https://github.com/a2aproject/A2A/blob/main/CONTRIBUTING.md) 指南。

A2A 协议旨在促进互操作 AI 智能体的生态系统。通过构建和分享符合 A2A 的智能体，您可以成为这一激动人心发展的一部分！
