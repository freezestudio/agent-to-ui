# 核心概念

本节解释 A2UI 的基本架构。理解这些概念将帮助你构建有效的代理驱动界面。

参见[词汇表](glossary.md)获取关键术语的简要定义。

## 宏观架构

A2UI 围绕三个核心理念构建：

1. **流式消息**：UI 更新以 JSON 消息序列的形式从代理流向客户端
2. **声明式组件**：UI 被描述为数据，而非编程为代码
3. **数据绑定**：UI 结构与应用状态分离，支持响应式更新

## 关键主题

### [数据流](data-flow.md)

消息如何从代理流向渲染后的 UI。包括餐厅预订流程的完整生命周期示例、传输选项（SSE、WebSocket、A2A）、渐进式渲染和错误处理。

### [组件结构](components.md)

A2UI 用于表示组件层次的**邻接表模型**。了解为什么扁平列表优于嵌套树、如何使用静态与动态子元素以及增量更新的最佳实践。

### [数据绑定](data-binding.md)

组件如何使用 JSON Pointer 路径连接到应用状态。涵盖响应式组件、动态列表、输入绑定以及使 A2UI 强大的结构与状态分离。

## 消息类型

=== "v0.9（稳定版）"

    0.9 版本使用以下消息类型：

    - **`createSurface`**：创建新表面并指定其目录
    - **`updateComponents`**：添加或更新表面中的 UI 组件
    - **`updateDataModel`**：更新应用状态
    - **`deleteSurface`**：移除 UI 表面

    v0.9 将表面创建与渲染分离——`createSurface` 取代了 `beginRendering` 和 `surfaceUpdate` 中的隐式表面创建。所有消息都包含 `version` 字段。

=== "v1.0（候选）"

    1.0 版本使用以下消息类型：

    - **`createSurface`**：创建新表面并指定其目录
    - **`updateComponents`**：添加或更新表面中的 UI 组件
    - **`updateDataModel`**：更新应用状态
    - **`deleteSurface`**：移除 UI 表面
    - **`actionResponse`**：响应客户端发起的操作

    v1.0 引入了 `actionResponse` 消息类型，支持健壮的客户端到服务器同步 RPC 能力。

=== "v0.8（旧版）"

    0.8 版本使用以下消息类型：

    - **`surfaceUpdate`**：定义或更新 UI 组件
    - **`dataModelUpdate`**：更新应用状态
    - **`beginRendering`**：指示客户端开始渲染
    - **`deleteSurface`**：移除 UI 表面

有关完整的技术细节，请参见[消息参考](../reference/messages.md)。
