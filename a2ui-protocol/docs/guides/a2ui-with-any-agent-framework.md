# 使用任意代理框架配合 A2UI（通过 AG-UI）

A2UI 是一种声明式 UI 格式。[AG-UI](https://ag-ui.com/) 是在代理和应用之间传输 A2UI 消息的传输层。CopilotKit 的 AG-UI 实现是今天让 A2UI 面向用户的最快路径。CopilotKit 支持的任何代理框架（ADK、LangGraph、CrewAI、Mastra、自定义 Python/TS 服务等）都可以发出 A2UI 并在受支持的应用界面中渲染，无需传输粘合代码。

## 1. 设置 CopilotKit

将 CopilotKit 与你选择的代理框架（ADK、LangGraph、CrewAI、Mastra 等）一起安装到你的应用中：

```bash
npx copilotkit@latest init
```

或按照 [CopilotKit 快速入门](https://docs.copilotkit.ai/quickstart) 将其连接到现有项目中。这是标准的 CopilotKit 设置，没有 A2UI 特定的脚手架。

## 2. 启用 A2UI

### 后端

在 `CopilotRuntime` 中启用 A2UI。对于动态模式流程，注入 `render_a2ui` 工具，使你的代理能够生成 A2UI 表面：

```ts title="app/api/copilotkit/route.ts"
import {CopilotRuntime} from '@copilotkit/runtime';

const runtime = new CopilotRuntime({
  agents: {default: myAgent},
  a2ui: {injectA2UITool: true},
});
```

### 前端

A2UI 渲染器会自动激活。本指南使用 React/Next.js 代码片段；CopilotKit 还通过其他应用界面支持 A2UI，包括 Vue、Angular 和 React Native/无头客户端。可选地传递一个主题：

```tsx
import {CopilotKitProvider} from '@copilotkit/react-core/v2';
import '@copilotkit/react-core/v2/styles.css';
import {myCustomTheme} from '@copilotkit/a2ui-renderer';

<CopilotKitProvider runtimeUrl="/api/copilotkit" a2ui={{theme: myCustomTheme}}>
  {children}
</CopilotKitProvider>;
```

### 自定义组件（BYOC）

A2UI 附带一个内置目录（Text、Image、Card 等），可以让你立即获得一个可工作的表面。真正的力量来自于用你的设计系统和数据形状中的 **React 组件** 扩展它，使代理能够从你已经信任的原语组成界面。一个目录包含三个部分：

1. **定义**：Zod 模式加上自然语言描述。这是代理在其系统提示中看到的内容。
2. **渲染器**：类型化的 React 组件，每个定义一个。这是用户看到的内容。
3. **注册**：通过提供者传递目录，以便 A2UI 渲染器知道如何绘制你的组件。

## 下一步

- **[A2UI Composer](https://a2ui-composer.ag-ui.com/)**：可视化构建部件。
- **[概念 › 传输层](../concepts/transports.md)**：A2UI 如何映射到 AG-UI。
- **[v0.9 规范](../specification/v0.9-a2ui.md)**：底层协议。
