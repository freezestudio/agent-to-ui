# A2UI 渲染器实现指南

本文档概述了实现 A2UI 协议的新渲染器所需的功能。适用于构建新渲染器的开发者（例如，用于 React、Flutter、iOS 等）。

> **注意：版本感知指南**
> 本指南提供 v0.8、v0.9.1（当前生产版）和 v1.0（候选版）的实现清单。使用下面的标签页选择你目标的版本。

## Web 渲染器：使用 `@a2ui/web_core`（`web_core`）

如果你正在为 Web 构建渲染器（React、Vue、Svelte 等），你不需要从头实现消息处理、状态管理或模式验证。[**`@a2ui/web_core`**](https://github.com/a2ui-project/a2ui/tree/main/renderers/web_core) 包提供了所有框架无关的逻辑，这是受维护的 Lit、Angular 和 React 渲染器共享的。

### `web_core` 提供的内容

| 模块                                   | 功能                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ |
| **`MessageProcessor`**                   | 处理 A2UI JSONL 流、分发消息、管理表面生命周期                     |
| **`SurfaceModel` / `SurfaceGroupModel`** | 表面、组件和数据模型的状态管理                                      |
| **`DataModel` / `DataContext`**          | 数据绑定解析、基于路径的查找、模板列表渲染                          |
| **`ComponentModel`**                     | 组件树状态、邻接表到树的解析                                        |
| **类型和模式**                           | 所有 A2UI 组件、原语、颜色、样式和 JSON Schema 验证的 TypeScript 类型 |
| **表达式解析器**                         | 客户端函数求值（v0.9+）                                             |

### 版本支持

`web_core` 按版本导出 API 集：

- `@a2ui/web_core/v0_8` — 稳定的 v0.8
- `@a2ui/web_core/v0_9` — v0.9/v0.9.1 支持，包含 `createSurface`、自定义目录、客户端函数
- `@a2ui/web_core/v1_0` — 候选 v1.0 支持，包括 RPC 操作响应

---

## I. 核心协议实现清单

=== "v0.8"

    - **JSONL 流解析**：逐行读取流式响应，将每行解码为独立的 JSON 对象。
    - **消息分发器**：识别消息类型（`beginRendering`、`surfaceUpdate`、`dataModelUpdate`、`deleteSurface`）并路由到正确的处理器。
    - **表面管理**：按 `surfaceId` 键管理表面。
    - **组件缓冲**：为每个表面维护组件缓冲区。
    - **数据模型存储**：为每个表面维护数据模型状态。
    - **渐进式渲染**：缓冲更新直到收到 `beginRendering`。
    - **数据绑定解析**：使用 `literalString` / `literalNumber` / `path` 解析 `BoundValue` 对象。
    - **动态列表**：对于 `children.template`，遍历数据列表并渲染组件。
    - **客户端到服务器**：发送包含已解析路径上下文的 `userAction`。

=== "v0.9.1（当前版）"

    - **JSONL 流解析**：同上。
    - **消息分发器**：识别 `createSurface`、`updateComponents`、`updateDataModel`、`deleteSurface`。
    - **MIME 类型验证**：基于标准化的 `application/a2ui+json` MIME 类型拦截负载。
    - **表面管理**：`createSurface` 绑定 `catalogId`、注册 `theme` 和 `sendDataModel`。
    - **组件缓冲**：使用 `"component": "Type"` 鉴别器处理扁平格式的组件。
    - **数据模型存储**：使用 upsert 语义的标准 JSON 对象处理 `updateDataModel`。
    - **渐进式渲染**：在 `updateComponents` 中解析到有效根组件（ID `root`）后立即渲染。
    - **客户端函数**：对注册的目录定义函数进行求值。
    - **客户端到服务器**：发送包含已解析路径上下文的 `action`。

=== "v1.0（候选版）"

    包括 v0.9.1 的所有要求，以及以下扩展：
    - **表面属性**：处理带有 `surfaceProperties`（从 `theme` 重命名）的 `createSurface`。
    - **操作响应（RPC）**：处理服务器的 `actionResponse` 消息。
    - **客户端到服务器**：生成并包含 `actionId`。

## II. 基本组件目录清单

基本组件包括 Text、Image、Icon、Video、AudioPlayer、Divider、Row/Column、List、Card、Tabs、Modal、Button、CheckBox、TextField、ChoicePicker、Slider、DateTimeInput。详见[组件参考](../reference/components.md)。
