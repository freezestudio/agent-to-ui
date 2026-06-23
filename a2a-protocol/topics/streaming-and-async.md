# 长时间运行任务的流式传输和异步操作

Agent2Agent（A2A）协议明确设计用于处理可能不会立即完成的任务。许多 AI 驱动的操作通常是长时间运行的，涉及多个步骤，产生增量结果，或需要人工干预。A2A 提供了管理此类异步交互的机制，确保客户端有效接收更新，无论它们是保持持续连接还是以更断开的方式操作。

## 使用服务器发送事件（SSE）的流式传输

对于产生增量结果（如生成长文档或流媒体）或提供持续状态更新的任务，A2A 支持使用服务器发送事件（SSE）进行实时通信。当客户端能够与 A2A 服务器保持活动 HTTP 连接时，此方法是理想的。

以下关键特性详细说明了如何在 A2A 协议中实现和管理 SSE 流式传输：

- **服务器能力：** A2A 服务器必须通过在其智能体卡片中设置 `capabilities.streaming: true` 来表示对流式传输的支持。

- **启动流：** 客户端使用 `SendStreamingMessage` RPC 方法发送初始消息（例如，提示或命令），并同时订阅该任务的更新。

- **服务器响应和连接：** 如果订阅成功，服务器以 HTTP 200 OK 状态和 `Content-Type: text/event-stream` 响应。此 HTTP 连接保持打开状态，以便服务器向客户端推送事件。

