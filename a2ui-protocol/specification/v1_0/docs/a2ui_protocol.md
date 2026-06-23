# A2UI（代理到 UI）协议 v1.0

基于 JSON 的流式 UI 协议规范。

**版本：** 1.0
**状态：** 候选版
**创建日期：** 2025 年 11 月 20 日
**最后更新：** 2026 年 6 月 8 日

基于 JSON 的流式 UI 协议规范

## 简介

A2UI 协议旨在从代理发送的 JSON 对象流中动态渲染用户界面。其核心理念强调 UI 结构和应用数据的清晰分离，使渲染器在处理每条消息时能够进行渐进式渲染。

通信通过 JSON 对象流进行。渲染器将每个对象解析为独立的消息，并逐步构建或更新 UI。代理到渲染器的协议定义了四种消息类型：

- `createSurface`：指示渲染器创建新表面并开始渲染。
- `updateComponents`：提供要添加到或更新到特定表面的组件定义列表。
- `updateDataModel`：提供要插入到表面数据模型或替换表面数据模型的新数据。
- `deleteSurface`：从 UI 中显式移除表面及其内容。

代理回合的结束由[传输层](https://github.com/a2ui-project/a2ui/tree/main/docs/concepts/transports.md)发出信号。

## 与之前版本的更改

1.0 版与 0.9 版（包括 0.9.1）之间的主要区别：

- **双向 RPC 消息传递**：支持对客户端操作的同步服务器响应（`actionResponse`）和基于运行时目录定义验证的远程服务器发起的函数执行（`callFunction` / `functionResponse`）。
- **单消息 UI 实例化**：允许在 `createSurface` 中直接嵌入初始组件树和数据模型，从而在单个负载中实现完整的 UI 组合。
- **解耦品牌化**：用可扩展的 `surfaceProperties` 替换僵化的主题属性（移除硬编码的品牌颜色），将视觉样式完全推迟到目标框架的原生主题。
- **增强的目录模式**：将函数定义重构为对象映射以直接 O(1) 查找，并支持内联目录上的标准 JSON Schema 元数据字段（`$schema`、`$id`）。
- **严格的标识符和上下文标准**：在所有目录实体中强制执行 Unicode (UAX #31) 命名规则，并保留 `@` 命名空间用于通用系统上下文求值（如 `@index`）。

参见[进化指南](evolution_guide.md)了解 v0.9 和 v1.0 之间差异的详细说明。

## 协议概述和数据流

A2UI 协议使用从服务器到客户端的单向 JSON 消息流来描述和更新 UI。客户端消费此流、构建 UI 并渲染。用户交互被单独处理，通常通过向不同端点发送事件，这些事件可能反过来触发 UI 流上的新消息。

以下是事件序列的示例（不必严格按此顺序）：

1.  **创建表面**：服务器发送 `createSurface` 消息以初始化表面。
2.  **更新表面**：表面创建后，服务器发送一个或多个 `updateComponents` 消息，包含将成为表面一部分的所有组件的定义。
3.  **更新数据模型**：表面创建后，服务器可以随时发送 `updateDataModel` 消息以填充或更改 UI 组件将显示的数据。
4.  **渲染**：客户端渲染表面的 UI，使用组件定义构建结构，使用数据模型填充内容。
5.  **动态更新**：随着用户与应用交互或新信息变得可用，服务器可以发送额外的 `updateComponents` 和 `updateDataModel` 消息以动态更改 UI。
6.  **删除表面**：当不再需要 UI 区域时，服务器发送 `deleteSurface` 消息以移除它。

## 传输解耦

A2UI 协议设计为传输层无关。它定义了 JSON 消息结构以及服务器（代理）和客户端（渲染器）之间的语义契约，但不要求特定的传输层。

### 传输契约

为支持 A2UI，传输层必须满足以下契约：

1.  **可靠传递**：消息必须按生成顺序传递。A2UI 依赖于有状态更新（例如，在更新表面之前创建表面），因此乱序传递可能破坏 UI 状态。
2.  **消息分帧**：传输层必须清晰地分隔单个 JSON 信封消息（例如，在 JSONL 中使用换行、WebSocket 帧或 SSE 事件）。
3.  **元数据支持**：传输层必须提供将元数据与消息关联的机制。这对于以下方面至关重要：
    - **数据模型同步**：`sendDataModel` 功能要求客户端将当前数据模型状态作为元数据与用户操作一起发送。
    - **能力交换**：客户端能力（支持的目录、自定义组件）和服务器能力通过元数据或传输特定握手（如 A2A 中的 Agent Card 或 MCP 中的初始化）进行交换。
4.  **双向能力（可选）**：虽然渲染流是单向的（服务器 → 客户端），但交互式应用需要 `action` 消息（客户端 → 服务器）的返回通道。

### 传输绑定

虽然 A2UI 是无关的，但它最常与以下传输层一起使用。

#### A2A（代理到代理）绑定

[A2A（代理到代理）](https://a2a-protocol.org/latest/) 是代理系统中 A2UI 的出色传输选项，用额外的负载扩展 A2A。

#### AG-UI（代理到用户界面）绑定

[AG-UI](https://docs.ag-ui.com/introduction) 也是 A2UI 代理-用户交互协议的出色传输选项。

#### 其他传输层

A2UI 也可以通过以下方式传输：

- **[MCP（模型上下文协议）](https://modelcontextprotocol.io/docs/getting-started/intro)**：作为工具输出或资源订阅提供。
- **[SSE](https://en.wikipedia.org/wiki/Server-sent_events) 配合 [JSON RPC](https://www.jsonrpc.org/)**：用于支持流式传输的 Web 集成的标准服务器推送事件，以及用于客户端-服务器通信的 JSON RPC。
- **[WebSocket](https://en.wikipedia.org/wiki/WebSocket)**：用于双向实时会话。
- **[REST](https://cloud.google.com/discover/what-is-rest-api?hl=en)**：用于简单用例，REST API 可以工作但缺乏流式传输能力。

## 协议模式

A2UI v1.0 由三个相互作用的 JSON 模式定义。

### 通用类型

[`common_types.json`] 模式定义了在整个协议中使用的可重用原语。

### 服务器到客户端消息结构：信封

[`server_to_client.json`] 模式是顶层入口点。服务器流式传输的每条消息都必须根据此模式进行验证。

### 基本目录

[`catalogs/basic/catalog.json`] 模式包含所有特定 UI 组件（如 `Text`、`Button`、`Row`）、函数（如 `required`、`email`）和 `surfaceProperties` 模式的定义。

## 信封消息结构

信封定义了多种消息类型，服务器流式传输的每条消息必须是包含以下键之一的 JSON 对象：`createSurface`、`updateComponents`、`updateDataModel`、`deleteSurface`、`callFunction` 或 `actionResponse`。该键指示消息类型，这些是协议流中构成每条消息的消息。

### `createSurface`

此消息指示客户端创建新表面并开始渲染。在向表面发送任何 `updateComponents` 或 `updateDataModel` 消息之前，必须先创建表面。

### `updateComponents`

此消息提供要添加到特定表面或在其内部更新的 UI 组件列表。

### `updateDataModel`

此消息用于发送或更新填充 UI 组件的数据。

### `deleteSurface`

此消息指示客户端从 UI 中移除表面及其所有关联的组件和数据。

### `actionResponse`

此消息由服务器发送以响应客户端发起的请求响应的 `action`。

### `callFunction`

此消息由服务器发送以执行注册在客户端上的函数。

## 组件模型

A2UI 的组件模型设计为灵活，将协议的结构与可用的 UI 组件集合分离。

## 数据模型表示：绑定、作用域

本节描述 UI 组件如何**表示**和引用数据模型中的数据。

## 数据模型更新：同步和收敛

本节定义数据模型本身如何被更新和同步。

## 客户端逻辑和验证

A2UI v1.0 将客户端逻辑泛化为**函数**。这些可用于验证、数据转换和动态属性绑定。

## 基本组件目录

[`catalogs/basic/catalog.json`] 提供了组件和函数的基线集合。

有关完整详细信息，请参阅原始英文规范的完整内容：[specification/v1_0/docs/a2ui_protocol.md]
