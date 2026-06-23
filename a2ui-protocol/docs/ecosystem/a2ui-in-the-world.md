# A2UI 在现实中的应用

A2UI 正被 Google 和合作组织的团队采用，以构建下一代代理驱动应用。以下是 A2UI 产生实际影响的真实案例。

## 生产部署

### Google Opal：面向所有人的 AI 迷你应用

[Opal](http://opal.google) 使数十万人能够使用自然语言构建、编辑和分享 AI 迷你应用——无需编码。

**Opal 如何使用 A2UI：**

Google 的 Opal 团队从一开始就是 **A2UI 的核心贡献者**。他们使用 A2UI 来驱动使 Opal 的 AI 迷你应用成为可能的动态生成式 UI 系统。

- **快速原型设计**：快速构建和测试新的 UI 模式。
- **用户生成的应用**：任何人都可以创建带有自定义 UI 的应用。
- **动态界面**：UI 自动适应每个用例。

> "A2UI 是我们工作的基础。它让我们能够以新颖的方式让 AI 驱动用户体验，而不受固定前端的约束。它的声明式特性和对安全性的关注使我们能够快速安全地进行实验。"
>
> **— Dimitri Glazkov**，首席工程师，Opal 团队

**了解更多：** [opal.google](http://opal.google)

---

### Gemini Enterprise：面向企业的自定义代理

Gemini Enterprise 使企业能够构建强大的、自定义的 AI 代理，以适应其特定的工作流程和数据。

**Gemini Enterprise 如何使用 A2UI：**

A2UI 正在被集成，允许企业代理在企业应用中渲染**丰富的交互式 UI**——超越简单的文本响应，引导员工完成复杂的工作流程。

- **数据录入表单**：AI 生成的用于结构化数据收集的表单。
- **审批仪表盘**：用于审核和批准流程的动态 UI。
- **工作流自动化**：复杂任务的逐步界面。
- **自定义企业 UI**：针对行业特定需求的定制界面。

> "我们的客户需要的代理不仅仅是回答问题；他们需要代理引导员工完成复杂的工作流程。A2UI 将允许在 Gemini Enterprise 上构建的开发者让他们的代理生成任何任务所需的动态自定义 UI——从数据录入表单到审批仪表盘——极大地加速工作流自动化。"
>
> **— Fred Jabbour**，产品经理，Gemini Enterprise

**了解更多：** [Gemini Enterprise](https://cloud.google.com/gemini)

---

### Flutter GenUI SDK：移动端生成式 UI

[Flutter GenUI SDK](https://docs.flutter.dev/ai/genui) 为 Flutter 应用带来了动态的 AI 生成 UI，覆盖移动端、桌面端和 Web。

**GenUI 如何使用 A2UI：**

GenUI SDK 使用 **A2UI 作为底层协议**，用于服务器端代理和 Flutter 应用之间的通信。当你使用 GenUI 时，底层就在使用 A2UI。

- **跨平台支持**：同一个代理适用于 iOS、Android、Web、桌面端。
- **原生性能**：Flutter 部件在每个平台上原生渲染。
- **品牌一致性**：UI 匹配你的应用设计系统。
- **服务器驱动 UI**：代理控制显示内容，无需应用更新。

> "我们的开发者选择 Flutter 是因为它让他们能够快速创建表达性强、品牌丰富、自定义的设计系统，在每个平台都感觉良好。A2UI 非常适合 Flutter 的 GenUI SDK，因为它确保每个用户、在每个平台上都能获得高质量的原生体验。"
>
> **— Vijay Menon**，工程总监，Dart & Flutter

**尝试：**

- [GenUI 文档](https://docs.flutter.dev/ai/genui)
- [入门视频](https://www.youtube.com/watch?v=nWr6eZKM6no)
- [Verdure 示例](https://github.com/flutter/genui/tree/main/examples/verdure)（客户端-服务器 A2UI 示例）

---

### Google ADK：代理开发工具包

[代理开发工具包（ADK）](https://google.github.io/adk-docs/) 是 Google 用于构建和部署 AI 代理的开源框架。内置的开发者 UI [ADK Web](https://github.com/google/adk-web) 包含原生 A2UI 渲染。

**ADK 如何使用 A2UI：**

ADK 集成了 A2UI v0.8 基本目录，自动将符合规范的代理部分渲染为聊天中的原生 UI 组件。ADK 还处理 A2UI↔A2A 消息转换，因此使用 ADK 构建的代理可以向任何支持 A2UI 的客户端发送丰富的 UI。

- **内置渲染**：ADK Web 在开发者 UI 中原生渲染 A2UI 组件。
- **A2A 集成**：A2UI 消息在 A2A DataPart 元数据和 ADK 事件之间转换。
- **代理 SDK**：[A2UI Python 代理 SDK](https://github.com/a2ui-project/a2ui/tree/main/agent_sdks/python) 提供了用于从代理生成 A2UI 的 ADK 扩展。

**尝试：**

- [ADK 文档](https://google.github.io/adk-docs/)
- [ADK Web](https://github.com/google/adk-web)（支持 A2UI 的开发者 UI）
- [代理开发指南](../guides/agent-development.md)（使用 ADK 构建 A2UI 代理）

---

## 合作伙伴集成

### AG-UI / CopilotKit：全栈代理框架

[AG-UI](https://ag-ui.com/) 提供协议，[CopilotKit](https://www.copilotkit.ai/) 提供主要的全栈框架，用于构建代理应用，具有**零日 A2UI 兼容性**。

**它们如何协同工作：**

AG-UI 擅长创建自定义前端与其专用代理之间的高带宽连接。通过添加 A2UI 支持，开发者获得了两全其美的体验：

- **状态同步**：AG-UI 处理应用状态和聊天历史。
- **A2UI 渲染**：渲染来自第三方代理的动态 UI。
- **多代理支持**：协调来自多个代理的 UI。
- **框架集成**：通过 CopilotKit 支持 React、Vue、Angular 和其他应用界面。

> "AG-UI 擅长创建自定义构建的前端与其专用代理之间的高带宽连接。通过添加对 A2UI 的支持，我们为开发者提供了两全其美的体验。他们现在可以构建丰富的、状态同步的应用，同时也可以通过 A2UI 渲染来自第三方代理的动态 UI。对于多代理世界来说，这是一个完美的匹配。"
>
> **— Atai Barkai**，CopilotKit 和 AG-UI 创始人

**了解更多：**

- [AG-UI](https://ag-ui.com/)
- [CopilotKit](https://www.copilotkit.ai/)

---

### AG2：具有原生 A2UI 的多代理框架

[AG2](https://ag2.ai/) 是一个流行的多代理框架，提供高级的代理编排。其 [A2UIAgent](https://docs.ag2.ai/latest/docs/user-guide/reference-agents/a2uiagent) 是一个具有原生 A2UI 支持的参考代理，使 AG2 代理能够生成丰富的交互式 UI，同时通过 A2A 和 AG-UI 提供服务。

**AG2 如何使用 A2UI：**

A2UIAgent 扩展了 AG2 的 ConversableAgent，内置了 A2UI 能力——提示工程、带重试的模式验证和操作处理——使开发者无需自定义渲染代码即可为其代理添加生成式 UI。

- **验证输出**：内置模式验证和重试确保可靠的 A2UI 生成。
- **双传输**：通过 A2A（JSON-RPC）和 AG-UI（SSE）提供相同的 UI。
- **跨平台**：一个代理服务于 Web、桌面端和移动端客户端。
- **自定义目录**：用领域特定组件扩展组件目录。

> "A2UIAgent 将 A2UI 协议引入 AG2，使代理能够通过动态、丰富和交互式 UI 进行表达。可靠的、客户端无关的渲染意味着我们的开发者花更少的时间在集成上，更多的时间在构建出色的体验上。"
>
> **— Mark Sze**，创始工程师，AG2

**了解更多：**

- [A2UIAgent 文档](https://docs.ag2.ai/latest/docs/user-guide/reference-agents/a2uiagent)
- [技术深度解析](https://docs.ag2.ai/latest/docs/blog/2026/03/20/AG2-A2UI/) — 使用 AG2 构建 A2UI 代理
- [A2UIAgent + Flutter 示例](https://github.com/ag2ai/build-with-ag2/tree/main/a2ui/flutter) — 通过 A2A 向 Flutter GenUI 客户端提供 A2UIAgent 服务
- [AG2](https://ag2.ai/)

---

### Google 的 AI 驱动产品

随着 Google 在公司范围内采用 AI，A2UI 为 AI 代理之间交换用户界面（而不仅仅是文本）提供了**标准化方式**。

**内部代理采用：**

- **多代理工作流程**：多个代理贡献到同一表面。
- **远程代理支持**：在不同服务上运行的代理可以提供 UI。
- **标准化**：团队间通用协议减少集成开销。
- **外部暴露**：内部代理可以轻松暴露到外部（例如 Gemini Enterprise）。

> "就像 A2A 让任何代理无论平台如何都能与另一个代理对话一样，A2UI 标准化了用户界面层，并通过编排器支持远程代理用例。这对内部团队来说非常强大，使他们能够快速开发丰富的用户界面成为常态而非例外的代理。随着 Google 进一步推进生成式 UI，A2UI 为在任何客户端上渲染的服务器驱动 UI 提供了完美平台。"
>
> **— James Wren**，高级职员工程师，AI Powered Google

---

## 社区项目

A2UI 社区正在构建令人兴奋的项目：

### 开源示例

- **餐厅查找**（[samples/agent/adk/restaurant_finder](https://github.com/a2ui-project/a2ui/tree/main/samples/agent/adk/restaurant_finder)）
    - 使用动态表单的餐桌预订
    - Gemini 驱动的代理
    - 完整源代码可用

- **组件画廊**（[samples/client/angular - gallery mode](https://github.com/a2ui-project/a2ui/tree/main/samples/client/angular)）
    - 所有组件的交互式展示
    - 带代码的实时示例
    - 非常适合学习

### 第三方集成

- **[json-render](https://json-render.dev/docs/a2ui)** — Vercel 的 React 库，通过 Zod 模式渲染 A2UI 组件目录。参见 [json-render vs. A2UI 对比](https://dipjyotimetia.medium.com/vercels-json-render-vs-google-s-a2ui-the-head-to-head-6f213cf1a23b)。
- **[OpenClaw Canvas](https://docs.openclaw.ai/platforms/mac/canvas)** — OpenClaw 使用 A2UI 通过其画布系统在连接设备上渲染代理生成的 UI。参见[架构概述](https://ppaolo.substack.com/p/openclaw-system-architecture-overview)。

### 社区贡献

你用 A2UI 构建了什么？[与社区分享！](community.md)

---

## 下一步

更多信息，请参见以下资源：

- [快速入门指南](../quickstart.md) - 尝试演示。
- [代理开发](../guides/agent-development.md) - 构建代理。
- [客户端设置](../guides/client-setup.md) - 集成渲染器。
- [社区](community.md) - 加入社区。

---

**在生产中使用 A2UI？** 在 [GitHub Discussions](https://github.com/a2ui-project/a2ui/discussions) 上分享你的故事。