- **事件结构和类型：** 服务器通过此流发送事件。每个事件的 `data` 字段包含一个 JSON-RPC 2.0 响应对象，通常是 `SendStreamingMessageResponse`。`SendStreamingMessageResponse` 的 `result` 字段包含：

    - [`Task`](../specification.md#61-task-object)：表示工作的当前状态。
    - [`TaskStatusUpdateEvent`](../specification.md#taskstatusupdateevent)：传达任务生命周期状态的变化（例如，从 `working` 到 `input-required` 或 `completed`）。它还提供来自智能体的中间消息。
    - [`TaskArtifactUpdateEvent`](../specification.md#taskartifactupdateevent)：传递任务生成的新或更新的制品。这用于分块流式传输大文件或数据结构，使用 `append` 和 `lastChunk` 等字段帮助重新组装。

- **流终止：** 当任务达到终止或中断状态（例如，`COMPLETED`、`FAILED`、`CANCELED`、`REJECTED` 或 `INPUT_REQUIRED`）时，服务器关闭流并不再发送进一步更新。

- **重新订阅：** 如果客户端的 SSE 连接在任务仍处于活动状态时意外断开，客户端可以使用 `SubscribeToTask` RPC 方法尝试重新连接到流。

### 何时使用流式传输

使用 SSE 的流式传输最适合于：

- 长时间运行任务的实时进度监控。
- 增量接收大结果（制品）。
- 交互式、对话式的交流，即时反馈或部分响应有益。
- 需要低延迟从智能体获取更新的应用程序。

### 协议规范参考

有关详细结构，请参阅协议规范：

- [`SendStreamingMessage`](../specification.md#72-messagestream)
- [`SubscribeToTask`](../specification.md#79-taskssubscribe)

## 断连场景的推送通知

对于非常长时间运行的任务（例如，持续数分钟、数小时甚至数天）或当客户端无法或不希望维持持久连接时（如移动客户端或无服务器函数），A2A 支持使用推送通知进行异步更新。这允许 A2A 服务器在发生重要任务更新时主动通知客户端提供的 Webhook。

以下关键特性详细说明了如何在 A2A 协议中实现和管理推送通知：

- **服务器能力：** A2A 服务器必须通过在其智能体卡片中设置 `capabilities.pushNotifications: true` 来表示对此功能的支持。
- **配置：** 客户端向服务器提供 [`PushNotificationConfig`](../specification.md#pushnotificationconfig)。此配置在以下位置提供：
    - 在初始 `SendMessage` 或 `SendStreamingMessage` 请求中，或
    - 单独使用 `CreateTaskPushNotificationConfig` RPC 方法为现有任务创建。
    `PushNotificationConfig` 包括 `url`（HTTPS Webhook URL）、可选的 `token`（用于客户端验证）和可选的 `authentication` 详细信息（供 A2A 服务器向 Webhook 进行身份验证）。
- **通知触发：** A2A 服务器决定何时发送推送通知，通常在任务达到重要状态变更时（例如，终止状态、`input-required` 或 `auth-required`）。
- **通知负载：** A2A 协议将 HTTP 主体负载定义为 [`StreamResponse`](../specification.md#323-stream-response) 对象，匹配流式操作中使用的格式。负载包含以下之一：`task`、`message`、`statusUpdate` 或 `artifactUpdate`。有关详细结构，请参见[推送通知负载](../specification.md#pushnotificationpayload)。
- **客户端操作：** 收到推送通知（并成功验证其真实性）后，客户端通常使用 `GetTask` RPC 方法，使用通知中的 `taskId` 来检索完整的、更新后的 `Task` 对象，包括任何新制品。

### 何时使用推送通知

推送通知适用于：

- 可能需要数分钟、数小时或数天才能完成的非常长时间运行的任务。
- 无法或不希望维持持久连接的客户端，例如移动应用程序或无服务器函数。
- 客户端只需要获知重大状态变更而不需要持续更新的场景。

### 协议规范参考

有关详细结构，请参阅协议规范：

- [`CreateTaskPushNotificationConfig`](../specification.md#317-create-push-notification-config)
- [`GetTask`](../specification.md#76-taskspushnotificationconfigget)

### 客户端推送通知服务

`PushNotificationConfig.url` 中指定的 `url` 指向客户端的推送通知服务。此服务负责接收来自 A2A 服务器的 HTTP POST 通知。其职责包括验证传入通知、验证其相关性，并将通知或其内容转发给适当的客户端应用程序逻辑或系统。

### 推送通知的安全考虑

由于推送通知的异步和服务器发起的出站性质，安全性至关重要。发送通知的 A2A 服务器和客户端的 Webhook 接收器都有关键的责任。

#### A2A 服务器安全（向客户端 Webhook 发送通知时）

- **Webhook URL 验证：** 服务器不应该盲目信任客户端提供的任何 URL 并发送 POST 请求。恶意客户端可能提供指向内部服务或不相关第三方系统的 URL，导致服务器端请求伪造（SSRF）攻击或充当分布式拒绝服务（DDoS）放大器。
    - **缓解策略：** 受信任域的白名单、所有权验证（例如，质询-响应机制）和网络控制（例如，出口防火墙）。
- **向客户端 Webhook 进行身份验证：** A2A 服务器必须根据 `PushNotificationConfig.authentication` 中指定的方案向客户端 Webhook URL 进行身份验证。常见方案包括 Bearer 令牌（OAuth 2.0）、API 密钥、HMAC 签名或双向 TLS（mTLS）。

#### 客户端 Webhook 接收器安全（接收来自 A2A 服务器的通知时）

- **验证 A2A 服务器：** Webhook 端点必须严格验证传入通知请求的真实性，以确保它们来自合法的 A2A 服务器而非冒充者。
    - **验证方法：** 验证签名/令牌（例如，针对 A2A 服务器受信任公钥的 JWT 签名、HMAC 签名或 API 密钥验证）。另外，验证 `PushNotificationConfig.token`（如果提供）。
- **防止重放攻击：**
    - **时间戳：** 通知应该包含时间戳。Webhook 应该拒绝太旧的通知。
    - **随机数/唯一 ID：** 对于关键通知，考虑使用唯一的单次使用标识符（例如，JWT 的 `jti` 声明或事件 ID）以防止处理重复通知。
- **安全密钥管理和轮换：** 实施安全的密钥管理实践，包括定期密钥轮换，特别是对于加密密钥。像 JWKS（JSON Web Key Set）这样的协议有助于非对称密钥的密钥轮换。

#### 非对称密钥流程示例（JWT + JWKS）

1. 客户端创建 `PushNotificationConfig`，指定 `authentication.scheme: "Bearer"`，并可能为 JWT 指定预期的 `issuer` 或 `audience`。
2. A2A 服务器在发送通知时：
    - 生成 JWT，使用其私钥签名。JWT 包含 `iss`（签发者）、`aud`（受众）、`iat`（签发时间）、`exp`（过期时间）、`jti`（JWT ID）和 `taskId` 等声明。
    - JWT 头指示签名算法和密钥 ID（`kid`）。
    - A2A 服务器通过 JWKS 端点使其公钥可用。
3. 客户端 Webhook 在收到通知时：
    - 从 Authorization 头中提取 JWT。
    - 检查 JWT 头中的 `kid`（密钥 ID）。
    - 从 A2A 服务器的 JWKS 端点获取对应的公钥（建议缓存密钥）。
    - 使用公钥验证 JWT 签名。
    - 验证声明（`iss`、`aud`、`iat`、`exp`、`jti`）。
    - 检查 `PushNotificationConfig.token`（如果提供）。

这种全面的、分层推送通知安全方法有助于确保消息是真实的、完整的和及时的，保护发送方 A2A 服务器和接收方客户端 Webhook 基础设施。
