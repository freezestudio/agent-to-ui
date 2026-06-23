# A2A 协议 v1.0 新特性

本文档全面概述了从 A2A 协议 v0.3.0 到 v1.0 的变更。v1.0 版本代表了协议的重要成熟，具有增强的清晰度、更强的规范和重要的结构改进。

## 主要主题概述

v1.0 版本聚焦于四个主要主题：

### 1. **协议成熟度和标准化**

- 将 a2a.proto 从 gRPC 特定的实现文件提升为通用的、规范性的唯一真实来源
- 尽可能利用正式规范标准（RFC 8785、RFC 7515）和 google.rpc.Status
- 更严格遵守 REST、gRPC 和 JSON-RPC 绑定的行业标准模式
- 增强的版本控制策略，具有明确的向后兼容规则
- 全面的错误分类，具有协议特定的映射

### 2. **增强的类型安全性和清晰度**

- 移除鉴别器 `kind` 字段，改用基于 JSON 成员的多态
- **重大变更：** 枚举值从 `kebab-case` 改为 `SCREAMING_SNAKE_CASE` 以符合 ProtoJSON 规范
- 更严格的字段命名约定（JSON 使用 `camelCase`）
- 更精确的时间戳规范（ISO 8601，毫秒精度）
- 更好的数据类型定义，更清晰的可选与必需语义

### 3. **改善的开发者体验**

- 重命名操作以保持一致性
- 重新组织智能体卡片结构以实现更好的逻辑分组
- 增强的扩展机制，带有版本化和需求声明
- 更显式的服务参数处理（A2A-Version、A2A-Extensions 头）
- **简化的 ID 格式** - 移除复杂的复合 ID（例如，`tasks/{id}`），改用简单的 UUID
- **每个接口的协议版本** - 每个 AgentInterface 指定自己的协议版本，以实现更好的向后兼容性
- **多租户支持** - gRPC 请求中的原生租户范围

### 4. **企业级特性**

- 使用 JWS 和 JSON 规范化的智能体卡片签名验证
- 所有三种协议绑定的正式规范，具有等效保证
- 增强的安全方案声明，支持双向 TLS
- **现代 OAuth 2.0 流程** - 添加设备码流程（RFC 8628），移除已弃用的隐式/密码流程
- **PKCE 支持** - 为授权码流程添加 `pkce_required` 字段以增强安全性
- 基于游标的分页，实现可扩展的任务列表

---

## 核心操作的行为变更

### 发送消息（`message/send` → **`SendMessage`**）

**v0.3.0 行为：**

- 操作名为 `message/send`
- 对何时返回 `Task` 与 `Message` 的规范较不正式

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **`SendMessage`**
- **✅ 澄清：** 更精确地指定 Task 与 Message 返回语义

### 发送流式消息（`message/stream` → **SendStreamingMessage**）

**v0.3.0 行为：**

- 操作名为 `message/stream`
- 流事件有 `kind` 鉴别器字段

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **`SendStreamingMessage`**
- **✅ 重大变更：** 流事件不再有 `kind` 字段
    - 使用 JSON 成员名称区分 `TaskStatusUpdateEvent` 和 `TaskArtifactUpdateEvent`
- **✅ 移除：** 从 TaskStatusUpdateEvent 移除 `final` 布尔字段。改用协议绑定特定的流关闭机制。
- **✅ 澄清：** 允许多个并发流；所有流接收相同的有序事件

### 获取任务（`tasks/get` → **GetTask**）

**v0.3.0 行为：**

- 操作名为 `tasks/get`
- 返回带有状态、制品和可选历史的任务
- 对"包含历史"的含义规范较不正式

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **GetTask**
- **✅ 新增：** 向 Task 对象添加 `createdAt` 和 `lastModified` 时间戳字段
- **✅ 澄清：** 更精确地指定历史包含行为
- **✅ 新增：** Task 对象现在在消息和制品中包含 `extensions[]` 数组
- **✅ 澄清：** 身份验证/授权范围 - 服务器必须只返回调用方可见的任务

