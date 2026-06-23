# 快速入门：5 分钟运行 A2UI

通过运行餐厅查找演示来亲手体验 A2UI。本指南让你在不到 5 分钟内体验代理生成的 UI。

## 你将构建什么

本快速入门结束时，你将拥有：

- 一个带有 A2UI Lit 渲染器的运行中的 Web 应用。
- 一个生成动态 UI 的 Gemini 驱动代理。
- 一个带有表单生成、时间选择和确认流程的交互式餐厅查找器。
- 理解 A2UI 消息如何从代理流向 UI。

## 前提条件

开始之前，请确保你拥有：

- **Node.js**（v18 或更高版本，已启用 [Corepack](https://nodejs.org/api/corepack.html)）— [在此下载](https://nodejs.org/)
- **uv**（Python 包管理器）— [在此安装](https://docs.astral.sh/uv/getting-started/installation/)（用于运行 Python 代理后端）
- **Gemini API 密钥**— [从 Google AI Studio 免费获取](https://aistudio.google.com/apikey)

> **安全提示**
> 此演示运行一个使用 Gemini 生成 A2UI 响应的 A2A 代理。代理可以访问你的 API 密钥，并将向 Google 的 Gemini API 发出请求。在生产环境中运行之前，请始终审查代理代码。

## 第 1 步：克隆仓库

```bash
git clone https://github.com/a2ui-project/a2ui.git
cd a2ui
```

## 第 2 步：设置 API 密钥

将你的 Gemini API 密钥导出为环境变量：

```bash
export GEMINI_API_KEY="你的_gemini_api_密钥"
```

## 第 3 步：导航到 Lit 客户端示例目录

客户端应用源代码位于 `samples/client/lit/shell`。导航到父示例目录以运行演示：

```bash
cd samples/client/lit
```

## 第 4 步：安装并运行

运行演示启动器（确保 Corepack 已启用，以便 Node 自动获取正确的 Yarn 版本）：

```bash
# 启用 Corepack
corepack enable

yarn install
yarn demo:restaurant
```

> **macOS Homebrew 用户：** 如果你安装了独立的包管理器，请在安装 Corepack 之前解除链接冲突，以便 Corepack 可以按项目管理版本：
>
> ```bash
> brew unlink yarn pnpm
> brew install corepack
> corepack enable
> ```

此命令将：

1. 安装所有依赖
2. 构建 A2UI 渲染器
3. 启动 A2A 餐厅查找代理（Python 后端）
4. 启动开发服务器
5. 在浏览器中打开 `http://localhost:5173`

餐厅查找代理的源代码位于 [`samples/agent/adk/restaurant_finder`](../samples/agent/adk/restaurant_finder)。

> **包管理器使用说明：** 在 A2UI 仓库内运行快速入门演示应用需要 Yarn（由 Corepack 工作区配置）。对于你自己的常规使用和此仓库之外的独立项目，请使用你选择的包管理器（如 npm、pnpm）。

### 手动运行（备选）

如果你更愿意在单独的终端中运行代理和客户端，或需要故障排除：

**1. 运行代理：**

```bash
cd samples/agent/adk/restaurant_finder
uv run .
```

**2. 运行客户端：**

```bash
cd samples/client/lit/shell
yarn dev
```

> **演示运行中**
> 如果一切正常，你将在浏览器中看到 Web 应用。代理现在可以生成 UI 了！

## 第 5 步：试一试

在 Web 应用中，尝试以下提示：

1. **"预订一张2人桌"** - 观看代理生成预订表单
2. **"查找附近的意大利餐厅"** - 查看动态搜索结果
3. **"营业时间是什么？"** - 体验不同意图的不同 UI 布局

### 幕后发生了什么

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│   你输入消息  │────────>│ A2A 代理     │────────>│  Gemini API    │
│             │         │  (Python)    │         │  (LLM)         │
└─────────────┘         └──────────────┘         └────────────────┘
                               │                         │
                               │ 生成 A2UI JSON          │
                               │<────────────────────────┘
                               │
                               │ 流式传输 JSONL 消息
                               v
                        ┌──────────────┐
                        │   Web 应用   │
                        │ (A2UI Lit    │
                        │  渲染器)     │
                        └──────────────┘
                               │
                               │ 渲染原生组件
                               v
                        ┌──────────────┐
                        │   你的 UI    │
                        └──────────────┘
```

1. **你通过 Web UI 发送消息**
2. **A2A 代理**接收它并将对话发送给 Gemini
3. **Gemini 生成**描述 UI 的 A2UI JSON 消息
4. **A2A 代理将这些消息**流式传输回 Web 应用
5. **A2UI 渲染器**将它们转换为原生 Web 组件
6. **你在浏览器中看到 UI**

## A2UI 消息结构

让我们看看代理在发送什么。以下是 JSON 消息的简化示例：

=== "v0.8（旧版）"

    **定义 UI：**

    ```json
    {"surfaceUpdate": {"surfaceId": "main", "components": [
      {"id": "header", "component": {"Text": {"text": {"literalString": "预订餐桌"}, "usageHint": "h1"}}},
      {"id": "date-picker", "component": {"DateTimeInput": {"label": {"literalString": "选择日期"}, "value": {"path": "/reservation/date"}, "enableDate": true}}},
      {"id": "submit-text", "component": {"Text": {"text": {"literalString": "确认预订"}}}},
      {"id": "submit-btn", "component": {"Button": {"child": "submit-text", "action": {"name": "confirm_booking"}}}}
    ]}}
    ```

    **填充数据：**

    ```json
    {"dataModelUpdate": {"surfaceId": "main", "contents": [
      {"key": "reservation", "valueMap": [
        {"key": "date", "valueString": "2025-12-15"},
        {"key": "time", "valueString": "19:00"},
        {"key": "guests", "valueInt": 2}
      ]}
    ]}}
    ```

    **指示渲染：**

    ```json
    {"beginRendering": {"surfaceId": "main", "root": "header"}}
    ```

=== "v0.9（稳定版）"

    **创建表面：**

    ```json
    {"version": "v0.9.1", "createSurface": {"surfaceId": "main", "catalogId": "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json"}}
    ```

    **定义 UI：**

    ```json
    {"version": "v0.9.1", "updateComponents": {"surfaceId": "main", "components": [
      {"id": "header", "component": "Text", "text": "# 预订餐桌", "variant": "h1"},
      {"id": "date-picker", "component": "DateTimeInput", "label": "选择日期", "value": {"path": "/reservation/date"}, "enableDate": true},
      {"id": "submit-text", "component": "Text", "text": "确认预订"},
      {"id": "submit-btn", "component": "Button", "child": "submit-text", "variant": "primary", "action": {"event": {"name": "confirm_booking"}}}
    ]}}
    ```

    **填充数据：**

    ```json
    {"version": "v0.9.1", "updateDataModel": {"surfaceId": "main", "path": "/reservation", "value": {"date": "2025-12-15", "time": "19:00", "guests": 2}}}
    ```

    v0.9 中，`createSurface` 取代了 `beginRendering`，组件使用更扁平的格式，数据模型使用纯 JSON 值而非类型化的邻接列表。

> **它只是 JSON**
> 看到它有多可读和结构化了吗？LLM 可以轻松生成这些内容，并且传输和渲染是安全的——无需执行代码。

## 探索其他演示

仓库包含其他几个演示：

### 组件画廊（无需代理）

查看所有可用的 A2UI 组件：

```bash
yarn start gallery
```

这运行一个仅客户端的演示，展示每个标准组件（Card、Button、TextField、Timeline 等），包含实时示例和代码示例。

### 其他语言和框架

虽然本指南使用 Lit 客户端作为示例，但 A2UI 为 `samples/client` 目录中的其他流行框架提供了示例：

- **Angular**：`samples/client/angular`
- **React**：`samples/client/react`

浏览 [samples/client](../samples/client) 目录以查看所有可用的客户端实现。

## 下一步

现在你已经看到 A2UI 的实际运行，你可以：

- **[学习核心概念](concepts/overview.md)**：理解表面、组件和数据绑定
- **[设置你自己的客户端](guides/client-setup.md)**：将 A2UI 集成到你自己的应用中
- **[构建代理](guides/agent-development.md)**：创建生成 A2UI 响应的代理
- **[使用现有的代理应用](guides/a2ui-with-any-agent-framework.md)**：通过 CopilotKit + AG-UI 为 ADK、LangGraph、CrewAI、Mastra 或自定义服务添加 A2UI
- **[探索协议](reference/messages.md)**：深入了解技术规范

## 故障排除

### 端口已占用

如果端口 5173 已被占用，开发服务器会自动尝试下一个可用端口。检查终端输出以获取实际 URL。

### API 密钥问题

如果你看到关于缺少 API 密钥的错误：

1. 验证密钥是否已导出：`echo $GEMINI_API_KEY`
2. 确保它是来自 [Google AI Studio](https://aistudio.google.com/apikey) 的有效 Gemini API 密钥
3. 尝试重新导出：`export GEMINI_API_KEY="你的密钥"`

### 启动时连接错误

如果你在浏览器打开时看到 `ERR_CONNECTION_REFUSED` 错误，**不用担心**——这是一个已知的竞态条件（[#587](https://github.com/a2ui-project/a2ui/issues/587)）。Web 应用启动速度比 Python 代理后端快。只需等待几秒钟并刷新页面。

### Python / uv 问题

演示代理需要 [uv](https://docs.astral.sh/uv/) 来运行。如果你看到 `uv: command not found`：

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 验证
uv --version
```

如果你遇到其他 Python 错误：

```bash
# 确保 Python 3.10+ 可用
python3 --version

# 尝试手动运行代理
cd samples/agent/adk/restaurant_finder
uv run .
```

### 仍有问题？

- 查看 [GitHub Issues](https://github.com/a2ui-project/a2ui/issues)
- 阅读 [samples/client/lit/README.md](../samples/client/lit)
- 加入社区讨论

## 理解演示代码

想了解它是如何工作的？查看：

- **代理代码**：`samples/agent/adk/restaurant_finder/` — Python A2A 代理
- **客户端代码**：`samples/client/lit/` — 带有 A2UI 渲染器的 Lit Web 客户端
- **A2UI 渲染器**：`renderers/lit/`（Lit）和 `renderers/web_core/`（框架无关核心）

每个目录都有自己的 README，带有详细文档。

---

**恭喜！** 你已成功运行了第一个 A2UI 应用。你已经看到 AI 代理如何生成丰富的交互式 UI，这些 UI 在 Web 应用中原生渲染——全部通过安全的声明式 JSON 消息。
