---
hide:
  - toc
---

<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD033 -->
<div style="text-align: center; margin: 2rem 0 3rem 0;" markdown>

<!-- 浅色模式 Logo（浅色背景上显示深色 Logo） -->
<img src="assets/A2UI_dark.svg" alt="A2UI Logo" width="120" class="light-mode-only" style="margin-bottom: 1rem;">
<!-- 深色模式 Logo（深色背景上显示浅色 Logo） -->
<img src="assets/A2UI_light.svg" alt="A2UI Logo" width="120" class="dark-mode-only" style="margin-bottom: 1rem;">

# 代理驱动界面的协议

<p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 1rem auto; opacity: 0.9; line-height: 1.6;">
A2UI 使 AI 代理能够生成丰富的交互式用户界面，在 Web、移动端和桌面端原生渲染——无需执行任意代码。
</p>

</div>

## 规范版本

| 版本                                        | 状态        | 描述                                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[v1.0](specification/v1.0-a2ui.md)**     | **候选** | 发布候选版本。添加客户端到服务器的 RPC（`actionResponse`）、操作 ID，并将主题重命名为 surfaceProperties。（草案阶段曾指定为 v0.10）。[进化指南 →](specification/v1.0-evolution-guide.md)                       |
| **[v0.9.1](specification/v0.9.1-a2ui.md)** | **当前**   | 当前生产版本。对 v0.9 的细微改进，标准化 `application/a2ui+json` MIME 类型并放宽 surfaceId 约束。[进化指南 →](specification/v0.9.1-evolution-guide.md)                                        |
| **[v0.9](specification/v0.9-a2ui.md)**     | **稳定**    | 上一个稳定版本。哲学转向提示优先。引入 `createSurface`、客户端函数、自定义目录、模块化模式和验证失败错误格式。[进化指南 →](specification/v0.9-evolution-guide.md) |
| **[v0.8](specification/v0.8-a2ui.md)**     | **旧版**    | 旧版。结构化输出优先。基线表面、组件、数据绑定和邻接表模型。                                                                                                                                       |

