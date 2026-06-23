# 通过模型上下文协议 (MCP) 使用 A2UI

本指南展示如何从 **MCP 服务器** 使用工具和内嵌资源提供**丰富的交互式 A2UI 界面**。最后，你将拥有一个可工作的 MCP 服务器，可以向任何兼容 MCP 的客户端返回 A2UI 组件。

<video width="100%" height="auto" controls playsinline style="display: block; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; margin-bottom: 24px;">
  <source src="https://raw.githubusercontent.com/a2ui-project/a2ui/main/docs/assets/guides-a2ui-over-mcp-tour.mp4" type="video/mp4">
  你的浏览器不支持视频标签。
</video>

## 前提条件

开始之前，确保你已安装以下工具：

- **Python**（3.10 或更高版本）。
- **[uv](https://docs.astral.sh/uv/)** 用于快速的 Python 包管理。
- **Node.js**（18 或更高版本）用于 MCP Inspector。

## 快速入门：运行示例

在深入了解协议细节之前，先运行一个可工作的示例。A2UI 仓库包含一个即用型的 MCP 配方演示。

```bash
# 克隆仓库（如果尚未克隆）
git clone https://github.com/a2ui-project/a2ui.git
cd a2ui/samples/mcp/a2ui-over-mcp-recipe

# 启动 MCP 服务器（SSE 传输，端口 8000）
uv run .
```

### 选项 A：通过 MCP Inspector 交互

在另一个终端中，启动 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 与服务器交互：

```bash
npx @modelcontextprotocol/inspector
```

在 Inspector 中：

1. 将**传输类型**设置为 `SSE`
2. 连接到 `http://localhost:8000/sse`
3. 点击 **List Resources** → 你将看到"Recipe Form"资源。
4. 读取 `a2ui://recipe-form` 资源 → 资源内容是渲染简单表单的 A2UI JSON。
5. 点击 **List Tools** → 你将看到 `get_recipe_a2ui`
6. 运行该工具 → 响应包含渲染配方卡片的 A2UI JSON

> **注意**
> 示例使用了指向 A2UI 代理 SDK 的本地路径引用。对于你自己的项目，从 PyPI 安装：
>
> ```bash
> pip install a2ui-agent-sdk
> ```

### 选项 B：运行配方客户端 Web 应用

要获得完整的渲染交互体验，请运行包含的 Web 应用。

## 工作原理

MCP 服务器可以通过两种主要方式向客户端提供 A2UI 内容：

1. **通过读取资源 (`resources/read`)**：客户端直接读取 MCP 资源（例如 `a2ui://recipe-form`）。服务器直接返回 A2UI JSON 负载。
2. **通过调用工具 (`tools/call`)**：客户端调用 MCP 工具（例如 `get_recipe_a2ui`）。服务器返回包装在工具响应中的 A2UI JSON 负载，作为**内嵌资源**。

在这两种情况下，客户端检测 `application/a2ui+json` MIME 类型并将负载路由到 A2UI 渲染器。

## 资源 vs. 工具：关注点分离

在为 MCP 设计 A2UI 集成时，你应根据 UI 负载是静态还是动态来选择**资源**或**工具**。

### 1. 通过 MCP 资源实现的静态 UI (`resources/read`)

对于不依赖用户提示输入或对话历史的简单静态用户界面，你应该将 A2UI 直接作为 MCP 资源提供。

### 2. 通过 MCP 工具实现的动态 UI (`tools/call`)

对于需要根据对话上下文、用户参数或实时数据动态生成的用户界面，你应该在 MCP 工具的响应中提供 A2UI。

## 目录协商

在服务器可以向客户端发送 A2UI 之前，它们必须确定哪些目录可用。根据你的架构，这可以通过两种方式之一实现。

### 选项 A：在 MCP 初始化期间（推荐）

MCP 是有状态的会话协议，因此最高效的方式是在连接设置期间声明一次能力。

### 选项 B：每条消息的元数据（用于无状态服务器）

如果你的服务器必须保持无状态，客户端可以在每个工具调用的 `_meta` 字段中传递 A2UI 能力。

## 处理用户操作

交互式组件（如 `Button`）可以触发作为 MCP 工具调用发送回服务器的操作。

## 下一步

- [A2UI 规范](../specification/v0.9-a2ui.md) — 完整协议参考
- [组件画廊](../reference/components.md) — 浏览可用组件
- [A2UI 表面的 MCP 应用](mcp-apps-in-a2ui.md) — 在 A2UI 中嵌入基于 HTML 的 MCP 应用
- [客户端设置](client-setup.md) — 构建显示 A2UI 的渲染器