### 列出任务（`tasks/list` → **ListTasks**）

**v0.3.0 行为：**

- 操作不可用。

**v1.0 变更：**

- **✅ 新增：** 新操作 **ListTasks**，具有过滤能力
- **✅ 澄清：** 任务可见性限于经过身份验证的调用方

### 取消任务（`tasks/cancel` → **CancelTask**）

**v0.3.0 行为：**

- 操作名为 `tasks/cancel`
- 请求包含 taskId，返回 Task

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **CancelTask**
- **✅ 澄清：** 更精确地指定何时允许取消
- **✅ 澄清：** 取消场景的任务状态转换

### 获取智能体卡片（Well-known URI 和 **GetExtendedAgentCard**）

**v0.3.0 行为：**

- 通过 `/.well-known/agent-card.json` 发现
- 通过 `agent/getAuthenticatedExtendedCard` 获取扩展卡片
- 顶级 `supportsAuthenticatedExtendedCard` 布尔值

**v1.0 变更：**

- **✅ 重命名：** `agent/getAuthenticatedExtendedCard` → **GetExtendedAgentCard**
- **✅ 重大变更：** `supportsAuthenticatedExtendedCard` 移至 `capabilities.extendedAgentCard`
- **✅ 新增：** 澄清智能体卡片签名的规范化（RFC 8785）
- **✅ 重大变更：** `protocolVersion` 从 AgentCard 移至各个 AgentInterface 对象
- **✅ 重大变更：** `preferredTransport` 和 `additionalInterfaces` 合并为 `supportedInterfaces[]`
    - 每个接口有 `url`、`protocolBinding` 和 `protocolVersion`

### 订阅任务（`tasks/resubscribe` → **SubscribeToTask**）

**v0.3.0 行为：**

- 使用 `tasks/resubscribe` 重新连接中断的 SSE 流
- 回填行为依赖于实现

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **SubscribeToTask**
- **✅ 澄清：** 流式订阅生命周期的正式规范
- **✅ 澄清：** 任务达到终止状态时的流关闭行为
- **✅ 澄清：** 每个任务支持多个并发订阅

### 推送通知操作

**v0.3.0 操作：**

- `tasks/pushNotificationConfig/set`
- `tasks/pushNotificationConfig/get`
- `tasks/pushNotificationConfig/list`
- `tasks/pushNotificationConfig/delete`

**v1.0 变更：**

- **✅ 重命名：** 操作现在为 **CreateTaskPushNotificationConfig**、**GetTaskPushNotificationConfig**、**ListTaskPushNotificationConfigs**、**DeleteTaskPushNotificationConfig**
- **✅ 新增：** 向 PushNotificationConfig 添加 `createdAt` 时间戳字段
- **✅ 澄清：** 推送通知负载现在使用 StreamResponse 格式
- **✅ 重大变更：** 所有方法的模型更改，TaskPushNotificationConfig 被扁平化

### 新增：多租户支持

**v0.3.0：**

- 协议中无原生多租户支持
- 租户通过身份验证或 URL 路径隐式处理

**v1.0 变更：**

- **✅ 新增：** 向所有请求消息添加 `tenant` 字段
- **✅ 新增：** 向 `AgentInterface` 添加 `tenant` 字段以指定默认租户
- **✅ 澄清：** 每个请求提供租户，从 AgentInterface 继承
- **✅ 用例：** 支持从单个端点服务多个智能体

### 协议简化

#### ID 格式简化

**v0.3.0：**

- 某些操作使用复杂的复合 ID，如 `tasks/{taskId}`
- 要求客户端/服务器构造/解构资源名称

**v1.0 变更：**

- **✅ 重大变更：** 所有 ID 现在都是简单的字面量
- **✅ 重大变更：** 以前使用复合 ID 的操作现在分离父 ID 和资源 ID
    - 示例：`tasks/{taskId}/pushNotificationConfigs/{configId}` → 分离的 `task_id` 和 `config_id` 字段
