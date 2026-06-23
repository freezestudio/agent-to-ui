# 消息类型

此参考提供了所有 A2UI 消息类型的详细文档。

## 消息格式

所有 A2UI 消息都是 JSON 对象，以 JSON Lines (JSONL) 格式发送。每行包含一条消息。

=== "v0.8 消息类型"

    - `beginRendering` — 指示客户端渲染表面
    - `surfaceUpdate` — 添加或更新组件
    - `dataModelUpdate` — 更新应用状态
    - `deleteSurface` — 移除表面

=== "v0.9 消息类型"

    - `createSurface` — 创建表面并指定其目录
    - `updateComponents` — 添加或更新组件
    - `updateDataModel` — 更新应用状态
    - `deleteSurface` — 移除表面

    所有 v0.9 消息都包含 `"version": "v0.9"` 字段。

---

## beginRendering（v0.8）/ createSurface（v0.9）

指示客户端初始化和渲染表面。

=== "v0.8 — `beginRendering`"

    ```json
    {
      "beginRendering": {
        "surfaceId": "main",
        "root": "root-component"
      }
    }
    ```

=== "v0.9 — `createSurface`"

    ```json
    {
      "version": "v0.9",
      "createSurface": {
        "surfaceId": "main",
        "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
      }
    }
    ```

---

## surfaceUpdate（v0.8）/ updateComponents（v0.9）

添加或更新表面内的组件。

---

## dataModelUpdate（v0.8）/ updateDataModel（v0.9）

更新组件绑定的数据模型。

---

## deleteSurface

移除表面及其所有组件和数据。

---

## 消息排序

### 要求

消息排序必须满足以下要求：

1. `beginRendering` 必须在该表面的初始 `surfaceUpdate` 消息之后。
2. `surfaceUpdate` 可以在 `dataModelUpdate` 之前或之后。
3. 不同表面的消息是独立的。
4. 多条消息可以增量更新同一表面。

### 推荐顺序

=== "v0.8"

    ```jsonl
    { "surfaceUpdate":    { "surfaceId": "main", "components": [...] } }
    { "dataModelUpdate":  { "surfaceId": "main", "contents": {...} } }
    { "beginRendering":   { "surfaceId": "main", "root": "root-id" } }
    ```

=== "v0.9"

    ```jsonl
    { "version": "v0.9", "createSurface":    { "surfaceId": "main", "catalogId": "..." } }
    { "version": "v0.9", "updateComponents": { "surfaceId": "main", "components": [...] } }
    { "version": "v0.9", "updateDataModel":  { "surfaceId": "main", "path": "/", "value": {...} } }
    ```

### 渐进式构建

=== "v0.8"

    ```jsonl
    { "surfaceUpdate":   { "surfaceId": "main", "components": [...] } }  // 头部
    { "surfaceUpdate":   { "surfaceId": "main", "components": [...] } }  // 主体
    { "beginRendering":  { "surfaceId": "main", "root": "root-id" } }   // 渲染
    { "surfaceUpdate":   { "surfaceId": "main", "components": [...] } }  // 底部
    { "dataModelUpdate": { "surfaceId": "main", "contents": {...} } }    // 数据
    ```

=== "v0.9"

    ```jsonl
    { "version": "v0.9", "createSurface":    { "surfaceId": "main", "catalogId": "..." } }
    { "version": "v0.9", "updateComponents": { "surfaceId": "main", "components": [...] } }  // 头部
    { "version": "v0.9", "updateComponents": { "surfaceId": "main", "components": [...] } }  // 主体 + 底部
    { "version": "v0.9", "updateDataModel":  { "surfaceId": "main", "path": "/", "value": {...} } }
    ```

## 验证

=== "v0.8"

    根据以下内容验证：
    - **[server_to_client.json](../../specification/v0_8/json/server_to_client.json)**：消息信封模式。
    - **[standard_catalog_definition.json](../../specification/v0_8/json/standard_catalog_definition.json)**：组件模式。

=== "v0.9"

    根据以下内容验证：
    - **[server_to_client.json](../../specification/v0_9/json/server_to_client.json)**：消息信封模式。
    - **[catalogs/basic/catalog.json](../../specification/v0_9/catalogs/basic/catalog.json)**：组件模式。

## 进一步阅读

- **[组件画廊](components.md)**：所有可用的组件类型
- **[数据绑定指南](../concepts/data-binding.md)**：数据绑定的工作原理
- **[代理开发指南](../guides/agent-development.md)**：生成有效消息
