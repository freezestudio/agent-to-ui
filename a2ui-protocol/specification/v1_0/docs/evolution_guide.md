# A2UI 协议进化指南：v0.9 到 v1.0

本文档是 A2UI 0.9 版（包括 0.9.1）和 1.0 版之间变化的综合指南。它详述了理念、架构和实现的转变，为利益相关者和在版本间迁移的开发者提供参考。

## 1. 执行摘要

1.0 版与 0.9 版在以下方面有所不同：

- 新的客户端到服务器 RPC 机制允许对客户端操作（`actionResponse`）进行同步响应，使用唯一的 `actionId`。
- 通过 `callFunction` 消息支持服务器到客户端的 RPC 函数调用。客户端通过 `functionResponse` 消息返回执行结果。运行时执行边界和返回类型在目录中定义并在运行时验证，而不是在传输线上验证。
- 目录和表面创建消息中的 `theme` 属性被 `surfaceProperties` 替换，并且移除了 `primaryColor` 以将布局与品牌分离。
- 组件和初始数据模型状态可以直接在 `createSurface` 参数中定义。这允许在单条消息中创建完整的 UI，而不是先创建再单独更新。
- 目录中的 `functions` 字段现在定义为函数名称到其定义的映射，而不是列表。
- 目录支持标准 JSON Schema 元数据字段（`$schema`、`$id`、`title` 和 `description`），防止对具有严格属性检查的内联目录进行验证失败。
- 所有目录实体（组件名称、函数名称和参数键）的标识符命名规则必须符合 Unicode 标准附录 #31 (UAX #31)。
- 内置的 `@index` 函数在列表模板渲染期间动态检索迭代索引。`@` 前缀保留用于核心系统上下文求值。

## 2. 更改

### 2.1 目录定义模式

- 将 Catalog 模式中的 `$defs/theme` 模式重命名为 `$defs/surfaceProperties`，并移除 `primaryColor` 属性。
- 将 Catalog 模式中的 `functions` 属性从列表更改为由函数名称键控的映射对象。
- 向 `FunctionDefinition` 添加 `callableFrom`（枚举：`clientOnly`、`remoteOnly`、`clientOrRemote`）以限制函数可以在哪里调用。
- 向 `Catalog` 模式添加可选的 `instructions` 字段，以在设计指南和组件使用规则直接嵌入目录中，替换外部的 `rules.txt` 文件。
- 支持 Catalog 对象定义中的标准 JSON Schema 元数据字段（`$schema`、`$id`、`title` 和 `description`）。

### 2.2 标准目录（基本）

- 向 `catalogs/basic/catalog.json` 中的 `Video` 组件添加 `posterUrl` 属性。
- 向 `TextField` 组件模式添加 `placeholder` 属性。
- 向 `Slider` 组件模式添加 `steps` 属性。

### 2.3 服务器到客户端消息

- 添加 `actionResponse` 消息结构，允许服务器使用唯一的 `actionId` 响应特定的操作调用。
- 添加 `callFunction` 消息结构以支持服务器发起的函数执行。
- 更新 `createSurface` 消息，将 `theme` 字段重命名为 `surfaceProperties`，并允许在负载内直接传递初始 `components` 和 `dataModel`。

### 2.4 客户端到服务器事件

- 向 `action` 消息属性添加 `actionId`。
- 添加 `functionResponse` 消息结构。

### 2.5 客户端能力模式

- 添加可选的 `instructions` 字段。
- 将 `theme` 能力块重命名为 `surfaceProperties`。

### 2.6 Agent Card 和传输元数据

- 标准化官方 MIME 类型为 `application/a2ui+json`。
- 将传输元数据和 A2A 元数据参数中的能力命名空间从 `v0.9`/`v0.9.1` 更新为 `v1.0`。

### 2.7 数据编码

- 标准化 `updateDataModel` 中的数据删除行为。将路径的值设置为 `null` 会删除该路径的键。

### 2.8 处理规则

- 明确指定 `surfaceId` 在每个客户端会话中必须是全局唯一的。
- 强制执行函数执行边界和返回类型的运行时查找。
- 强制执行目录实体命名符合 Unicode 标准附录 #31 (UAX #31)。
- 将 `@index` 求值范围严格限制在模板实例化循环（集合作用域）中。

## 3. 迁移指南

本节概述了将现有应用和组件从 0.9 版（包括 0.9.1）迁移到 1.0 版所需的步骤。

### 对于代理和服务器

- 将所有流式 JSON 信封中的 `version` 字段设置为 `"v1.0"`。
- 将传输层中的 A2UI 负载 MIME 类型从 `application/json+a2ui` 更改为 `application/a2ui+json`。
- 将 `createSurface` 消息中的 `theme` 字段重命名为 `surfaceProperties` 并移除 `primaryColor`。
- 将目录定义中的 `functions` 属性从数组转换为由函数名称键控的 JSON 对象映射。
- 将目录定义中的 `$defs/theme` 重命名为 `$defs/surfaceProperties` 并移除 `primaryColor` 字段。
- 确保所有生成的目录实体名称符合 UAX #31 标识符规则。

### 对于渲染器和客户端

- 实现函数执行，添加解析 `callFunction` 消息、检查目录中的边界定义、拒绝无效调用并返回 `functionResponse` 消息的支持。
- 支持同步操作响应，为带有 `wantResponse: true` 的操作生成 `actionId`。
- 强制执行表面唯一性，如果收到针对现有 `surfaceId` 的 `createSurface`，则引发错误。
- 支持内置的 `@index` 求值。