- **✅ 好处：** 实现更简单 - ID 直接映射到数据库键

#### HTTP URL 路径简化

**v0.3.0：**

- HTTP+JSON 绑定在 URL 中使用 `/v1/` 前缀
- 示例：`POST /v1/message:send`

**v1.0 变更：**

- **✅ 重大变更：** 从 HTTP+JSON URL 路径移除 `/v1` 前缀
- **✅ 新增：** 示例：`POST /message:send`、`GET /tasks/{id}`
- **✅ 理由：** 如果智能体所有者需要，版本可以成为基础 URL 的一部分
- **✅ 好处：** 更清晰的 URL，版本管理在接口级别

---

## 核心模型对象的结构变更

### TaskStatus 对象

**修改的字段：**

- ✅ `state`：**重大变更** - 枚举值从小写改为 `SCREAMING_SNAKE_CASE`，带 `TASK_STATE_` 前缀
    - v0.3.0：`"submitted"`、`"working"`、`"completed"`、`"failed"`、`"canceled"`、`"rejected"`、`"input-required"`、`"auth-required"`
    - v1.0：`"TASK_STATE_SUBMITTED"`、`"TASK_STATE_WORKING"`、`"TASK_STATE_COMPLETED"`、`"TASK_STATE_FAILED"`、`"TASK_STATE_CANCELED"`、`"TASK_STATE_REJECTED"`、`"TASK_STATE_INPUT_REQUIRED"`、`"TASK_STATE_AUTH_REQUIRED"`
- ✅ `timestamp`：现在明确为 ISO 8601 UTC，毫秒精度（`YYYY-MM-DDTHH:mm:ss.sssZ`）

**移除的字段：**

- 无

**迁移示例：**

```json
// v0.3.0
{
  "status": {
    "state": "completed",
    "timestamp": "2024-03-15T10:15:00Z"
  }
}

// v1.0
{
  "status": {
    "state": "TASK_STATE_COMPLETED",
    "timestamp": "2024-03-15T10:15:00.000Z"
  }
}
```

### Message 对象

**添加的字段：**

- ✅ `extensions[]`：适用于此消息的扩展 URI 数组

**修改的字段：**

- ✅ `role`：**重大变更** - 枚举值从小写改为 `SCREAMING_SNAKE_CASE`，带 `ROLE_` 前缀
    - v0.3.0：`"user"`、`"agent"`
    - v1.0：`"ROLE_USER"`、`"ROLE_AGENT"`

**迁移示例：**

```json
// v0.3.0
{
  "role": "user",
  "parts": [{"kind": "text", "text": "你好"}]
}

// v1.0
{
  "role": "ROLE_USER",
  "parts": [{"text": "你好"}],
}
```

**行为变更：**

- Parts 数组现在使用基于成员的鉴别而不是 `kind` 字段

### Part 对象

**重大变更 - 完全重新设计：**

Part 结构在 v1.0 中已完全重新设计。不再使用单独的 TextPart、FilePart 和 DataPart 消息类型，而是使用一个统一的 `Part` 消息。

**v0.3.0 结构（单独类型）：**

```json
// 文本示例
{
  "kind": "text",
  "text": "Hello world"
}

// 文件示例
{
  "kind": "file",
  "file": {
    "fileWithUri": "https://example.com/doc.pdf",
    "mimeType": "application/pdf"
  }
}

// 数据示例
{
  "kind": "data",
  "data": {"key": "value"}
}
```

**v1.0 结构（统一 Part）：**

```json
// 文本示例
{
  "text": "Hello world",
  "mediaType": "text/plain"
}

// 带 URL 的文件示例
{
  "url": "https://example.com/doc.pdf",
  "filename": "doc.pdf",
  "mediaType": "application/pdf"
}

// 带原始字节的文件示例
{
  "raw": "base64encodedcontent==",
  "filename": "image.png",
  "mediaType": "image/png"
}

// 数据示例
{
  "data": {"key": "value"},
  "mediaType": "application/json"
}
```

