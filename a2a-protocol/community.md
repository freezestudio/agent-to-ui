# A2A 社区中心

欢迎来到 **Agent2Agent（A2A）协议**的官方社区中心！A2A 是一种开放、标准化的协议，能够跨所有框架和供应商实现 AI 智能体之间的无缝互操作性和协作。

---

## 最新新闻与博客文章

随时了解来自 A2A 团队和我们社区的最新公告、教程和见解。

- **[宣布智能体支付协议（AP2）](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agent-payments-protocol-ap2)** — *9月16日*
- **[A2A 扩展赋能自定义智能体功能](https://developers.googleblog.com/en/a2a-extensions-empowering-custom-agent-functionality/)** — *9月9日*
- **[A2A 协议：解构任务与消息](https://discuss.google.dev/t/a2a-protocol-demystifying-tasks-vs-messages/255879)** — *8月18日*
- **[在 Vertex AI 上对多智能体系统进行端到端评估](https://discuss.google.dev/t/end-to-end-evaluation-of-multi-agent-systems-on-vertex-ai-with-cloud-run-deployment-for-a2a-agents/250552)** — *8月7日*
- **[Agent2Agent（A2A）协议即将升级](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade?e=48754805)** — *7月26日*

---

## 用例亮点

A2A 开启了 AI 智能体协作和解决复杂问题的新方式。以下是一些可能性的示例：

- **多智能体工作流：** 将专业智能体串联起来，自动化复杂流程，如为招聘寻找候选人或简化供应链物流。
- **智能体市场：** 创建平台，让智能体可以发现和利用来自不同提供商的智能体的能力。
- **跨平台集成：** 连接基于不同框架（如 LangGraph、BeeAI 等）构建的智能体，使其无缝协作。
- **评估多智能体系统：** 使用像 Vertex AI 这样的框架来评估协作智能体轨迹的性能和成功率。

---

## 社区聚焦

### 精选贡献

A2A 是一个开源协议，我们在社区贡献中蓬勃发展。非常感谢所有帮助构建和改进 A2A 的人！以下是一些最近的亮点：

- [Python 快速入门教程（PR#202）](https://github.com/a2aproject/A2A/pull/202)
- [LlamaIndex 示例实现（PR#179）](https://github.com/a2aproject/A2A/pull/179)
- [Autogen 示例服务器（PR#232）](https://github.com/a2aproject/A2A/pull/232)
- [AG2 + MCP 示例（PR#230）](https://github.com/a2aproject/A2A/pull/230)
- [PydanticAI 示例（PR#127）](https://github.com/a2aproject/A2A/pull/127)

### 社区反响

A2A 的发布在各种社交和视频平台上引发了热烈的讨论和积极的反响。

- **Microsoft 的 Semantic Kernel：** Microsoft AI 平台产品负责人 Asha Sharma [在 LinkedIn 上宣布](https://www.linkedin.com/posts/aboutasha_a2a-ugcPost-7318649411704602624-0C_8)"Semantic Kernel 现在说 A2A 了"，实现了即时、安全的互操作性。
- **Matt Pocock 的图解：** 知名开发者教育者 Matt Pocock [在 X 上分享图解](https://x.com/mattpocockuk/status/1910002033018421400)解释 A2A 协议，获得了数百次点赞和转发。
- **Craig McLuckie 的"热评"：** Craig McLuckie [在 LinkedIn 上](https://www.linkedin.com/posts/craigmcluckie_hot-take-on-agent2agent-vs-mcp-google-just-activity-7315939233792176128-4rGQ)分享了他的想法，强调 A2A 专注于智能体系统*之间*的交互是一种明智的方法。
- **Zachary Huang 的深度解读：** 在他的 [YouTube 视频](https://www.youtube.com/watch?v=wrCF8MoXC_I)中，Zachary 解释了 A2A 如何补充 MCP，其中 A2A 处理智能体之间的通信，MCP 将智能体连接到工具。

---

## A2A 集成

这些智能体框架具有内置的 A2A 集成，使其易于上手：

- [Agent Development Kit (ADK)](https://google.github.io/adk-docs/a2a/)
- [Agno](https://docs.agno.com/agent-os/interfaces/a2a/introduction)
- [AG2](https://docs.ag2.ai/latest/docs/user-guide/a2a/)
- [BeeAI Framework](https://framework.beeai.dev/integrations/a2a)
- [CrewAI](https://docs.crewai.com/en/learn/a2a-agent-delegation)
- [Hector](https://github.com/kadirpekel/hector)
- [LangGraph](https://docs.langchain.com/langsmith/server-a2a)
- [LiteLLM](https://docs.litellm.ai/docs/a2a)
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/user-guide/agents/agent-types/a2a-agent)
- [Pydantic AI](https://ai.pydantic.dev/a2a/)
- [Slide (Tyler)](https://slide.mintlify.app/guides/a2a-integration)
- [Strands Agents](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/agent-to-agent/)

## 社区 SDK

正在使用官方 SDK 未覆盖的语言构建 A2A 智能体？这些社区维护的实现可以满足您的需求。

### 🦀 Rust — a2a-rust

![Stars](https://img.shields.io/github/stars/tomtom215/a2a-rust?style=flat-square) [![Crate](https://img.shields.io/crates/v/a2a-protocol-sdk?style=flat-square)](https://crates.io/crates/a2a-protocol-sdk)

[tomtom215/a2a-rust](https://github.com/tomtom215/a2a-rust) · A2A 规范 v1.0.0 · 完整 SDK，支持 JSON-RPC、REST、WebSocket 和 gRPC 传输。

### 🦀 Rust — a2a-rs

![Stars](https://img.shields.io/github/stars/EmilLindfors/a2a-rs?style=flat-square) [![Crate](https://img.shields.io/crates/v/a2a-rs?style=flat-square)](https://crates.io/crates/a2a-rs)

[EmilLindfors/a2a-rs](https://github.com/EmilLindfors/a2a-rs) · A2A 规范 v0.3.0 · 模块化工作区，包含核心协议、AP2 扩展和智能体框架。

### 🍎 Swift — A2AClient

![Stars](https://img.shields.io/github/stars/tolgaki/a2a-client-swift?style=flat-square)

[tolgaki/a2a-client-swift](https://github.com/tolgaki/a2a-client-swift) · A2A 规范 v1.0.0 · Swift Package Manager。iOS 15+、macOS 12+、watchOS 8+、tvOS 15+。

### 💧 Elixir — a2a

![Stars](https://img.shields.io/github/stars/actioncard/a2a-elixir?style=flat-square) [![Hex](https://img.shields.io/hexpm/v/a2a?style=flat-square)](https://hex.pm/packages/a2a)

[actioncard/a2a-elixir](https://github.com/actioncard/a2a-elixir) · A2A 规范 v0.2.0 · OTP 原生，具有智能体行为、TaskStore 和监督树。

!!! tip "想要添加您的 SDK？"
    在 [a2aproject/A2A](https://github.com/a2aproject/A2A/issues/new?title=Community%20SDK%20Submission) 上打开一个问题，附上您的仓库和已发布包的链接。

**要求：** 符合规范、在标准注册中心发布包、文档、带 CI 的测试、Apache 2.0 许可证和积极维护。

## 未来是互操作的

围绕 Google 的 A2A 协议的兴奋清楚地表明人们相信它有潜力彻底改变多智能体 AI 系统。通过为 AI 智能体提供标准化的通信和协作方式，A2A 有望释放新的自动化和创新水平。随着企业越来越多地采用 AI 智能体，A2A 代表了实现互联 AI 生态系统全部潜力的关键一步。

**加入不断壮大的社区，用 A2A 构建 AI 互操作性的未来！**
