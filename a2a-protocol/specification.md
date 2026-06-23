# Agent2Agent（A2A）协议规范

??? note "**最新发布版本** [`1.0.0`](https://a2a-protocol.org/v1.0.0/specification)"

    **先前版本**

    - [`0.3.0`](https://a2a-protocol.org/v0.3.0/specification)
    - [`0.2.6`](https://a2a-protocol.org/v0.2.6/specification)
    - [`0.1.0`](https://a2a-protocol.org/v0.1.0/specification)

有关版本之间的变更，请参见[发布说明](https://github.com/a2aproject/A2A/releases)。

## 1. 引言

Agent2Agent（A2A）协议是一种开放标准，旨在促进独立、可能不透明的 AI 智能体系统之间的通信和互操作性。在智能体可能使用不同框架、语言或由不同供应商构建的生态系统中，A2A 提供了一种通用语言和交互模型。

本文档提供了 A2A 协议的详细技术规范。其主要目标是使智能体能够：

- 发现彼此的能力。
- 协商交互模态（文本、文件、结构化数据）。
- 管理协作任务。
- 安全地交换信息以实现用户目标，**而无需访问彼此的内部状态、记忆或工具。**

### 1.1. A2A 的关键目标

- **互操作性：** 弥合不同智能体系统之间的通信鸿沟。
- **协作：** 使智能体能够委派任务、交换上下文并共同处理复杂的用户请求。
- **发现：** 允许智能体动态地查找和理解其他智能体的能力。
- **灵活性：** 支持各种交互模式，包括同步请求/响应、实时更新流式传输和长时间运行任务的异步推送通知。
- **安全性：** 促进适合企业环境的安全通信模式，依赖于标准 Web 安全实践。
- **异步性：** 原生支持长时间运行的任务和可能涉及人在回路中的交互。

### 1.2. 指导原则

- **简单：** 重用现有的、广泛理解的标准（HTTP、JSON-RPC 2.0、服务器发送事件）。
- **企业就绪：** 通过与已建立的企业实践对齐，解决身份验证、授权、安全、隐私、跟踪和监控问题。
- **异步优先：** 专为（可能非常）长时间运行的任务和人在回路中的交互而设计。
- **模态无关：** 支持各种内容类型的交换，包括文本、音频/视频（通过文件引用）、结构化数据/表单以及潜在的内嵌 UI 组件（例如，在部件中引用的 iframe）。
- **不透明执行：** 智能体基于声明的能力和交换的信息进行协作，无需共享其内部思想、计划或工具实现。

有关 A2A 目的和好处的更广泛理解，请参见[什么是 A2A？](./topics/what-is-a2a.md)。

### 1.3. 规范结构

本规范组织为三个不同的层，它们协同工作以提供完整的协议定义：

```mermaid
graph TB
    subgraph L1 ["A2A 数据模型"]
        direction LR
        A[Task] ~~~ B[Message] ~~~ C[AgentCard] ~~~ D[Part] ~~~ E[Artifact] ~~~ F[Extension]
    end

    subgraph L2 ["A2A 操作"]
        direction LR
        G[发送消息] ~~~ H[发送流式消息] ~~~ I[获取任务] ~~~ J[列出任务] ~~~ K[取消任务] ~~~ L[获取智能体卡片]
    end

    subgraph L3 ["协议绑定"]
        direction LR
        M[JSON-RPC 方法] ~~~ N[gRPC RPC] ~~~ O[HTTP/REST 端点] ~~~ P[自定义绑定]
    end

    %% 层之间的依赖关系
    L1 --> L2
    L2 --> L3


    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style D fill:#e1f5fe
    style E fill:#e1f5fe
    style F fill:#e1f5fe

    style G fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#f3e5f5
    style J fill:#f3e5f5
    style K fill:#f3e5f5
    style L fill:#f3e5f5

    style M fill:#e8f5e8
    style N fill:#e8f5e8
    style O fill:#e8f5e8

    style L1 fill:#f0f8ff,stroke:#333,stroke-width:2px
    style L2 fill:#faf0ff,stroke:#333,stroke-width:2px
    style L3 fill:#f0fff0,stroke:#333,stroke-width:2px
```

**第 1 层：规范数据模型** 定义了所有 A2A 实现必须理解的核心数据结构和消息格式。这些是协议无关的定义，表达为 Protocol Buffer 消息。

**第 2 层：抽象操作** 描述了 A2A 智能体必须支持的基本能力和行为，独立于它们如何通过特定协议暴露。

**第 3 层：协议绑定** 提供了抽象操作和数据结构到特定协议绑定（JSON-RPC、gRPC、HTTP/REST）的具体映射，包括方法名称、端点模式和协议特定行为。

这种分层方法确保：

- 核心语义在所有协议绑定中保持一致
- 可以在不更改基本数据模型的情况下添加新的协议绑定
- 开发者可以独立于绑定关注点来推理 A2A 操作
- 通过共享对规范数据模型的理解来维护互操作性

### 1.4 规范性内容

除了本文档中定义的协议要求外，文件 `spec/a2a.proto` 是所有协议数据对象和请求/响应消息的单一权威规范性定义。生成的 JSON 制品（`spec/a2a.json`，在构建时生成，不提交）可以为工具和网站方便地发布，但它是非规范性的构建制品。SDK 语言绑定、模式以及任何其他派生形式**必须**从 proto 重新生成（直接或通过代码生成），而不是手动编辑。

**变更控制和弃用生命周期：**

- 引入：当 proto 消息或字段被重命名时，新名称被添加，而现有已发布的名称保持可用但标记为已弃用，直到下一个主版本发布。
- 文档：在引入重大破坏性变更时，必须通过辅助文档提供迁移指南。
- 锚点：必须保留旧文档锚点（作为隐藏 HTML 锚点），以避免破坏入站链接。
- SDK/模式别名：SDK 和 JSON 模式应提供已弃用的别名类型/定义，以保持向后兼容性。
- 移除：已弃用的名称不应早于其替代品引入后的下一个主版本被移除。

**自动生成：**

文档构建会即时生成 `specification/json/a2a.json`（该文件不在源代码控制中）。未来的改进可能会发布 OpenAPI v3 + JSON Schema 包，以增强工具支持。

**理由：**

将 proto 文件作为规范性来源确保协议中立性，减少规范漂移，并为生态系统提供确定性的演进路径。

## 2. 术语

### 2.1. 需求语言

本文档中的关键词"必须（MUST）"、"不得（MUST NOT）"、"必需（REQUIRED）"、"应（SHALL）"、"不应（SHALL NOT）"、"应该（SHOULD）"、"不应该（SHOULD NOT）"、"推荐（RECOMMENDED）"、"可以（MAY）"和"可选（OPTIONAL）"应按照 [RFC 2119](https://tools.ietf.org/html/rfc2119) 中的描述进行解释。

### 2.2. 核心概念

A2A 围绕几个关键概念展开。详细解释请参考[核心概念指南](./topics/key-concepts.md)。

- **A2A 客户端：** 代表用户或其他系统向 A2A 服务器发起请求的应用程序或智能体。
- **A2A 服务器（远程智能体）：** 暴露符合 A2A 的端点、处理任务并提供响应的智能体或智能体系统。
- **智能体卡片（Agent Card）：** A2A 服务器发布的 JSON 元数据文档，描述其身份、能力、技能、服务端点和身份验证要求。
- **消息（Message）：** 客户端与远程智能体之间的通信轮次，具有`角色`（"user"或"agent"）并包含一个或多个`部件`（Parts）。
- **任务（Task）：** A2A 管理的基本工作单元，由唯一 ID 标识。任务是有状态的，并经历已定义的生命周期。
- **部件（Part）：** 消息或制品中的最小内容单元。部件可以包含文本、文件引用或结构化数据。
- **制品（Artifact）：** 智能体作为任务结果生成的输出（例如，文档、图像、结构化数据），由`部件`组成。
- **流式传输（Streaming）：** 任务的实时增量更新（状态变更、制品块），通过协议特定的流式传输机制传递。
- **推送通知（Push Notifications）：** 通过服务器发起的 HTTP POST 请求传递到客户端提供的 Webhook URL 的异步任务更新，适用于长时间运行或断连场景。
- **上下文（Context）：** 一个可选的标识符，用于逻辑上分组相关的任务和消息。
- **扩展（Extension）：** 一种机制，使智能体能够提供超出核心 A2A 规范的额外功能或数据。

## 3. A2A 协议操作

本节以绑定无关的方式描述 A2A 协议的核心操作。这些操作定义了所有 A2A 实现必须支持的基本能力，无论底层绑定机制如何。

### 3.1. 核心操作

以下操作定义了所有 A2A 实现必须支持的基本能力，独立于所使用的特定协议绑定。有关这些操作到协议特定方法名称和端点的快速参考映射，请参见[第 5.3 节（方法映射参考）](#53-method-mapping-reference)。有关详细的协议特定实现细节，请参见：

- [第 9 节：JSON-RPC 协议绑定](#9-json-rpc-protocol-binding)
- [第 10 节：gRPC 协议绑定](#10-grpc-protocol-binding)
- [第 11 节：HTTP+JSON/REST 协议绑定](#11-httpjsonrest-protocol-binding)

#### 3.1.1. 发送消息（Send Message）

发起智能体交互的主要操作。客户端向智能体发送消息，并接收跟踪处理的任务或直接响应消息。

**输入：**

- [`SendMessageRequest`](#321-sendmessagerequest)：包含消息、配置和元数据的请求对象

**输出：**

- [`Task`](#411-task)：表示消息处理的任务对象，或者
- [`Message`](#414-message)：直接响应消息（适用于不需要任务跟踪的简单交互）

**错误：**

- [`ContentTypeNotSupportedError`](#332-error-handling)：请求消息部件中提供的媒体类型不受智能体支持。
- [`UnsupportedOperationError`](#332-error-handling)：发送到处于终止状态（`TASK_STATE_COMPLETED`、`TASK_STATE_FAILED`、`TASK_STATE_CANCELED`、`TASK_STATE_REJECTED`）的任务的消息不能接受更多消息。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

**行为：**

智能体可以创建一个新的`任务`（Task）来异步处理提供的消息，或者对于简单交互可以直接返回一个`消息`（Message）响应。操作必须在有任务信息或响应消息时立即返回。当返回`任务`（Task）时，任务处理可能会在响应后继续进行。

#### 3.1.2. 发送流式消息（Send Streaming Message）

类似于发送消息，但在处理过程中实时流式传输更新。

**输入：**

- [`SendMessageRequest`](#321-sendmessagerequest)：包含消息、配置和元数据的请求对象

**输出：**

- [`流响应`](#323-stream-response)对象包含：
    - 初始响应：[`Task`](#411-task)对象或[`Message`](#414-message)对象
    - 跟随`任务`的后续事件可能包括[`TaskStatusUpdateEvent`](#421-taskstatusupdateevent)和[`TaskArtifactUpdateEvent`](#422-taskartifactupdateevent)对象的流
- 最终完成指示

**错误：**

- [`UnsupportedOperationError`](#332-error-handling)：智能体不支持流式传输（参见[能力验证](#334-capability-validation)）。
- [`UnsupportedOperationError`](#332-error-handling)：发送到处于终止状态的任务的消息不能接受更多消息。
- [`ContentTypeNotSupportedError`](#332-error-handling)：请求消息部件中提供的媒体类型不受智能体支持。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

**行为：**

操作必须建立用于实时更新的流式连接。流必须遵循以下模式之一：

1. **纯消息流：** 如果智能体返回[`Message`](#414-message)，流必须恰好包含一个`Message`对象，然后立即关闭。不提供任务跟踪或更新。

2. **任务生命周期流：** 如果智能体返回[`Task`](#411-task)，流必须以 Task 对象开始，后跟零个或多个[`TaskStatusUpdateEvent`](#421-taskstatusupdateevent)或[`TaskArtifactUpdateEvent`](#422-taskartifactupdateevent)对象。当任务达到终止状态时（`TASK_STATE_COMPLETED`、`TASK_STATE_FAILED`、`TASK_STATE_CANCELED`、`TASK_STATE_REJECTED`），流必须关闭。

智能体可以为复杂处理返回带状态/制品更新的`任务`，或者为直接流式响应返回`消息`而无需任务开销。实现必须提供进度和中间结果的即时反馈。

#### 3.1.3. 获取任务（Get Task）

检索先前启动的任务的当前状态（包括状态、制品和可选的历史记录）。这通常用于轮询通过发送消息启动的任务的状态，或者在通过推送通知收到通知或流结束后获取任务的最终状态。

**输入：**

{{ proto_to_table("GetTaskRequest") }}

关于 `historyLength` 的详细信息请参见[历史长度语义](#324-history-length-semantics)。

**输出：**

- [`Task`](#411-task)：请求任务的当前状态和制品

**错误：**

- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

#### 3.1.4. 列出任务（List Tasks）

检索任务列表，支持可选的过滤和分页功能。此方法允许客户端跨不同上下文或使用特定状态条件发现和管理多个任务。

**输入：**

{{ proto_to_table("ListTasksRequest") }}

当 `includeArtifacts` 为 false（默认值）时，响应中每个 Task 对象的 artifacts 字段必须完全省略。该字段不应以空数组或 null 值存在。当 `includeArtifacts` 为 true 时，应包含制品字段及其实际内容（如果任务没有制品，可能是一个空数组）。

**输出：**

{{ proto_to_table("ListTasksResponse") }}

关于 `nextPageToken` 的说明：`nextPageToken` 字段必须始终存在于响应中。当没有更多结果可检索时（即这是最后一页），该字段必须设置为空字符串（""）。客户端应检查空字符串以确定是否还有更多页面可用。

**错误：**

除了标准协议错误外，此操作没有特定错误。

**行为：**

操作必须只返回对已认证客户端可见的任务，必须使用基于游标的分页以获得性能和一致性。任务必须按最后更新时间降序排序。实现必须实施适当的授权范围，以确保客户端只能访问被授权的任务。有关详细安全要求，请参见[第 13.1 节：数据访问和授权范围](#131-data-access-and-authorization-scoping)。

***分页策略：***

此方法使用基于游标的分页（通过 `pageToken`/`nextPageToken`），而不是基于偏移量的分页，以获得更好的性能和一致性，特别是在处理大型数据集时。基于游标的分页避免了"深层分页问题"，即跳过大记录数对数据库效率低下。这种方法与 gRPC 规范一致，gRPC 也使用基于游标的分页（page_token/next_page_token）。

***排序：***

实现必须按状态时间戳时间降序返回任务（最近更新的任务优先）。这确保了一致的分页，并允许客户端有效监控最近的任务活动。

#### 3.1.5. 取消任务（Cancel Task）

请求取消正在进行的任务。服务器将尝试取消任务，但不保证成功（例如，任务可能已经完成或失败，或者在其当前阶段不支持取消）。

**输入：**

{{ proto_to_table("CancelTaskRequest") }}

**输出：**

- 带有取消状态的更新后的[`Task`](#411-task)

**错误：**

- [`TaskNotCancelableError`](#332-error-handling)：任务不处于可取消状态（例如，已完成、失败或已取消）。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

**行为：**

操作尝试取消指定的任务并返回其更新后的状态。

#### 3.1.6. 订阅任务（Subscribe to Task）

<span id="79-taskssubscribe"></span>

建立流式连接以接收现有任务的更新。

**输入：**

{{ proto_to_table("SubscribeToTaskRequest") }}

**输出：**

- [`流响应`](#323-stream-response)对象包含：
    - 初始响应：带有当前状态的[`Task`](#411-task)对象
    - [`TaskStatusUpdateEvent`](#421-taskstatusupdateevent)和[`TaskArtifactUpdateEvent`](#422-taskartifactupdateevent)对象的流

**错误：**

- [`UnsupportedOperationError`](#332-error-handling)：智能体不支持流式传输（参见[能力验证](#334-capability-validation)）。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。
- [`UnsupportedOperationError`](#332-error-handling)：操作尝试在处于终止状态的任务上进行。

**行为：**

该操作能够实时监控任务进度，可以与任何不处于终止状态的任务一起使用。当任务达到终止状态时，流必须终止。

操作必须在流中返回一个`Task`对象作为第一个事件，表示订阅时任务的当前状态。这防止了在调用 `GetTask` 和调用 `SubscribeToTask` 之间潜在的信息丢失。

#### 3.1.7. 创建推送通知配置（Create Push Notification Config）

<span id="75-taskspushnotificationconfigset"></span>
<span id="317-create-push-notification-config"></span>

为任务创建推送通知配置，以通过 Webhook 接收异步更新。

**输入：**

{{ proto_to_table("TaskPushNotificationConfig") }}

**输出：**

- [`PushNotificationConfig`](#431-pushnotificationconfig)：带有分配 ID 的已创建配置

**错误：**

- [`PushNotificationNotSupportedError`](#332-error-handling)：智能体不支持推送通知（参见[能力验证](#334-capability-validation)）。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

**行为：**

操作必须为任务更新通知建立 Webhook 端点。当任务更新发生时，智能体将向配置的 Webhook URL 发送 HTTP POST 请求，负载为[`StreamResponse`](#323-stream-response)（参见[推送通知负载](#433-push-notification-payload)的详细信息）。此操作仅在智能体支持推送通知能力时可用。配置必须持久化，直到任务完成或明确删除。

<span id="tasks-push-notification-config-operations"></span><span id="grpc-push-notification-operations"></span><span id="push-notification-operations"></span>

#### 3.1.8. 获取推送通知配置（Get Push Notification Config）

<span id="76-taskspushnotificationconfigget"></span>

检索任务的现有推送通知配置。

**输入：**

{{ proto_to_table("GetTaskPushNotificationConfigRequest") }}

**输出：**

- [`PushNotificationConfig`](#431-pushnotificationconfig)：请求的配置

**错误：**

- [`PushNotificationNotSupportedError`](#332-error-handling)：智能体不支持推送通知。
- [`TaskNotFoundError`](#332-error-handling)：推送通知配置不存在。

**行为：**

操作必须返回配置详情，包括 Webhook URL 和通知设置。如果配置不存在或客户端缺乏访问权限，操作必须失败。

#### 3.1.9. 列出推送通知配置（List Push Notification Configs）

检索任务的所有推送通知配置。

**输入：**

{{ proto_to_table("ListTaskPushNotificationConfigsRequest") }}

**输出：**

{{ proto_to_table("ListTaskPushNotificationConfigsResponse") }}

**错误：**

- [`PushNotificationNotSupportedError`](#332-error-handling)：智能体不支持推送通知。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在或不可访问。

**行为：**

操作必须返回指定任务的所有活动推送通知配置，对于有许多配置的任务可以支持分页。

#### 3.1.10. 删除推送通知配置（Delete Push Notification Config）

移除任务的推送通知配置。

**输入：**

{{ proto_to_table("DeleteTaskPushNotificationConfigRequest") }}

**输出：**

- 删除确认（实现特定）

**错误：**

- [`PushNotificationNotSupportedError`](#332-error-handling)：智能体不支持推送通知。
- [`TaskNotFoundError`](#332-error-handling)：任务 ID 不存在。

**行为：**

操作必须永久移除指定的推送通知配置。删除后将不再向配置的 Webhook 发送进一步通知。此操作必须是幂等的——多次删除同一配置具有相同的效果。

#### 3.1.11. 获取扩展智能体卡片（Get Extended Agent Card）

在客户端通过身份验证后检索可能更详细的智能体卡片版本。此端点仅在 `AgentCard.capabilities.extendedAgentCard` 为 `true` 时可用。

**输入：**

{{ proto_to_table("GetExtendedAgentCardRequest") }}

**输出：**

- [`AgentCard`](#441-agentcard)：一个完整的智能体卡片对象，可能包含公共卡片中不存在的额外细节或技能

**错误：**

- [`UnsupportedOperationError`](#332-error-handling)：智能体不支持经过身份验证的扩展卡片。
- [`ExtendedAgentCardNotConfiguredError`](#332-error-handling)：智能体声明支持但没有配置扩展智能体卡片。

**行为：**

- **身份验证**：客户端必须使用公共 `AgentCard.securitySchemes` 和 `AgentCard.security` 字段中声明的方案之一对请求进行身份验证。
- **扩展信息**：操作可能根据客户端身份验证级别返回不同的详细信息，包括公共智能体卡片中不可用的额外技能、能力或配置。
- **卡片替换**：检索此扩展卡片的客户端应该在其经过身份验证的会话期间或用卡片的版本变更之前，用从此端点接收的内容替换其缓存的公共智能体卡片。
- **可用性**：此操作仅在公共智能体卡片声明 `capabilities.extendedAgentCard: true` 时可用。

有关扩展智能体卡片的详细安全指南，请参见[第 13.3 节：扩展智能体卡片访问控制](#133-extended-agent-card-access-control)。

### 3.2. 操作参数对象

本节定义了跨多个操作使用的公共参数对象。

#### 3.2.1. SendMessageRequest

{{ proto_to_table("SendMessageRequest") }}

#### 3.2.2. SendMessageConfiguration

{{ proto_to_table("SendMessageConfiguration") }}

**执行模式：**

[`SendMessageConfiguration`](#322-sendmessageconfiguration) 中的 `return_immediately` 字段控制操作是立即返回还是等待任务完成。操作默认是阻塞的：

- **阻塞（`return_immediately: false` 或未设置）**：操作必须等待直到任务达到终止状态（`TASK_STATE_COMPLETED`、`TASK_STATE_FAILED`、`TASK_STATE_CANCELED`、`TASK_STATE_REJECTED`）或中断状态（`TASK_STATE_INPUT_REQUIRED`、`TASK_STATE_AUTH_REQUIRED`）才返回。响应必须包含带有所有制品和状态信息的最新任务状态。这是默认行为。

- **非阻塞（`return_immediately: true`）**：操作必须在创建任务后立即返回，即使处理仍在进行中。返回的任务将处于进行中状态（例如，`TASK_STATE_WORKING`、`TASK_STATE_INPUT_REQUIRED`）。调用者有责任使用[获取任务](#313-get-task)轮询更新、通过[订阅任务](#316-subscribe-to-task)订阅或通过推送通知接收更新。

`return_immediately` 字段在以下情况下没有效果：

- 当操作返回直接[`消息`](#414-message)响应而不是任务时。
- 对于流式操作，这些操作始终实时返回更新。
- 在配置的推送通知配置上，它独立于执行模式运行。

#### 3.2.3. 流响应（Stream Response）

<span id="323-stream-response"></span>
<span id="72-messagestream"></span>

{{ proto_to_table("StreamResponse") }}

此包装器允许流式端点通过单个响应流返回不同类型的更新，同时保持类型安全。

#### 3.2.4. 历史长度语义

`historyLength` 参数出现在多个操作中，控制响应中返回多少任务历史记录。此参数在所有操作中遵循一致的语义：

- **未设置/未定义**：不施加限制；服务器返回其默认量的历史记录（实现定义，可能是全部历史）
- **0**：不应返回历史记录；`history` 字段应被省略
- **> 0**：最多返回这么多条来自任务历史的最新消息

#### 3.2.5. 元数据（Metadata）

一个灵活的键值映射，用于传递附加上下文或操作参数。元数据键是字符串，值可以是任何可以在 JSON 中表示的有效值。[`扩展`](#46-extensions)可用于为特定用例强类型化元数据值。

#### 3.2.6 服务参数（Service Parameters）

用于传递横向适用上下文或参数的键值映射，具有不区分大小写的字符串键和区分大小写的字符串值。这些服务参数键值对的传输机制由特定协议绑定定义（例如，HTTP 绑定使用 HTTP 头，gRPC 绑定使用 gRPC 元数据）。自定义协议绑定**必须**在其绑定规范中说明如何传输服务参数。

**标准 A2A 服务参数：**

| 名称             | 描述                                                                                                                                             | 示例值                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| `A2A-Extensions` | 客户端想要在请求中使用的扩展 URI 的逗号分隔列表                                                                                                     | `https://example.com/extensions/geolocation/v1,https://standards.org/extensions/citations/v1` |
| `A2A-Version`    | 客户端正在使用的 A2A 协议版本。如果版本不受支持，智能体返回[`VersionNotSupportedError`](#332-error-handling)                                             | `1.0`                                                                                         |

由于服务参数名称可能需要与底层传输协议或基础设施定义的其他参数共存，本规范定义的所有服务参数将以 `a2a-` 为前缀。

### 3.3. 操作语义

#### 3.3.1. 幂等性

- **获取操作**（获取任务、列出任务、获取扩展智能体卡片）本质上是幂等的
- **发送消息**操作可能是幂等的。智能体可以利用 messageId 检测重复消息。
- **取消任务**操作是幂等的——多个取消请求具有相同的效果。如果任务已被取消并清除，重复的取消请求可能返回 `TaskNotFoundError`。

#### 3.3.2. 错误处理

所有操作可能返回以下类别的错误。服务器**必须**返回适当的错误，并**应该**提供可操作的信息以帮助客户端解决问题。

**错误类别和服务器要求：**

- **身份验证错误**：无效或缺失的凭证
    - 服务器**必须**拒绝带有无效或缺失身份验证凭证的请求
    - 服务器**应该**在错误响应中包含身份验证质询信息
    - 服务器**应该**指定需要哪种身份验证方案
    - 示例错误码：HTTP `401 Unauthorized`、gRPC `UNAUTHENTICATED`、JSON-RPC 自定义错误
    - 示例场景：缺少 Bearer 令牌、API 密钥过期、OAuth 令牌无效

- **授权错误**：执行请求操作权限不足
    - 当已验证的客户端缺乏所需权限时，服务器**必须**返回授权错误
    - 服务器**应该**指示缺少什么权限或范围（不泄露客户端无法访问的资源的敏感信息）
    - 服务器**不得**透露客户端未被授权访问的资源的存在
    - 示例错误码：HTTP `403 Forbidden`、gRPC `PERMISSION_DENIED`、JSON-RPC 自定义错误
    - 示例场景：尝试访问其他用户创建的任务、OAuth 范围不足

- **验证错误**：无效的输入参数或消息格式
    - 服务器**必须**在处理之前验证所有输入参数
    - 服务器**应该**指定哪个参数验证失败以及原因
    - 服务器**应该**提供有效参数值或格式的指导
    - 示例错误码：HTTP `400 Bad Request`、gRPC `INVALID_ARGUMENT`、JSON-RPC `-32602 Invalid params`
    - 示例场景：无效的任务 ID 格式、缺少必需的消息部件、不支持的内容类型

- **资源错误**：请求的任务未找到或不可访问
    - 当请求的资源不存在或对已验证的客户端不可访问时，服务器**必须**返回未找到错误
    - 服务器**不应**区分"不存在"和"未授权"，以防止信息泄露
    - 示例错误码：HTTP `404 Not Found`、gRPC `NOT_FOUND`、JSON-RPC 自定义错误（参见 A2A 特定错误）
    - 示例场景：任务 ID 不存在、任务已被删除、配置未找到

- **系统错误**：内部智能体故障或临时不可用
    - 服务器**应该**针对临时故障与永久错误返回适当的错误码
    - 服务器**可以**包含重试指导（例如，HTTP 中的 Retry-After 头）
    - 服务器**应该**记录系统错误以进行诊断
    - 示例错误码：HTTP `500 Internal Server Error` 或 `503 Service Unavailable`、gRPC `INTERNAL` 或 `UNAVAILABLE`、JSON-RPC `-32603 Internal error`
    - 示例场景：数据库连接失败、下游服务超时、超过速率限制

**错误负载结构：**

A2A 协议中的所有错误响应，无论绑定如何，**必须**传达以下信息：

1. **错误码**：错误类型的机器可读标识符（例如，字符串代码、数字代码或协议特定状态）
2. **错误消息**：错误的人类可读描述
3. **错误详情**（可选）：提供有关错误的额外结构化信息的对象数组。数组中的每个对象**必须**包含一个标识对象类型的 `@type` 键（使用 [ProtoJSON `Any` 表示](https://protobuf.dev/programming-guides/json)）。在适用的情况下，**应该**使用来自 [`google.rpc` 错误模型](https://cloud.google.com/apis/design/errors#error_model) 的已知类型（例如，`ErrorInfo`、`BadRequest`）。错误详情可用于：
    - 受影响的字段或参数
    - 上下文信息（例如，任务 ID、时间戳）
    - 解决建议

协议绑定**必须**将这些元素映射到其原生错误表示，同时保留语义含义。有关具体错误格式示例，请参见绑定特定部分：[JSON-RPC 错误处理](#95-error-handling)、[gRPC 错误处理](#106-error-handling)和[HTTP/REST 错误处理](#116-error-handling)。

**A2A 特定错误：**

| 错误名称                            | 描述                                                                                                                                                                                                            |
| :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaskNotFoundError`                   | 指定的任务 ID 不对应现有或可访问的任务。它可能无效、已过期或已完成并清除。                                                                            |
| `TaskNotCancelableError`              | 尝试取消不处于可取消状态的任务（例如，它已经达到终止状态如 `TASK_STATE_COMPLETED`、`TASK_STATE_FAILED`、`TASK_STATE_CANCELED`、`TASK_STATE_REJECTED`）。 |
| `PushNotificationNotSupportedError`   | 客户端尝试使用推送通知功能，但服务器智能体不支持（即 `AgentCard.capabilities.pushNotifications` 为 `false`）。                                                           |
| `UnsupportedOperationError`           | 请求的操作或其特定方面不受此服务器智能体实现支持。                                                                                                               |
| `ContentTypeNotSupportedError`        | 请求消息部件中提供的或为制品隐含的媒体类型不受智能体或正在调用的特定技能支持。                                                                     |
| `InvalidAgentResponseError`           | 智能体返回的响应不符合当前方法的规范。                                                                                                                        |
| `ExtendedAgentCardNotConfiguredError` | 智能体没有配置扩展智能体卡片，而请求的操作需要一张。                                                                                                            |
| `ExtensionSupportRequiredError`       | 服务器请求使用智能体卡片中标记为 `required: true` 的扩展，但客户端未在请求中声明支持。                                                                        |
| `VersionNotSupportedError`            | 请求中指定的 A2A 协议版本（通过 `A2A-Version` 服务参数）不受智能体支持。                                                                                                 |

#### 3.3.3. 异步处理

A2A 操作为异步任务执行而设计。操作立即返回[`任务`](#411-task)对象或[`消息`](#414-message)对象，当返回任务时，处理在后台继续。客户端通过轮询、流式传输或推送通知检索任务更新（参见[第 3.5 节](#35-task-update-delivery-mechanisms)）。智能体可以接受非终止状态任务的额外消息，以实现多轮交互（参见[第 3.4 节](#34-multi-turn-interactions)）。

#### 3.3.4. 能力验证

智能体在其[`智能体卡片`](#441-agentcard)中声明可选能力。当客户端尝试使用需要智能体卡片中未声明为支持的能力的操作或功能时，智能体**必须**返回适当的错误响应：

- **推送通知**：如果 `AgentCard.capabilities.pushNotifications` 为 `false` 或不存在，与推送通知配置相关的操作（创建、获取、列出、删除）**必须**返回 [`PushNotificationNotSupportedError`](#332-error-handling)。
- **流式传输**：如果 `AgentCard.capabilities.streaming` 为 `false` 或不存在，尝试使用 `SendStreamingMessage` 或 `SubscribeToTask` 操作**必须**返回 [`UnsupportedOperationError`](#332-error-handling)。
- **扩展智能体卡片**：如果 `AgentCard.capabilities.extendedAgentCard` 为 `false` 或不存在，尝试调用获取扩展智能体卡片操作**必须**返回 [`UnsupportedOperationError`](#332-error-handling)。如果智能体声明支持但未配置扩展卡片，它**必须**返回 [`ExtendedAgentCardNotConfiguredError`](#332-error-handling)。
- **扩展**：当服务器请求使用智能体卡片中标记为 `required: true` 的扩展但客户端未声明支持时，智能体**必须**返回 [`ExtensionSupportRequiredError`](#332-error-handling)。

客户端**应该**通过检查智能体卡片来验证能力支持，然后再尝试需要可选能力的操作。

### 3.4. 多轮交互

A2A 协议通过上下文标识符和任务引用支持多轮对话，使智能体能够跨多个交互保持对话连续性。

#### 3.4.1. 上下文标识符语义

`contextId` 是一个标识符，在逻辑上对多个相关的[`任务`](#411-task)和[`消息`](#414-message)对象进行分组，在一系列交互中提供连续性。

**生成和分配：**

- 智能体**可以**在处理不包含 `contextId` 字段的[`消息`](#414-message)时生成新的 `contextId`
- 如果智能体生成新的 `contextId`，它**必须**包含在响应中（[`任务`](#411-task)或[`消息`](#414-message)）
- 智能体**可以**接受并保留客户端提供的 `contextId` 值
- 如果智能体无法接受客户端提供的 `contextId`，它**必须**以错误拒绝请求，并且**不得**为响应生成新的 `contextId`
- 客户端**不应**向服务器提供客户端生成的 `contextId`，除非他们了解服务器将如何处理该 `contextId`
- 服务器生成的 `contextId` 值**应该**被客户端视为不透明标识符

**分组和范围：**

- `contextId` 在逻辑上对属于同一对话上下文的多个[`任务`](#411-task)对象和[`消息`](#414-message)对象进行分组
- 所有具有相同 `contextId` 的任务和消息**应该**被视为同一对话会话的一部分
- 智能体**可以**使用 `contextId` 在多个交互中维护内部状态、对话历史或 LLM 上下文
- 智能体**可以**实现上下文过期或清理策略，并**应该**记录任何此类策略

#### 3.4.2. 任务标识符语义

`taskId` 是[`任务`](#411-task)对象的唯一标识符，表示具有已定义生命周期的有状态工作单元。

**生成和分配：**

- 任务 ID 是**服务器生成的**，当响应[`消息`](#414-message)创建新任务时
- 智能体**必须**为创建的每个新任务生成唯一的 `taskId`
- 生成的 `taskId`**必须**包含在返回给客户端的[`任务`](#411-task)对象中
- 当客户端在[`消息`](#414-message)中包含 `taskId` 时，它**必须**引用现有任务
- 如果提供的 `taskId` 不对应现有任务，智能体**必须**返回 [`TaskNotFoundError`](#332-error-handling)
- **不支持**客户端提供的用于创建新任务的 `taskId` 值

#### 3.4.3. 多轮对话模式

A2A 协议支持多种多轮交互模式：

**上下文连续性：**

- [`任务`](#411-task)对象通过 `contextId` 字段维护对话上下文
- 客户端**可以**在后续消息中包含 `contextId` 以表示先前交互的延续
- 客户端**可以**使用 `taskId`（带或不带 `contextId`）继续或细化特定任务
- 客户端**可以**使用不带 `taskId` 的 `contextId` 在现有对话上下文中启动新任务
- 如果只提供 `taskId`，智能体**必须**从任务推断 `contextId`
- 智能体**必须**拒绝包含不匹配的 `contextId` 和 `taskId` 的消息（即提供的 `contextId` 与引用的[`任务`](#411-task)的不同）

**需要输入状态（Input Required State）：**

- 智能体可以通过将任务转换到 `input-required` 状态来请求处理过程中的额外输入
- 客户端通过发送带有相同 `taskId` 和 `contextId` 的新消息继续交互

**后续消息（Follow-up Messages）：**

- 客户端可以发送带有 `taskId` 引用的额外消息以继续或细化现有任务
- 客户端**应该**使用[`消息`](#414-message)中的 `referenceTaskIds` 字段来显式引用相关任务
- 智能体**应该**使用引用的任务来理解后续请求的上下文和意图

**上下文继承（Context Inheritance）：**

- 在相同 `contextId` 内创建的新任务可以继承先前交互的上下文
- 智能体**应该**利用共享的 `contextId` 提供上下文相关的响应

### 3.5. 任务更新传递机制

A2A 协议提供了三种互补的机制，供客户端接收关于任务进度和完成的更新。

#### 3.5.1. 更新机制概述

**轮询（获取任务）：**

- 客户端定期调用获取任务（[第 3.1.3 节](#313-get-task)）以检查任务状态
- 实现简单，适用于所有协议绑定
- 延迟较高，可能会有不必要的请求
- 最适合：简单集成、不频繁更新、位于限制性防火墙后面的客户端

**流式传输：**

- 事件发生时实时传递
- 操作：发送流式消息（[第 3.1.2 节](#312-send-streaming-message)）和订阅任务（[第 3.1.6 节](#316-subscribe-to-task)）
- 低延迟，对频繁更新高效
- 需要持久连接支持
- 最适合：交互式应用、实时仪表板、实时进度监控
- 需要 `AgentCard.capabilities.streaming` 为 `true`

**推送通知（WebHooks）：**

- 当任务状态变更时，智能体向客户端注册的端点发送 HTTP POST 请求
- 客户端不维护持久连接
- 异步传递，客户端必须可通过 HTTP 访问
- 最适合：服务器到服务器集成、长时间运行的任务、事件驱动架构
- 操作：创建（[第 3.1.7 节](#317-create-push-notification-config)）、获取（[第 3.1.8 节](#76-taskspushnotificationconfigget)）、列出（[第 3.1.9 节](#319-list-push-notification-configs)）、删除（[第 3.1.10 节](#3110-delete-push-notification-config)）
- 事件类型：TaskStatusUpdateEvent（[第 4.2.1 节](#421-taskstatusupdateevent)）、TaskArtifactUpdateEvent（[第 4.2.2 节](#422-taskartifactupdateevent)）、WebHook 负载（[第 4.3 节](#43-push-notification-objects)）
- 需要 `AgentCard.capabilities.pushNotifications` 为 `true`
- 无论智能体使用何种协议绑定，WebHook 调用都使用纯 HTTP 和 HTTP 协议绑定中定义的 JSON 负载

#### 3.5.2. 流式事件传递

**事件排序：**

所有实现必须按生成顺序传递事件。事件不得在传输过程中重新排序，无论使用何种协议绑定。

**每个任务的多个流：**

智能体可以为同一任务向一个或多个客户端提供多个并发流。这允许多个客户端（或同一客户端通过多个连接）独立订阅并接收任务进度的更新。

当多个流活跃于一个任务时：

- 事件必须广播到该任务的所有活跃流
- 每个流必须按相同顺序接收相同的事件
- 关闭一个流不得影响同一任务的其他活跃流
- 任务生命周期独立于任何单个流的生命周期

此能力支持以下场景：

- 多个团队成员监控同一长时间运行的任务
- 客户端在网络中断后通过打开新流重新连接到任务
- 不同的应用程序或仪表板显示同一任务的实时更新

#### 3.5.3. 推送通知传递

推送通知通过 HTTP POST 传递到客户端注册的 Webhook 端点。传递语义和可靠性保证在[第 4.3 节](#43-push-notification-objects)中定义。

### 3.6 版本控制

使用中的 A2A 协议的特定版本通过相应的 A2A 规范版本的 `Major.Minor` 元素（例如 `1.0`）标识。规范使用的补丁版本号不影响协议兼容性。补丁版本号不应在请求、响应和智能体卡片中使用，并且在客户端和服务器协商协议版本时不得考虑。

#### 3.6.1 客户端责任

客户端必须在每个请求中发送 `A2A-Version` 头，以在智能体升级到新协议版本后保持兼容性（0.3 客户端除外——空头将假定为 0.3）。发送 `A2A-Version` 头还向智能体提供了生态系统中版本使用的可见性，这有助于评估就地版本升级的风险。

**带有版本头的 HTTP GET 请求示例：**

```http
GET /tasks/task-123 HTTP/1.1
Host: agent.example.com
A2A-Version: 1.0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

客户端可以以请求参数而不是头的形式提供 `A2A-Version`。

**带有版本请求参数的 HTTP GET 请求示例：**

```http
GET /tasks/task-123?A2A-Version=1.0 HTTP/1.1
Host: agent.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

#### 3.6.2 服务器责任

智能体必须使用请求的 `A2A-Version`（匹配 `Major.Minor`）的语义处理请求。如果接口不支持该版本，智能体必须返回 [`VersionNotSupportedError`](#332-error-handling)。

智能体必须将空值解释为 0.3 版本。

智能体可以为同一传输的多个接口暴露不同版本，使用相同或不同的 URL。

#### 3.6.3 工具支持

实现 A2A 协议的工具库和 SDK 必须提供机制来帮助客户端管理协议版本控制，例如协商使用的传输和协议版本。需要协议最新功能的客户端智能体应配置为请求特定版本，并避免自动回退到较旧版本，以防止静默丢失功能。

### 3.7 消息和制品

消息和制品在 A2A 协议中服务于不同的目的。A2A 定义的核心交互模型是客户端发送消息以启动产生一个或多个制品的任务。

消息扮演几个关键角色：

- **任务启动**：客户端向智能体发送消息以启动新任务。
- **澄清消息**：智能体可以在启动任务之前向客户端发送消息以请求澄清。
- **状态消息**：智能体将消息附加到状态更新事件，以告知客户端任务进度、请求额外输入或提供信息性更新。
- **任务交互**：客户端发送消息为正在进行的任务提供额外输入或指示。

消息不应被用于传递任务输出。结果应使用与任务关联的制品（Artifact）返回。这种分离允许在通信（消息）和数据输出（制品）之间有清晰的区分。

任务历史字段包含任务执行期间交换的消息。然而，并非所有消息都保证被持久化在任务历史中；例如，临时信息性消息可能不会被存储。任务创建前交换的消息可能不会被存储在任务历史中。智能体负责确定哪些消息被持久化在任务历史中。

使用流式传输检索任务更新的客户端如果断开连接然后重新连接，可能不会收到所有状态更新消息。消息不得被视为关键信息的可靠传递机制。

智能体可以选择将所有包含重要信息的消息持久化在任务历史中，以确保客户端稍后可以检索它们。但是，除非通过带外协商，否则客户端不得依赖此行为。

## 4. 协议数据模型

A2A 协议使用 Protocol Buffers 定义了规范数据模型。所有协议绑定**必须**提供这些数据结构的功能等效表示。

### 4.1. 核心对象

<a id="Task"></a>

#### 4.1.1. Task（任务）

{{ proto_to_table("Task") }}

<a id="TaskStatus"></a>

#### 4.1.2. TaskStatus（任务状态）

{{ proto_to_table("TaskStatus") }}

<a id="TaskState"></a>

#### 4.1.3. TaskState（任务状态枚举）

{{ proto_enum_to_table("TaskState") }}

<a id="Message"></a>

#### 4.1.4. Message（消息）

{{ proto_to_table("Message") }}

<a id="Role"></a>

#### 4.1.5. Role（角色）

{{ proto_enum_to_table("Role") }}

<a id="Part"></a>

#### 4.1.6. Part（部件）

{{ proto_to_table("Part") }}

<a id="Artifact"></a>

#### 4.1.7. Artifact（制品）

{{ proto_to_table("Artifact") }}

### 4.2. 流式事件

<a id="TaskStatusUpdateEvent"></a>

#### 4.2.1. TaskStatusUpdateEvent（任务状态更新事件）

{{ proto_to_table("TaskStatusUpdateEvent") }}

<a id="TaskArtifactUpdateEvent"></a>

#### 4.2.2. TaskArtifactUpdateEvent（任务制品更新事件）

{{ proto_to_table("TaskArtifactUpdateEvent") }}

### 4.3. 推送通知对象

<a id="PushNotificationConfig"></a>

#### 4.3.1. PushNotificationConfig（推送通知配置）

{{ proto_to_table("PushNotificationConfig") }}

<a id="PushNotificationAuthenticationInfo"></a>

#### 4.3.2. AuthenticationInfo（身份验证信息）

{{ proto_to_table("AuthenticationInfo") }}

#### 4.3.3. 推送通知负载

当任务更新发生时，智能体会向配置的 Webhook URL 发送 HTTP POST 请求。负载使用与流式操作相同的[`StreamResponse`](#323-stream-response)格式，使推送通知能够传递与实时流相同的事件类型。

**请求格式：**

```http
POST {webhook_url}
Authorization: {authentication_scheme} {credentials}
Content-Type: application/a2a+json

{
  /* StreamResponse 对象 - 其中之一： */
  "task": { /* Task 对象 */ },
  "message": { /* Message 对象 */ },
  "statusUpdate": { /* TaskStatusUpdateEvent 对象 */ },
  "artifactUpdate": { /* TaskArtifactUpdateEvent 对象 */ }
}
```

**负载结构：**

Webhook 负载是一个[`StreamResponse`](#323-stream-response)对象，包含以下内容之一：

- **task**：带有当前任务状态的[`Task`](#411-task)对象
- **message**：包含消息响应的[`Message`](#414-message)对象
- **statusUpdate**：指示状态变更的[`TaskStatusUpdateEvent`](#421-taskstatusupdateevent)
- **artifactUpdate**：指示制品更新的[`TaskArtifactUpdateEvent`](#422-taskartifactupdateevent)

**身份验证：**

智能体必须按照[`PushNotificationConfig.authentication`](#432-authenticationinfo)字段中的指定，在请求头中包含身份验证凭证。格式遵循标准 HTTP 身份验证模式（Bearer 令牌、基本认证等）。

**客户端责任：**

- 客户端必须用 HTTP 2xx 状态码响应以确认成功接收
- 客户端应该幂等地处理通知，因为可能发生重复传递
- 客户端必须验证任务 ID 是否与预期任务匹配
- 客户端应实施适当的安全措施以验证通知来源

**服务器保证：**

- 智能体必须为每个配置的 Webhook 至少尝试一次传递
- 智能体可以实现指数退避的重试逻辑以应对失败的传递
- 智能体应为 Webhook 请求包含合理的超时时间（建议：10-30 秒）
- 在配置的连续失败次数后，智能体可以停止尝试传递

有关推送通知的详细安全指南，请参见[第 13.2 节：推送通知安全](#132-push-notification-security)。

### 4.4. 智能体发现对象

<a id="AgentCard"></a>

#### 4.4.1. AgentCard（智能体卡片）

{{ proto_to_table("AgentCard") }}

<a id="AgentProvider"></a>

#### 4.4.2. AgentProvider（智能体提供商）

{{ proto_to_table("AgentProvider") }}

<a id="AgentCapabilities"></a>

#### 4.4.3. AgentCapabilities（智能体能力）

{{ proto_to_table("AgentCapabilities") }}

<a id="AgentExtension"></a>

#### 4.4.4. AgentExtension（智能体扩展）

{{ proto_to_table("AgentExtension") }}

<a id="AgentSkill"></a>

#### 4.4.5. AgentSkill（智能体技能）

{{ proto_to_table("AgentSkill") }}

<a id="AgentInterface"></a>

#### 4.4.6. AgentInterface（智能体接口）

{{ proto_to_table("AgentInterface") }}

<a id="AgentCardSignature"></a>

#### 4.4.7. AgentCardSignature（智能体卡片签名）

{{ proto_to_table("AgentCardSignature") }}

### 4.5. 安全对象

<a id="Security"></a>
<a id="SecurityScheme"></a>

#### 4.5.1. SecurityScheme（安全方案）

{{ proto_to_table("SecurityScheme") }}

<a id="APIKeySecurityScheme"></a>

#### 4.5.2. APIKeySecurityScheme（API 密钥安全方案）

{{ proto_to_table("APIKeySecurityScheme") }}

<a id="HTTPAuthSecurityScheme"></a>

#### 4.5.3. HTTPAuthSecurityScheme（HTTP 认证安全方案）

{{ proto_to_table("HTTPAuthSecurityScheme") }}

<a id="OAuth2SecurityScheme"></a>

#### 4.5.4. OAuth2SecurityScheme（OAuth2 安全方案）

{{ proto_to_table("OAuth2SecurityScheme") }}

<a id="OpenIdConnectSecurityScheme"></a>

#### 4.5.5. OpenIdConnectSecurityScheme（OpenID Connect 安全方案）

{{ proto_to_table("OpenIdConnectSecurityScheme") }}

<a id="MutualTlsSecurityScheme"></a>

#### 4.5.6. MutualTlsSecurityScheme（双向 TLS 安全方案）

{{ proto_to_table("MutualTlsSecurityScheme") }}

<a id="OAuthFlows"></a>

#### 4.5.7. OAuthFlows（OAuth 流程）

{{ proto_to_table("OAuthFlows") }}

<a id="AuthorizationCodeOAuthFlow"></a>

#### 4.5.8. AuthorizationCodeOAuthFlow（授权码 OAuth 流程）

{{ proto_to_table("AuthorizationCodeOAuthFlow") }}

<a id="ClientCredentialsOAuthFlow"></a>

#### 4.5.9. ClientCredentialsOAuthFlow（客户端凭证 OAuth 流程）

{{ proto_to_table("ClientCredentialsOAuthFlow") }}

<a id="DeviceCodeOAuthFlow"></a>

#### 4.5.10. DeviceCodeOAuthFlow（设备码 OAuth 流程）

{{ proto_to_table("DeviceCodeOAuthFlow") }}

### 4.6. 扩展

A2A 协议支持扩展以提供超出核心规范的额外功能或数据，同时保持向后兼容性和互操作性。扩展允许智能体声明额外能力，如协议增强或供应商特定功能，与不支持特定扩展的客户端保持兼容性，通过实验性或领域特定功能实现创新而无需修改核心协议，并通过提供社区开发功能成为核心规范的一部分的途径来促进标准化。

#### 4.6.1. 扩展声明

智能体在其[`智能体卡片`](#441-agentcard)中使用 `extensions` 字段声明其支持的扩展，该字段包含[`AgentExtension`](#444-agentextension)对象的数组。

*示例：智能体在智能体卡片中声明扩展支持：*

```json
{
  "name": "研究助手智能体",
  "description": "用于学术研究和事实核查的 AI 智能体",
  "supportedInterfaces": [
    {
      "url": "https://research-agent.example.com/a2a/v1",
      "protocolBinding": "HTTP+JSON",
      "protocolVersion": "1.0",
    }
  ],
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "extensions": [
      {
        "uri": "https://standards.org/extensions/citations/v1",
        "description": "提供引用格式化和来源验证",
        "required": false
      },
      {
        "uri": "https://example.com/extensions/geolocation/v1",
        "description": "基于位置的搜索能力",
        "required": false
      }
    ]
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "academic-research",
      "name": "学术研究助手",
      "description": "提供带有引用和来源验证的研究协助",
      "tags": ["research", "citations", "academic"],
      "examples": ["查找关于气候变化的同行评审文章"],
      "inputModes": ["text/plain"],
      "outputModes": ["text/plain"]
    }
  ]
}
```

客户端通过绑定特定的机制（如 HTTP 头、gRPC 元数据或 JSON-RPC 请求参数）表示希望选择使用特定扩展，这些机制标识他们希望在交互中使用的扩展标识符。

*示例：HTTP 客户端使用头选择扩展：*

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token
A2A-Extensions: https://example.com/extensions/geolocation/v1,https://standards.org/extensions/citations/v1

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "查找我附近的餐厅"}],
    "extensions": ["https://example.com/extensions/geolocation/v1"],
    "metadata": {
      "https://example.com/extensions/geolocation/v1": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    }
  }
}
```

#### 4.6.2. 扩展点

扩展可以在几个明确定义的扩展点集成到 A2A 协议中：

**消息扩展：**

消息可以扩展，允许客户端提供与正在发送的消息相关的额外强类型上下文或参数，或允许 TaskStatus 消息包含关于任务进度的额外信息。

*示例：使用 extensions 和 metadata 数组的位置扩展：*

```json
{
  "role": "ROLE_USER",
  "parts": [
    {"text": "查找我附近的餐厅"}
  ],
  "extensions": ["https://example.com/extensions/geolocation/v1"],
  "metadata": {
    "https://example.com/extensions/geolocation/v1": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "accuracy": 10.0,
      "timestamp": "2025-10-21T14:30:00Z"
    }
  }
}
```

**制品扩展：**

制品可以包含扩展数据，以提供有关生成内容的强类型上下文或元数据。

*示例：带有研究来源引用扩展的制品：*

```json
{
  "artifactId": "research-summary-001",
  "name": "气候变化摘要",
  "parts": [
    {
      "text": "自工业革命前以来，全球温度已上升了 1.1°C，对天气模式和海平面产生了显著影响。"
    }
  ],
  "extensions": ["https://standards.org/extensions/citations/v1"],
  "metadata": {
    "https://standards.org/extensions/citations/v1": {
      "sources": [
        {
          "title": "全球温度异常 - 2023 年报告",
          "authors": ["Smith, J.", "Johnson, M."],
          "url": "https://climate.gov/reports/2023-temperature",
          "accessDate": "2025-10-21",
          "relevantText": "全球温度已上升了 1.1°C"
        }
      ]
    }
  }
}
```

#### 4.6.3. 扩展版本和兼容性

扩展**应该**在其 URI 标识符中包含版本信息。这允许客户端和智能体在交互期间协商兼容的扩展版本。对扩展的破坏性变更**必须**创建新的 URI。

如果客户端请求的扩展版本是智能体不支持的，智能体**应该**忽略该扩展的该次交互并在没有它的情况下继续，除非该扩展在智能体卡片中标记为 `required`，在这种情况下智能体**必须**返回指示不支持扩展的错误。它**不得**自动回退到该扩展的先前版本。

## 5. 协议绑定要求和互操作性

### 5.1. 功能等效要求

当智能体支持多个协议时，所有支持的协议**必须**：

- **相同的功能**：提供相同的操作和能力集合
- **一致的行为**：为相同请求返回语义等效的结果
- **相同的错误处理**：使用适当的协议特定代码一致地映射错误
- **等效的身份验证**：支持智能体卡片中声明的相同身份验证方案

### 5.2. 协议选择和协商

- **智能体声明**：智能体**必须**在其智能体卡片中声明所有支持的协议
- **客户端选择**：客户端**可以**选择智能体声明的任何协议
- **回退行为**：客户端**应该**为替代协议实现回退逻辑

### 5.3. 方法映射参考

| 功能                           | JSON-RPC 方法                    | gRPC 方法                        | REST 端点                                               |
| :------------------------------ | :--------------------------------- | :--------------------------------- | :------------------------------------------------------ |
| 发送消息                        | `SendMessage`                      | `SendMessage`                      | `POST /message:send`                                    |
| 发送流式消息                    | `SendStreamingMessage`             | `SendStreamingMessage`             | `POST /message:stream`                                  |
| 获取任务                        | `GetTask`                          | `GetTask`                          | `GET /tasks/{id}`                                       |
| 列出任务                        | `ListTasks`                        | `ListTasks`                        | `GET /tasks`                                            |
| 取消任务                        | `CancelTask`                       | `CancelTask`                       | `POST /tasks/{id}:cancel`                               |
| 订阅任务                        | `SubscribeToTask`                  | `SubscribeToTask`                  | `POST /tasks/{id}:subscribe`                            |
| 创建推送通知配置                | `CreateTaskPushNotificationConfig` | `CreateTaskPushNotificationConfig` | `POST /tasks/{id}/pushNotificationConfigs`              |
| 获取推送通知配置                | `GetTaskPushNotificationConfig`    | `GetTaskPushNotificationConfig`    | `GET /tasks/{id}/pushNotificationConfigs/{configId}`    |
| 列出推送通知配置                | `ListTaskPushNotificationConfigs`  | `ListTaskPushNotificationConfigs`  | `GET /tasks/{id}/pushNotificationConfigs`               |
| 删除推送通知配置                | `DeleteTaskPushNotificationConfig` | `DeleteTaskPushNotificationConfig` | `DELETE /tasks/{id}/pushNotificationConfigs/{configId}` |
| 获取扩展智能体卡片              | `GetExtendedAgentCard`             | `GetExtendedAgentCard`             | `GET /extendedAgentCard`                                |

### 5.4. 错误代码映射

[第 3.3.2 节](#332-error-handling)中定义的所有 A2A 特定错误**必须**映射到绑定特定的错误表示。下表提供了每个标准协议绑定的规范映射：

| A2A 错误类型                        | JSON-RPC 代码 | gRPC 状态           | HTTP 状态                 |
| :------------------------------------ | :------------ | :-------------------- | :-------------------------- |
| `TaskNotFoundError`                   | `-32001`      | `NOT_FOUND`           | `404 Not Found`             |
| `TaskNotCancelableError`              | `-32002`      | `FAILED_PRECONDITION` | `400 Bad Request`           |
| `PushNotificationNotSupportedError`   | `-32003`      | `FAILED_PRECONDITION` | `400 Bad Request`           |
| `UnsupportedOperationError`           | `-32004`      | `FAILED_PRECONDITION` | `400 Bad Request`           |
| `ContentTypeNotSupportedError`        | `-32005`      | `INVALID_ARGUMENT`    | `400 Bad Request`           |
| `InvalidAgentResponseError`           | `-32006`      | `INTERNAL`            | `500 Internal Server Error` |
| `ExtendedAgentCardNotConfiguredError` | `-32007`      | `FAILED_PRECONDITION` | `400 Bad Request`           |
| `ExtensionSupportRequiredError`       | `-32008`      | `FAILED_PRECONDITION` | `400 Bad Request`           |
| `VersionNotSupportedError`            | `-32009`      | `FAILED_PRECONDITION` | `400 Bad Request`           |

**自定义绑定要求：**

自定义协议绑定**必须**定义等效的错误代码映射，保留每种 A2A 错误类型的语义含义。绑定规范**应该**提供类似的映射表，显示每种 A2A 错误类型在自定义绑定的原生错误格式中如何表示。

有关绑定特定的错误结构和示例，请参见：

- [JSON-RPC 错误处理](#95-error-handling)
- [gRPC 错误处理](#106-error-handling)
- [HTTP/REST 错误处理](#116-error-handling)

### 5.5. JSON 字段命名约定

A2A 协议数据模型的所有 JSON 序列化**必须**对字段名使用 **camelCase** 命名，而不是 Protocol Buffer 定义中使用的 snake_case 约定。

**命名约定：**

- Protocol Buffer 字段：`protocol_version` → JSON 字段：`protocolVersion`
- Protocol Buffer 字段：`context_id` → JSON 字段：`contextId`
- Protocol Buffer 字段：`default_input_modes` → JSON 字段：`defaultInputModes`
- Protocol Buffer 字段：`push_notification_config` → JSON 字段：`pushNotificationConfig`

**枚举值：**

- 枚举值**必须**根据 [ProtoJSON 规范](https://protobuf.dev/programming-guides/json/)表示，该规范将枚举序列化为其**在 Protocol Buffer 定义中定义的**字符串名称（通常为 SCREAMING_SNAKE_CASE）。

**示例：**

- Protocol Buffer 枚举：`TASK_STATE_INPUT_REQUIRED` → JSON 值：`"TASK_STATE_INPUT_REQUIRED"`
- Protocol Buffer 枚举：`ROLE_USER` → JSON 值：`"ROLE_USER"`

**注意：** 这遵循 [ADR-001](../adrs/adr-001-protojson-serialization.md) 中采用的 ProtoJSON 规范。

### 5.6. 数据类型约定

本节记录了 A2A 协议中使用的常见数据类型的约定，特别是它们适用于协议绑定的方式。

#### 5.6.1. 时间戳

A2A 协议在 Protocol Buffer 定义中使用 [`google.protobuf.Timestamp`](https://protobuf.dev/reference/protobuf/google.protobuf/#timestamp) 作为所有时间戳字段。当序列化为 JSON 时（在 JSON-RPC、HTTP/REST 或其他基于 JSON 的绑定中），这些时间戳**必须**表示为 UTC 时区的 ISO 8601 格式化字符串。

**格式要求：**

- **格式：** ISO 8601 组合日期和时间表示
- **时区：** UTC（由 'Z' 后缀表示）
- **精度：** 在可用的情况下**应该**使用毫秒精度
- **模式：** `YYYY-MM-DDTHH:mm:ss.sssZ`

**示例：**

```json
{
  "timestamp": "2025-10-28T10:30:00.000Z",
  "createdAt": "2025-10-28T14:25:33.142Z",
  "lastModified": "2025-10-31T17:45:22.891Z"
}
```

**实现说明：**

- Protocol Buffer 的 `google.protobuf.Timestamp` 将时间表示为自 Unix 纪元（1970 年 1 月 1 日 00:00:00 UTC）以来的秒数加纳秒
- 使用标准 Protocol Buffer JSON 编码时，JSON 序列化会自动将其转换为 ISO 8601 格式
- 客户端和服务器**必须**正确解析和生成 ISO 8601 时间戳
- 当毫秒精度不可用时，秒的小数部分**可以**省略或补零
- 时间戳**不得**包含除 'Z' 以外的时区偏移（所有时间都是 UTC）

### 5.7. 字段存在性和可选性

`specification/a2a.proto` 中的 Protocol Buffer 定义使用 [`google.api.field_behavior`](https://github.com/googleapis/googleapis/blob/master/google/api/field_behavior.proto) 注释来指示字段是否为 `REQUIRED`。这些注释既作为文档，也作为实现的验证提示。

**必填字段：**

标记为 `[(google.api.field_behavior) = REQUIRED]` 的字段表示该字段**必须**存在于有效的消息中并设置值。实现**应该**验证这些要求，并拒绝缺少必填字段的消息。标记为必填的数组**必须**包含至少一个元素。

**可选字段存在性：**

Protocol Buffer 的 `optional` 关键字用于区分字段是显式设置还是省略。这种区别对两种场景至关重要：

1. **显式默认值：** 规范中的某些字段定义了与 Protocol Buffer 隐式默认值不同的默认值。当字段未显式提供时，实现应应用默认值。

2. **智能体卡片规范化：** 在创建智能体卡片的加密签名时，需要生成规范的 JSON 表示。`optional` 关键字使实现能够区分哪些字段被显式设置（应包含在规范形式中）以及哪些字段被省略（应从规范化中排除）。这确保了智能体卡片可以被重建以精确匹配其签名。

**未识别字段：**

实现**应该**忽略消息中未识别的字段，以便在协议演变时进行向前兼容。

### 5.8. 自定义绑定标识

自定义协议绑定**应该**通过 URI 标识。使用 URI 作为标识符可在所有实现者之间提供全局唯一标识。

智能体卡片 `supportedInterfaces` 条目中的 `protocolBinding` 字段**应该**是一个 URI：

```json
{
  "supportedInterfaces": [
    {
      "url": "wss://agent.example.com/a2a/websocket",
      "protocolBinding": "https://example.com/bindings/websocket/v1",
      "protocolVersion": "1.0"
    }
  ]
}
```

当对绑定引入破坏性变更时，**必须**使用新的 URI，以便客户端可以区分不兼容的版本：

```text
https://example.com/bindings/websocket/v1  →  https://example.com/bindings/websocket/v2
```

## 6. 常见工作流与示例

本节提供了不同绑定之间常见 A2A 交互的说明性示例。

### 6.1. 基本任务执行

**场景：** 客户端提问并收到已完成的任务响应。

**请求：**

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "今天天气怎么样？"}],
    "messageId": "msg-uuid"
  }
}
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "task": {
    "id": "task-uuid",
    "contextId": "context-uuid",
    "status": {"state": "TASK_STATE_COMPLETED"},
    "artifacts": [{
      "artifactId": "artifact-uuid",
      "name": "天气预报",
      "parts": [{"text": "今天晴天，最高温度 75°F"}]
    }]
  }
}
```

### 6.2. 流式任务执行

**场景：** 客户端请求一个带有实时更新的长时间运行任务。

**请求：**

```http
POST /message:stream HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "写一份关于气候变化的详细报告"}],
    "messageId": "msg-uuid"
  }
}
```

**SSE 响应流：**

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"task": {"id": "task-uuid", "status": {"state": "TASK_STATE_WORKING"}}}

data: {"artifactUpdate": {"taskId": "task-uuid", "artifact": {"parts": [{"text": "# 气候变化报告\n\n"}]}}}

data: {"statusUpdate": {"taskId": "task-uuid", "status": {"state": "TASK_STATE_COMPLETED"}}}
```

### 6.3. 多轮交互

**场景：** 智能体需要额外输入才能完成任务。

**初始请求：**

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "帮我订一张机票"}],
    "messageId": "msg-1"
  }
}
```

**响应（需要输入）：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "task": {
    "id": "task-uuid",
    "status": {
      "state": "TASK_STATE_INPUT_REQUIRED",
      "message": {
        "role": "ROLE_AGENT",
        "parts": [{"text": "我需要更多细节。您从哪儿飞往哪儿？"}]
      }
    }
  }
}
```

**后续请求：**

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "taskId": "task-uuid",
    "role": "ROLE_USER",
    "parts": [{"text": "从旧金山到纽约"}],
    "messageId": "msg-2"
  }
}
```

### 6.4. 版本协商错误

**场景：** 客户端请求不支持的协议版本。

**请求：**

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token
A2A-Version: 0.5

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "你好"}],
    "messageId": "msg-uuid"
  }
}
```

**响应：**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://a2a-protocol.org/errors/version-not-supported",
  "title": "协议版本不受支持",
  "status": 400,
  "detail": "请求的 A2A 协议版本 0.5 不受此智能体支持",
  "supportedVersions": ["1.0"]
}
```

### 6.5. 任务列表和管理

**场景：** 客户端希望查看来自特定上下文的所有任务或具有特定状态的所有任务。

#### 请求：来自特定上下文的所有任务

**请求：**

```http
GET /tasks?contextId=c295ea44-7543-4f78-b524-7a38915ad6e4&pageSize=10&historyLength=3 HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "tasks": [
    {
      "id": "3f36680c-7f37-4a5f-945e-d78981fafd36",
      "contextId": "c295ea44-7543-4f78-b524-7a38915ad6e4",
      "status": {
        "state": "TASK_STATE_COMPLETED",
        "timestamp": "2024-03-15T10:15:00Z"
      }
    }
  ],
  "totalSize": 5,
  "pageSize": 10,
  "nextPageToken": ""
}
```

#### 请求：所有上下文中所有正在工作的任务

**请求：**

```http
GET /tasks?status=TASK_STATE_WORKING&pageSize=20 HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "tasks": [
    {
      "id": "789abc-def0-1234-5678-9abcdef01234",
      "contextId": "another-context-id",
      "status": {
        "state": "TASK_STATE_WORKING",
        "message": {
          "role": "ROLE_AGENT",
          "parts": [
            {
              "text": "正在处理您的文档分析..."
            }
          ],
          "messageId": "msg-status-update"
        },
        "timestamp": "2024-03-15T10:20:00Z"
      }
    }
  ],
  "totalSize": 1,
  "pageSize": 20,
  "nextPageToken": ""
}
```

#### 分页示例

**请求：**

```http
GET /tasks?contextId=c295ea44-7543-4f78-b524-7a38915ad6e4&pageSize=10&pageToken=base64-encoded-cursor-token HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "tasks": [
    /* ... 更多任务 */
  ],
  "totalSize": 15,
  "pageSize": 10,
  "nextPageToken": "base64-encoded-next-cursor-token"
}
```

#### 验证错误示例

**请求：**

```http
GET /tasks?pageSize=150&historyLength=-5&status=TASK_STATE_RUNNING HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应：**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "status": 400,
  "detail": "无效参数",
  "errors": [
    {
      "field": "pageSize",
      "message": "必须在 1 到 100 之间（含），得到 150"
    },
    {
      "field": "historyLength",
      "message": "必须为非负整数，得到 -5"
    },
    {
      "field": "status",
      "message": "无效的状态值 'TASK_STATE_RUNNING'。必须是以下之一：TASK_STATE_SUBMITTED, TASK_STATE_WORKING, TASK_STATE_COMPLETED, TASK_STATE_FAILED, TASK_STATE_CANCELED, TASK_STATE_REJECTED, TASK_STATE_INPUT_REQUIRED, TASK_STATE_AUTH_REQUIRED"
    }
  ]
}
```

### 6.6. 推送通知设置和使用

**场景：** 客户端请求长时间运行报告生成，并希望在完成时通过 Webhook 收到通知。

**带有推送通知配置的初始请求：**

```http
POST /message:send HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "为我生成一份详细的季度财务报告"}],
    "messageId": "msg-uuid"
  },
  "config": {
    "pushNotificationConfig": {
      "url": "https://client-callback.example.com/webhook/report-123",
      "authentication": {
        "scheme": "Bearer",
        "credentials": "webhook-token-abc"
      }
    }
  }
}
```

**初始响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "task": {
    "id": "task-report-456",
    "status": {"state": "TASK_STATE_WORKING"}
  }
}
```

**稍后收到的推送通知（状态更新）：**

```http
POST /webhook/report-123 HTTP/1.1
Host: client-callback.example.com
Authorization: Bearer webhook-token-abc
Content-Type: application/a2a+json

{
  "statusUpdate": {
    "taskId": "task-report-456",
    "status": {
      "state": "TASK_STATE_COMPLETED",
      "timestamp": "2025-10-28T14:25:33.142Z"
    }
  }
}
```

**客户端获取最终任务：**

```http
GET /tasks/task-report-456 HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: application/a2a+json

{
  "id": "task-report-456",
  "status": {"state": "TASK_STATE_COMPLETED"},
  "artifacts": [{
    "artifactId": "artifact-financial-report-001",
    "name": "季度财务报告 Q3 2025",
    "parts": [{"text": "...完整的报告内容..."}]
  }]
}
```

### 6.7. 错误场景

**场景：** 客户端尝试获取不存在的任务。

**请求：**

```http
GET /tasks/task-nonexistent HTTP/1.1
Host: agent.example.com
Authorization: Bearer token
```

**响应（任务未找到）：**

```http
HTTP/1.1 404 Not Found
Content-Type: application/a2a+json

{
  "error": {
    "code": 404,
    "message": "任务未找到：task-nonexistent",
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

**场景：** 客户端尝试在不支持流式传输的智能体上使用流式操作。

**请求：**

```http
POST /message:stream HTTP/1.1
Host: agent.example.com
Content-Type: application/a2a+json
Authorization: Bearer token

{
  "message": {
    "role": "ROLE_USER",
    "parts": [{"text": "你好"}],
    "messageId": "msg-uuid"
  }
}
```

**响应（不支持的操作）：**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/a2a+json

{
  "error": {
    "code": 400,
    "message": "此智能体不支持流式传输",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "UNSUPPORTED_OPERATION",
        "domain": "a2a-protocol.org"
      }
    ]
  }
}
```

## 7. JSON-RPC 协议绑定

A2A 协议的 JSON-RPC 绑定使用 [JSON-RPC 2.0 规范](https://www.jsonrpc.org/specification)作为消息格式，通过 HTTP 传输。

### 7.1. 传输

JSON-RPC 绑定**必须**通过 HTTP/HTTPS 传输请求。所有请求**必须**是 HTTP POST 请求，内容类型为 `application/json`。

### 7.2. 端点

JSON-RPC 端点**必须**在智能体卡片的 `supportedInterfaces` 中声明。

### 7.3. 方法调用

所有 A2A 操作**必须**作为 JSON-RPC 方法调用发送。请求**必须**遵循 JSON-RPC 2.0 规范格式。

**通用请求格式：**

```json
{
  "jsonrpc": "2.0",
  "id": "string-or-number",
  "method": "MethodName",
  "params": {
    ...
  }
}
```

### 7.4. 响应

成功响应**必须**使用 JSON-RPC 2.0 结果格式。

### 7.5. 错误处理

JSON-RPC 错误响应**必须**遵循 JSON-RPC 2.0 错误格式，使用[第 5.4 节](#54-error-code-mappings)中定义的错误代码，并在 `data` 字段中包含 `google.rpc.Status` 兼容的错误详情。

### 7.6. 请求示例

**发送消息：**

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "SendMessage",
  "params": {
    "message": {
      "role": "ROLE_USER",
      "parts": [{"text": "今天天气怎么样？"}],
      "messageId": "msg-001"
    }
  }
}
```

## 8. gRPC 协议绑定

A2A 的 gRPC 绑定在 Protocol Buffer 文件 `spec/a2a.proto` 中定义。服务定义、RPC 方法和消息类型在该文件中完全指定。

### 8.1. 服务定义

gRPC 服务在 `spec/a2a.proto` 中定义如下：

```protobuf
service A2AService {
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
  rpc SendStreamingMessage(SendMessageRequest) returns (stream StreamResponse);
  rpc GetTask(GetTaskRequest) returns (Task);
  rpc ListTasks(ListTasksRequest) returns (ListTasksResponse);
  rpc CancelTask(CancelTaskRequest) returns (Task);
  rpc SubscribeToTask(SubscribeToTaskRequest) returns (stream StreamResponse);
  rpc CreateTaskPushNotificationConfig(TaskPushNotificationConfig) returns (PushNotificationConfig);
  rpc GetTaskPushNotificationConfig(GetTaskPushNotificationConfigRequest) returns (PushNotificationConfig);
  rpc ListTaskPushNotificationConfigs(ListTaskPushNotificationConfigsRequest) returns (ListTaskPushNotificationConfigsResponse);
  rpc DeleteTaskPushNotificationConfig(DeleteTaskPushNotificationConfigRequest) returns (Empty);
  rpc GetExtendedAgentCard(GetExtendedAgentCardRequest) returns (AgentCard);
}
```

### 8.2. 流式传输
gRPC 绑定使用 gRPC 服务器端流式传输来实现 A2A 流式操作。

### 8.3. 错误处理
gRPC 错误使用标准的 gRPC 状态码，并结合 `google.rpc.Status` 详情中的 A2A 特定错误信息。

## 9. HTTP+JSON/REST 协议绑定

HTTP+JSON/REST 绑定将 A2A 操作映射到 RESTful HTTP 端点和 JSON 请求/响应体。

### 9.1. 端点映射

[第 5.3 节](#53-method-mapping-reference)中的表格定义了完整的端点映射。

### 9.2. 内容类型

请求**必须**使用 `Content-Type: application/json`。成功响应**必须**使用 `Content-Type: application/json`。流式响应**必须**使用 `Content-Type: text/event-stream`。

### 9.3. 错误处理

HTTP 错误响应**必须**使用适当的 HTTP 状态码，并带有描述错误的 JSON 体。

## 10. 安全考虑

### 10.1. 传输安全

所有生产 A2A 通信**必须**使用 HTTPS。

### 10.2. 身份验证

智能体卡片声明支持的[身份验证方案](#45-security-objects)。客户端**必须**在请求头中提供适当的凭证。

### 10.3. 授权

智能体**应该**在允许访问任务或执行操作之前实施授权检查。

### 10.4. 智能体卡片签名

智能体卡片可以使用 JWS（[RFC 7515](https://tools.ietf.org/html/rfc7515)）进行签名，以提供来源和完整性的加密验证。签名使用 [RFC 8785](https://tools.ietf.org/html/rfc8785) 中定义的 JSON 规范化方案（JCS）计算。

### 10.5. 扩展安全

实现扩展的智能体**必须**确保扩展不会绕过核心安全控制。扩展引入的新方法**必须**受到与核心方法相同的身份验证和授权检查。

### 10.6. 推送通知安全

推送通知**必须**使用 HTTPS 发送到客户端提供的 Webhook URL。智能体**必须**按照推送通知配置中的指定对客户端进行身份验证。客户端**必须**验证传入通知的来源和完整性。

## 11. 扩展智能体卡片访问控制

### 11.1. 授权

客户端**必须**使用智能体卡片 `securitySchemes` 中声明的方案对获取扩展智能体卡片的请求进行身份验证。

### 11.2. 缓存

检索扩展智能体卡片的客户端**应该**在会话期间或直到卡片版本变更之前缓存它。

## 12. 版本控制与兼容性

### 12.1. 协议版本

A2A 协议使用语义化版本控制，其中主版本号和次版本号标识协议兼容性级别。补丁版本用于规范更正，不影响互操作性。

### 12.2. 向后兼容性

同一主版本内的次版本升级**应该**保持向后兼容性。主版本升级可能引入破坏性变更。

### 12.3. 接口版本化

每个 `AgentInterface` 条目通过其 `protocolVersion` 字段指定自己的协议版本。智能体可以同时支持多个协议版本。

## 13. 参考文献

- [JSON-RPC 2.0 规范](https://www.jsonrpc.org/specification)
- [Protocol Buffers](https://protobuf.dev/)
- [gRPC](https://grpc.io/)
- [RFC 2119：需求语言](https://tools.ietf.org/html/rfc2119)
- [RFC 7515：JSON Web 签名](https://tools.ietf.org/html/rfc7515)
- [RFC 8615：Well-Known URIs](https://datatracker.ietf.org/doc/html/rfc8615)
- [RFC 8785：JSON 规范化方案](https://tools.ietf.org/html/rfc8785)
- [OpenAPI 规范](https://spec.openapis.org/oas/v3.0.3)
- [OAuth 2.0](https://oauth.net/2/)
- [OpenID Connect](https://openid.net/connect/)