**变更：**

- ⛔ **移除：** 单独的 `TextPart`、`FilePart` 和 `DataPart` 类型
- ⛔ **移除：** `kind` 鉴别器字段
- ⛔ **移除：** 嵌套的 `file` 对象结构
- ✅ **新增：** 统一的 `Part` 消息，使用 `oneof content` 字段
- ✅ **新增：** 内容类型由存在的字段决定：`text`、`raw`、`url` 或 `data`
- ✅ **新增：** `mediaType` 字段（替换 `mimeType`）- 适用于所有部件类型
- ✅ **新增：** `filename` 字段 - 适用于所有部件类型（不仅仅是文件）
- ✅ **新增：** 内联二进制内容的 `raw` 字段（JSON 中为 base64）
- ✅ **新增：** 文件引用的 `url` 字段（替换 `file.fileWithUri`）

**迁移示例：**

```typescript
// v0.3.0
const textPart = { kind: "text", text: "你好" };
const filePart = { kind: "file", file: { fileWithUri: "https://...", mimeType: "image/png" } };
const dataPart = { kind: "data", data: { key: "value" } };

// v1.0
const textPart = { text: "你好", mediaType: "text/plain" };
const filePart = { url: "https://...", mediaType: "image/png", filename: "image.png" };
const dataPart = { data: { key: "value" }, mediaType: "application/json" };

// 鉴别从 kind 字段改为成员存在检查
if (part.kind === "text") { ... }  // v0.3.0
if ("text" in part) { ... }        // v1.0
```

### Artifact 对象

**添加的字段：**

- ✅ `extensions[]`：扩展 URI 数组

**修改的字段：**

- ✅ `parts[]`：现在使用基于成员的 Part 鉴别（参见上述 Part 变更）

### AgentCard 对象

**添加的字段：**

- ✅ `supportedInterfaces[]`：`AgentInterface` 对象数组

**移除的字段：**

- ⛔ `protocolVersion`：从 AgentCard 移除（现在在每个 AgentInterface 中）
- ⛔ `preferredTransport`：合并到 `supportedInterfaces`
- ⛔ `additionalInterfaces`：合并到 `supportedInterfaces`
- ⛔ `supportsAuthenticatedExtendedCard`：移至 `capabilities.extendedAgentCard`
- ⛔ `url`：主要端点现在在 `supportedInterfaces[0].url`

**结构示例：**

**v0.3.0：**

```json
{
  "protocolVersion": "0.3",
  "url": "https://agent.example.com/a2a",
  "preferredTransport": "JSONRPC",
  "supportsAuthenticatedExtendedCard": true,
  "additionalInterfaces": [...]
}
```

**v1.0：**

```json
{
  "supportedInterfaces": [
    {
      "url": "https://agent.example.com/a2a",
      "protocolBinding": "JSONRPC",
      "protocolVersion": "1.0"
    }
  ],
  "capabilities": {
    "extendedAgentCard": true
  },
  "signatures": [...]
}
```

### AgentCapabilities 对象

**修改的字段：**

- ✅ `extendedAgentCard`：从顶层 `supportsAuthenticatedExtendedCard` 字段移入

### PushNotificationConfig 对象

**添加的字段：**

- ✅ `configId`：配置的唯一标识符
- ✅ `createdAt`：时间戳 - 配置创建时间

**修改的字段：**

- ✅ `authentication`：增强的 PushNotificationAuthenticationInfo 结构

### 流事件对象

**TaskStatusUpdateEvent：**

**v0.3.0：**

```json
{
  "kind": "taskStatusUpdate",
  "taskId": "...",
  "contextId": "...",
  "status": {...},
  "final": true
}
```

**v1.0：**

