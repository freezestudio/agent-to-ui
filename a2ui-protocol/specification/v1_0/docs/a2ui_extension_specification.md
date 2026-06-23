# A2UI（代理到代理 UI）扩展规范 v1.0

## 概述

此扩展实现了 A2UI（代理到代理 UI）规范 v1.0，这是一种用于代理向客户端发送流式交互式用户界面的格式。

## 扩展 URI

此扩展的 URI 是 https://a2ui.org/a2a-extension/a2ui/v1.0

这是此扩展接受的唯一 URI。

## 核心概念

A2UI 扩展建立在以下主要概念之上：

**表面：**"表面"是客户端 UI 中一个独特的、可控的区域。规范使用 `surfaceId` 将更新定向到特定表面（例如，主要内容区域、侧面板或新的聊天气泡）。这允许单个代理流独立管理多个 UI 区域。

**目录定义文档：** a2ui 扩展与目录无关。所有 UI 组件（例如 Text、Row、Button）和函数（例如 required、email）都在单独的目录定义模式中定义。这允许客户端和服务器协商使用哪个目录。

**模式：** a2ui 扩展由几个主要的 JSON 模式定义：

- 目录定义模式：定义组件和函数库的标准格式。
- 服务器到客户端消息列表模式：从代理发送到客户端的核心传输线格式（例如 updateComponents、updateDataModel）。
- 客户端到服务器消息列表模式：从客户端发送到代理的核心传输线格式（例如 action）。
- 服务器能力模式：`a2uiServerCapabilities` 对象的模式，服务器用于声明其 UI 生成能力。
- 客户端能力模式：`a2uiClientCapabilities` 对象的模式。

**客户端能力：** 客户端在 `a2uiClientCapabilities` 对象中将其能力发送到服务器。此对象包含在从客户端发送到服务器的每个 A2A `Message` 的 `metadata` 字段中。此对象允许客户端声明它支持哪些目录。

## Agent Card 详情

代理在其 AgentCard 的 `AgentCapabilities.extensions` 列表中声明其 A2UI 能力。`params` 对象定义了代理的特定 UI 支持，并直接对应于**服务器能力模式**（`server_capabilities.json`）。

## 扩展激活

客户端通过在传输定义的 A2A 扩展激活机制中指定它来表示希望使用 A2UI 扩展。

激活此扩展意味着服务器可以发送 A2UI 特定消息（如 updateComponents），并且客户端应发送 A2UI 特定事件（如 action）。

## 数据编码

A2UI 消息被编码为 A2A `DataPart`。

要将 `DataPart` 标识为包含 A2UI 数据，它必须具有以下元数据：

- `mimeType`：`application/a2ui+json`

`DataPart` 的 `data` 字段包含 A2UI JSON 消息的**列表**（例如 `createSurface`、`updateComponents`、`action`）。它必须是消息数组。

### 处理规则

`data` 字段包含消息列表。此列表**不是**事务单元。接收方（客户端和代理）必须顺序处理列表中的消息。

如果列表中的单条消息未能通过验证或应用（例如，由于模式违规或无效引用），接收方应报告/记录该特定消息的错误，并且必须继续处理列表中的其余消息。

原子性仅在**单个消息**级别得到保证。然而，为获得更好的用户体验，渲染器在列表中的所有消息都处理完毕之前不应用于重绘 UI。这可以防止中间状态闪烁到用户。