A2UI 采用 Apache 2.0 许可，
由 Google 创建，CopilotKit 和开源社区贡献，
并在 [GitHub](https://github.com/a2ui-project/a2ui) 上积极开发。

A2UI 解决以下问题：**AI 代理如何安全地在信任边界间发送丰富的 UI？**

不同于纯文本响应或危险的代码执行，A2UI 让代理发送**声明式组件描述**，客户端使用自己的原生部件渲染。就像代理说一种通用的 UI 语言。

此仓库包含：

- **[A2UI 规范](specification/v0.9.1-a2ui.md)**（v0.9.1 当前版，v1.0 候选版）。
- **[渲染器](reference/renderers.md)的实现**（Angular、Flutter、Lit、Markdown 等）在客户端。
- **[像 A2A 这样的传输层](concepts/transports.md)**，在代理和客户端之间传输 A2UI 消息。

<div class="grid cards" markdown>

- :material-shield-check: **安全设计**

    ***

    声明式数据格式，而非可执行代码。代理只能使用目录中预先批准的组件——没有 UI 注入攻击。

- :material-rocket-launch: **LLM 友好**

    ***

    扁平的流式 JSON 结构，专为轻松生成而设计。LLM 可以增量构建 UI，无需一次性生成完美的 JSON。

- :material-devices: **框架无关**

    ***

    一个代理响应随处可用。在 Angular、Flutter、React 或原生移动端上渲染相同的 UI，使用你自己样式的组件。

- :material-chart-timeline: **渐进式渲染**

    ***

    边生成边流式传输 UI 更新。用户实时看到界面构建，而不是等待完整响应。

</div>

## 5 分钟快速入门

<div class="grid cards" markdown>

- :material-clock-fast:{ .lg .middle } **[快速入门餐厅查找演示](quickstart.md)**

    ***

    使用 Gemini 驱动的 ADK 代理和 Lit 渲染器在本地运行全栈演示。端到端学习 A2UI 并自定义以适应你的用例。

    [:octicons-arrow-right-24: 运行演示](quickstart.md)

- :material-react:{ .lg .middle } **[A2UI + AG-UI（CopilotKit）](guides/a2ui-with-any-agent-framework.md)**

    ***

    使用 CopilotKit 搭建应用，通过 AG-UI 连接到任何代理框架，然后启用 A2UI 渲染。

    [:octicons-arrow-right-24: 与任何代理一起使用](guides/a2ui-with-any-agent-framework.md)

- :material-palette-outline:{ .lg .middle } **[A2UI Composer](https://a2ui-composer.ag-ui.com/)**

    ***

    从可视化编辑器生成 A2UI JSON——无需安装。将输出粘贴到任何代理提示中。

    [:octicons-arrow-right-24: 打开 Composer](https://a2ui-composer.ag-ui.com/)

- :material-play-circle-outline:{ .lg .middle } **[A2UI 剧场](https://a2ui-composer.ag-ui.com/theater)**

    ***

    逐步浏览跨 Lit、React 和 Angular 渲染器的预建 A2UI 流式场景。在编写代码之前查看协议运行。

    [:octicons-arrow-right-24: 打开游乐场](https://a2ui-composer.ag-ui.com/theater)

- :material-book-open-variant:{ .lg .middle } **[核心概念](concepts/overview.md)**

    ***

    理解表面、组件、数据绑定和邻接表模型。

    [:octicons-arrow-right-24: 学习概念](concepts/overview.md)

- :material-code-braces:{ .lg .middle } **[开发者指南](guides/client-setup.md)**

    ***

    将 A2UI 渲染器集成到你的应用中，或构建生成 UI 的代理。

    [:octicons-arrow-right-24: 开始构建](guides/client-setup.md)

- :material-file-document:{ .lg .middle } **协议规范**

    ***

    深入完整的技术规格：[v0.8（旧版）](specification/v0.8-a2ui.md) · [v0.9（稳定版）](specification/v0.9-a2ui.md) · [v0.9.1（当前版）](specification/v0.9.1-a2ui.md) · [v1.0（候选版）](specification/v1.0-a2ui.md)

    [:octicons-arrow-right-24: 阅读 v0.9.1 规范](specification/v0.9.1-a2ui.md)

</div>

## 工作原理

典型的交互流程包括以下步骤：

1. **用户向 AI 代理发送消息**
2. **代理生成 A2UI 消息**描述 UI（结构 + 数据）
3. **消息流式传输**到客户端应用
4. **客户端使用原生组件渲染**（Angular、Flutter、React 等）
5. **用户与 UI 交互**，将操作发送回代理
6. **代理用更新的 A2UI 消息响应**

![端到端数据流](assets/end-to-end-data-flow.png)

## A2UI 实战

### 景观建筑师演示

<div style="margin: 2rem 0;">
  <div style="border-radius: .8rem; overflow: hidden; box-shadow: var(--md-shadow-z2);">
    <video width="100%" height="auto" controls playsinline style="display: block; aspect-ratio: 16/9; object-fit: cover;">
      <source src="assets/landscape-architect-demo.mp4" type="video/mp4">
      你的浏览器不支持视频标签。
    </video>
  </div>
  <p style="text-align: center; margin-top: 1rem; opacity: 0.8;">
    观看代理为景观建筑师应用生成所有界面。用户上传照片；代理使用 Gemini 理解它并生成用于景观美化需求的自定义表单。
  </p>
</div>

### 自定义组件：交互式图表和地图

<div style="margin: 2rem 0;">
  <div style="border-radius: .8rem; overflow: hidden; box-shadow: var(--md-shadow-z2);">
    <video width="100%" height="auto" controls playsinline style="display: block; aspect-ratio: 16/9; object-fit: cover;">
      <source src="assets/a2ui-custom-component.mp4" type="video/mp4">
      你的浏览器不支持视频标签。
    </video>
  </div>
  <p style="text-align: center; margin-top: 1rem; opacity: 0.8;">
    观看代理选择使用图表组件来回答数字汇总问题。然后代理选择 Google 地图组件来回答位置问题。两者都是客户端提供的自定义组件。
  </p>
</div>

### A2UI Composer

CopilotKit 还有一个公开的 [A2UI 部件构建器](https://go.copilotkit.ai/A2UI-widget-builder) 可以试用。

[![A2UI Composer](assets/A2UI-widget-builder.png)](https://go.copilotkit.ai/A2UI-widget-builder)