```json
{
  "taskStatusUpdate": {
    "taskId": "...",
    "contextId": "...",
    "status": {...}
  }
}
```

**变更：**

- ⛔ **移除：** `kind` 鉴别器
- ⛔ **移除：** `final` 布尔字段（流关闭表示完成）
- ✅ **新模式：** 事件类型由 JSON 成员名称决定（`taskStatusUpdate` 或 `taskArtifactUpdate`）
- ✅ **澄清：** 终止状态由协议特定的流关闭机制指示

**TaskArtifactUpdateEvent：**

**v0.3.0：**

```json
{
  "kind": "taskArtifactUpdate",
  "taskId": "...",
  "contextId": "...",
  "artifact": {...}
}
```

**v1.0：**

```json
{
  "taskArtifactUpdate": {
    "taskId": "...",
    "contextId": "...",
    "artifact": {...},
    "index": 0
  }
}
```

**变更：**

- ⛔ **移除：** `kind` 鉴别器
- ✅ **新模式：** 包装在 `taskArtifactUpdate` 对象中
- ✅ **新增：** `index` 字段指示制品在任务制品数组中的位置

### OAuth 2.0 安全更新

v1.0 根据 OAuth 2.0 安全最佳当前实践（BCP）现代化了 OAuth 2.0 支持。

**移除的流程（已被 OAuth BCP 弃用）：**

- ⛔ `ImplicitOAuthFlow` - 由于浏览器历史/日志中令牌泄露风险而被弃用
- ⛔ `PasswordOAuthFlow` - 由于凭证暴露风险而被弃用

**添加的流程：**

- ✅ `DeviceCodeOAuthFlow`（RFC 8628）- 用于 CLI 工具、IoT 设备和输入受限场景
    - 提供 `device_authorization_url` 端点
    - 支持 `verification_uri`、`user_code` 模式
    - 适用于无头环境

**增强的安全：**

- ✅ `pkce_required` 字段添加到 `AuthorizationCodeOAuthFlow`（RFC 7636）
    - 指示 PKCE（Proof Key for Code Exchange）是否为强制要求
    - 防止授权码拦截攻击
    - 推荐用于所有 OAuth 客户端，公共客户端必须使用

**迁移指南：**

```typescript
// v0.3.0 - 隐式流（现已移除）
{
  "implicitFlow": {
    "authorizationUrl": "https://auth.example.com/authorize",
    "scopes": {"read": "读取访问"}
  }
}

// v1.0 - 改用授权码 + PKCE
{
  "authorizationCodeFlow": {
    "authorizationUrl": "https://auth.example.com/authorize",
    "tokenUrl": "https://auth.example.com/token",
    "pkceRequired": true,
    "scopes": {"read": "读取访问"}
  }
}
```

---

## 对其他规范的新依赖

v1.0 引入了对行业标准规范的几个新正式依赖：

### 添加的规范

#### ✅ google.rpc.Status / google.rpc.ErrorInfo

- **目的：** 标准化的错误响应模型，使用 ProtoJSON 表示
- **用法：** HTTP+JSON 和 JSON-RPC 绑定的错误响应
- **影响：** 替换 HTTP 错误的 RFC 9457。对 A2A 特定错误强制使用带有 `reason` 和 `domain` 的结构化 `ErrorInfo`。

#### ✅ RFC 8785 - JSON 规范化方案（JCS）

- **目的：** 用于签名的确定性 JSON 序列化
- **用法：** 智能体卡片签名验证
- **影响：** 实现智能体卡片完整性的加密验证
- **详情：** JWS 签名前使用的规范形式（排除 `signatures` 字段）

#### ✅ RFC 7515 - JSON Web 签名（JWS）

- **目的：** 加密签名标准
- **用法：** 智能体卡片签名字段
- **影响：** 信任验证的行业标准签名格式
- **详情：** 支持通过 `jku` 或受信任密钥库进行公钥检索的分离签名

#### ✅ Google API 设计指南

- **目的：** gRPC 最佳实践和约定
- **用法：** gRPC 绑定设计模式
- **影响：** 更好地与 gRPC 生态系统期望对齐

#### ✅ ISO 8601

- **目的：** 时间戳格式标准
- **用法：** 所有时间戳字段（createdAt、lastModified、timestamp）
- **影响：** 明确的格式要求：UTC，毫秒精度（`YYYY-MM-DDTHH:mm:ss.sssZ`）

### 现有依赖（从 v0.3.0 保留）

- JSON-RPC 2.0
- gRPC / Protocol Buffers 3
- HTTP/HTTPS（各种 RFC）
- 服务器发送事件（SSE）- W3C 规范
- RFC 8615 - Well-known URIs
- OAuth 2.0、OpenID Connect（用于身份验证）
- TLS（推荐 RFC 8446）

### 互补协议

**模型上下文协议（MCP）：**

- 关系澄清：MCP 处理工具/资源集成，A2A 处理智能体间协调
- 协议是互补的，而非竞争
- 智能体可以为不同用例同时支持两种协议

---

## 对开发者的影响

### 需要代码更新的重大变更

#### 1. Part 类型统一（关键影响）

最重要的重大变更：TextPart、FilePart 和 DataPart 类型已被移除，替换为统一的 Part 结构。

**之前（v0.3.0）：**

```typescript
// 使用 kind 鉴别器的单独类型
if (part.kind === "text") {
  return part.text;
} else if (part.kind === "file") {
  if (part.file.fileWithUri) {
    return fetchFile(part.file.fileWithUri);
  } else {
    return part.file.fileWithBytes;
  }
} else if (part.kind === "data") {
  return part.data;
}
```

**之后（v1.0）：**

```typescript
// 使用 oneof content 的统一 Part
if ("text" in part) {
  return part.text;
} else if ("url" in part) {
  return fetchFile(part.url);
} else if ("raw" in part) {
  return decodeBase64(part.raw);
} else if ("data" in part) {
  return part.data;
}
```

#### 2. 流事件鉴别器模式（高影响）

流事件从基于 kind 的鉴别变为基于包装器的鉴别：

**之前（v0.3.0）：**

```typescript
if (event.kind === "taskStatusUpdate") {
  handleStatusUpdate(event);
} else if (event.kind === "taskArtifactUpdate") {
  handleArtifactUpdate(event);
}
```

**之后（v1.0）：**

```typescript
if ("taskStatusUpdate" in event) {
  handleStatusUpdate(event.taskStatusUpdate);
} else if ("taskArtifactUpdate" in event) {
  handleArtifactUpdate(event.taskArtifactUpdate);
}
```

#### 3. 智能体卡片结构（高影响）

智能体发现和能力检查需要更新：

**之前（v0.3.0）：**

```typescript
const endpoint = agentCard.url;
const transport = agentCard.preferredTransport;
const supportsExtended = agentCard.supportsAuthenticatedExtendedCard;
```

**之后（v1.0）：**

```typescript
const primaryInterface = agentCard.supportedInterfaces[0];
const endpoint = primaryInterface.url;
const transport = primaryInterface.protocolBinding;
const supportsExtended = agentCard.capabilities.extendedAgentCard;
```

#### 4. 分页（中影响）

列出任务实现必须从基于页面的分页切换到基于游标的分页：

**之前（v0.3.0）：**

```typescript
const response = await listTasks({ page: 1, perPage: 50 });
```

**之后（v1.0）：**

```typescript
let cursor = undefined;
do {
  const response = await listTasks({ cursor, limit: 50 });
  // 处理 response.tasks
  cursor = response.nextCursor;
} while (cursor);
```

#### 5. 枚举值变更（高影响）

所有枚举值现在使用 SCREAMING_SNAKE_CASE 和类型前缀：

**TaskState：**

```typescript
// v0.3.0
if (task.status.state === "completed") { ... }
if (task.status.state === "input-required") { ... }

// v1.0
if (task.status.state === "TASK_STATE_COMPLETED") { ... }
if (task.status.state === "TASK_STATE_INPUT_REQUIRED") { ... }
```

**MessageRole：**

```typescript
// v0.3.0
const message = { role: "user", parts: [...] };

// v1.0
const message = { role: "ROLE_USER", parts: [...] };
```

**完整映射：**

- `"submitted"` → `"TASK_STATE_SUBMITTED"`
- `"working"` → `"TASK_STATE_WORKING"`
- `"completed"` → `"TASK_STATE_COMPLETED"`
- `"failed"` → `"TASK_STATE_FAILED"`
- `"canceled"` → `"TASK_STATE_CANCELED"`
- `"rejected"` → `"TASK_STATE_REJECTED"`
- `"input-required"` → `"TASK_STATE_INPUT_REQUIRED"`
- `"auth-required"` → `"TASK_STATE_AUTH_REQUIRED"`
- `"user"` → `"ROLE_USER"`
- `"agent"` → `"ROLE_AGENT"`

#### 6. 字段名称变更（低影响）

- `file.mimeType` → `mediaType`
- 操作名称（过渡期间提供别名）

#### 7. 通过 google.rpc.Status 标准化错误处理（高影响）

HTTP+JSON 错误响应已更新，使用 `google.rpc.Status` 的 ProtoJSON 表示，而不是 RFC 9457（Problem Details）。JSON-RPC 和 HTTP+JSON 绑定现在在 `data` / `details` 数组中使用 `google.rpc.ErrorInfo` 提供 A2A 特定的错误上下文。

**变更：**

- **HTTP+JSON Content-Type：** 从 `application/problem+json` 改为 `application/json`。
- **错误模型：** 使用 `google.rpc.Status` 字段（`code`、`message`、`details`）。
- **A2A 错误信息：** 必须在 `details` 中包含 `google.rpc.ErrorInfo` 对象，其中包含 `reason`（A2A 错误类型的 UPPER_SNAKE_CASE）和 `domain: "a2a-protocol.org"`。

**JSON-RPC 迁移示例：**

```json
// v0.3.0
"error": {
  "code": -32001,
  "message": "Task not found",
  "data": { "taskId": "123" }
}

// v1.0
"error": {
  "code": -32001,
  "message": "任务未找到",
  "data": [
    {
      "@type": "type.googleapis.com/google.rpc.ErrorInfo",
      "reason": "TASK_NOT_FOUND",
      "domain": "a2a-protocol.org",
      "metadata": { "taskId": "123" }
    }
  ]
}
```

**HTTP+JSON 迁移示例：**

```http
// v0.3.0（使用 RFC 9457 草案）
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://a2a-protocol.org/errors/task-not-found",
  "title": "任务未找到",
  "status": 404,
  "detail": "指定的任务 ID 不存在"
}

// v1.0
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": 404,
    "status": "NOT_FOUND",
    "message": "指定的任务 ID 不存在",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "TASK_NOT_FOUND",
        "domain": "a2a-protocol.org"
      }
    ]
  }
}
```

### 可以利用的新能力

#### 1. 执行模式控制

```typescript
// 等待任务完成（默认）
const result = await sendMessage(message, { returnImmediately: false });

// 立即返回，稍后轮询
const task = await sendMessage(message, { returnImmediately: true });
```

#### 2. 智能体卡片签名验证

```typescript
if (agentCard.signatures && agentCard.signatures.length > 0) {
  const verified = await verifyAgentCardSignature(agentCard);
  if (!verified) {
    throw new Error("智能体卡片签名验证失败");
  }
}
```

#### 3. 扩展要求

```typescript
const requiredExtensions = agentCard.extensions
  .filter(ext => ext.required)
  .map(ext => ext.uri);

// 检查客户端是否支持必需的扩展
if (!clientSupportsAll(requiredExtensions)) {
  throw new Error("缺少必需的扩展支持");
}
```

#### 4. 增强的时间戳跟踪

```typescript
const taskAge = Date.now() - new Date(task.createdAt).getTime();
const timeSinceUpdate = Date.now() - new Date(task.lastModified).getTime();
```

#### 5. 版本协商

```typescript
// 客户端发送 A2A-Version 头
headers["A2A-Version"] = "1.0";

// 服务器验证并在不支持时拒绝
if (!supportedVersions.includes(requestedVersion)) {
  throw new VersionNotSupportedError();
}
```

### 迁移策略建议

#### 阶段 1：兼容层

1. 添加对解析新旧鉴别器模式的支持
2. 基于协议版本的版本检测
3. 过渡期间支持两种智能体卡片结构

#### 阶段 2：双重支持

1. 更新所有 API 以发出 v1.0 格式
2. 为 v0.3.0 维护向后兼容读取器
3. 添加 A2A-Version 头处理
4. 在旧版基于页面的分页旁边实现基于游标的分页

#### 阶段 3：仅 v1.0

1. 弃用 v0.3.0 兼容性代码
2. 移除旧版鉴别器解析
3. 移除基于页面的分页
4. 清理双格式支持代码

#### 向后兼容策略

v1.0 引入了协议版本控制的正式方法，支持 SDK 向后兼容性。

**每个接口的协议版本：**

- 每个 `AgentInterface` 现在指定自己的 `protocolVersion` 字段
- 智能体可以通过暴露多个接口同时支持多个协议版本
- 客户端通过从智能体卡片选择合适的接口来协商版本

**SDK 实现模式：**

```typescript
// SDK 可以支持多个协议版本
class A2AClient {
  async connect(agentCardUrl: string) {
    const card = await this.getAgentCard(agentCardUrl);

    // 找到最佳匹配接口
    const interface = card.supportedInterfaces.find(i =>
      this.supportedVersions.includes(i.protocolVersion)
    );

    if (!interface) {
      throw new Error("没有兼容的协议版本");
    }

    // 使用版本特定的适配器
    return this.createAdapter(interface.protocolVersion, interface);
  }
}
```

**好处：**

- SDK 可以维护对多个协议版本的支持
- 智能体可以通过同时支持旧版本和新版本逐渐迁移
- 客户端自动选择最佳兼容版本
- 支持旧协议版本的优雅弃用

### 测试考虑

- 使用 v0.3.0 和 v1.0 格式的数据进行测试
- 验证智能体卡片签名验证
- 测试基于游标的分页边缘情况（空结果、单页等）
- 验证新错误类型的正确处理
- 测试扩展要求验证

### 推荐优先级

#### 关键（立即执行）

- 更新 Part 和流事件解析（鉴别器模式）
- 更新智能体卡片解析（结构变更）
- 向所有请求添加 A2A-Version 头

#### 高优先级（1 个月内）

- 实现基于游标的分页
- 更新枚举值处理（state 字段）
- 添加 return_immediately 参数支持

#### 中等优先级（3 个月内）

- 实现智能体卡片签名验证
- 添加扩展要求检查
- 更新时间戳处理为 ISO 8601 格式
- 实现新的错误类型

#### 低优先级（锦上添花）

- 添加 createdAt/lastModified 时间戳跟踪
- 利用增强的元数据能力
- 实现双向 TLS 身份验证支持

---

## 结论

A2A 协议 v1.0 代表了协议成熟度的重要一步，同时保持了 v0.3.0 的核心架构原则。变更侧重于标准化、类型安全和企业就绪性，要求开发者更新其实现，但提供了更清晰的规范和更好的开发者体验。

重大变更虽然需要代码更新，但实现起来很直接，并提高了代码清晰度。围绕版本控制、签名和增强扩展的新能力为 v1.x 系列内的未来协议演进提供了坚实基础。

开发者应规划分阶段迁移方法，优先处理关键的重大变更，同时逐步采用新能力。
