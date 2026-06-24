// ============================================================================
// A2A Protocol v1.0 — 核心类型定义与 Zod 验证模式
// 基于 Agent2Agent (A2A) Protocol Specification v1.0 规范
//
// 文件结构：
//   第 1 部分 — 枚举常量（TaskState、Role、A2AErrorType、ServiceParameter）
//   第 2 部分 — TypeScript 接口（数据对象、请求/响应、流事件、安全模型）
//   第 3 部分 — Zod 运行时验证模式（JSON Schema 等价物）
//   第 4 部分 — 工具函数（便捷创建消息等）
// ============================================================================

import { z } from "zod";

// ============================================================================
// 第 1 部分 — 枚举常量
// ============================================================================

/**
 * 任务状态枚举 (TaskState)
 *
 * 对应规范 §4.1.3 TaskState
 * v1.0 重大变更：值从 kebab-case 改为 SCREAMING_SNAKE_CASE
 *
 * 状态流转：
 *   SUBMITTED → WORKING → COMPLETED（正常完成）
 *                       → FAILED（执行失败）
 *                       → CANCELED（被取消）
 *                       → REJECTED（被拒绝）
 *                       → INPUT_REQUIRED（等待用户输入）
 *                       → AUTH_REQUIRED（等待身份认证）
 */
export enum TaskState {
  /** 任务已提交，等待处理 */
  TASK_STATE_SUBMITTED = "TASK_STATE_SUBMITTED",
  /** 任务正在执行中 */
  TASK_STATE_WORKING = "TASK_STATE_WORKING",
  /** 任务已完成，产出最终制品 */
  TASK_STATE_COMPLETED = "TASK_STATE_COMPLETED",
  /** 任务执行失败 */
  TASK_STATE_FAILED = "TASK_STATE_FAILED",
  /** 任务已被取消 */
  TASK_STATE_CANCELED = "TASK_STATE_CANCELED",
  /** 任务被智能体拒绝处理 */
  TASK_STATE_REJECTED = "TASK_STATE_REJECTED",
  /** 任务需要用户提供更多输入才能继续 */
  TASK_STATE_INPUT_REQUIRED = "TASK_STATE_INPUT_REQUIRED",
  /** 任务需要额外的身份认证才能继续 */
  TASK_STATE_AUTH_REQUIRED = "TASK_STATE_AUTH_REQUIRED",
}

/**
 * 消息角色枚举 (Role)
 *
 * 对应规范 §4.1.5 Role
 * v1.0 重大变更：值从小写改为 SCREAMING_SNAKE_CASE
 */
export enum Role {
  /** 用户角色 — 消息来自终端用户或客户端智能体 */
  ROLE_USER = "ROLE_USER",
  /** 智能体角色 — 消息来自服务端智能体 */
  ROLE_AGENT = "ROLE_AGENT",
}

/**
 * A2A 协议错误类型枚举
 *
 * 对应规范 §3.3.2 A2A-Specific Errors
 * 每种错误类型对应唯一的 JSON-RPC 错误码（参见 §5.4）
 */
export enum A2AErrorType {
  /** 指定的任务 ID 不存在或不可访问（JSON-RPC 码: -32001） */
  TASK_NOT_FOUND = "TaskNotFoundError",
  /** 任务不处于可取消状态（JSON-RPC 码: -32002） */
  TASK_NOT_CANCELABLE = "TaskNotCancelableError",
  /** 智能体不支持推送通知（JSON-RPC 码: -32003） */
  PUSH_NOTIFICATION_NOT_SUPPORTED = "PushNotificationNotSupportedError",
  /** 请求的操作不被智能体支持（JSON-RPC 码: -32004） */
  UNSUPPORTED_OPERATION = "UnsupportedOperationError",
  /** 消息中包含不受支持的媒体类型（JSON-RPC 码: -32005） */
  CONTENT_TYPE_NOT_SUPPORTED = "ContentTypeNotSupportedError",
  /** 智能体响应不符合协议规范（JSON-RPC 码: -32006） */
  INVALID_AGENT_RESPONSE = "InvalidAgentResponseError",
  /** 扩展智能体卡片未配置（JSON-RPC 码: -32007） */
  EXTENDED_AGENT_CARD_NOT_CONFIGURED = "ExtendedAgentCardNotConfiguredError",
  /** 客户端未声明对必需扩展的支持（JSON-RPC 码: -32008） */
  EXTENSION_SUPPORT_REQUIRED = "ExtensionSupportRequiredError",
  /** 请求的协议版本不被支持（JSON-RPC 码: -32009） */
  VERSION_NOT_SUPPORTED = "VersionNotSupportedError",
}

/**
 * 标准 A2A 服务参数名称
 *
 * 对应规范 §3.2.6 Service Parameters
 * 服务参数在 HTTP 绑定中以请求头传输，gRPC 中以元数据传输
 */
export enum ServiceParameter {
  /** 客户端希望激活的扩展 URI 列表（逗号分隔） */
  A2A_EXTENSIONS = "A2A-Extensions",
  /** 客户端使用的 A2A 协议版本（如 "1.0"） */
  A2A_VERSION = "A2A-Version",
}

// ============================================================================
// 第 2 部分 — TypeScript 接口
// ============================================================================

// --------------------------------------------------------------------------
// 2.1 核心数据对象 (Core Objects) — 规范 §4.1
// --------------------------------------------------------------------------

/**
 * 部件 (Part) — 消息和制品中的最小内容单元
 *
 * 对应规范 §4.1.6 Part
 *
 * v1.0 重大变更：移除了 TextPart / FilePart / DataPart 的独立类型，
 * 改为统一的 Part 结构，使用 oneof 模式通过字段存在性判断内容类型。
 *
 * 内容类型由恰好存在以下字段之一决定：
 * - `text` — 纯文本内容
 * - `raw`  — 内联二进制数据（JSON 中 base64 编码）
 * - `url`  — 外部文件引用 URL
 * - `data` — 结构化 JSON 数据（适用于机器可读数据）
 */
export interface Part {
  /** 【文本内容】纯文本字符串，设置此字段表示部件为文本类型 */
  text?: string;
  /** 【二进制数据】base64 编码的内联文件数据 */
  raw?: string;
  /** 【文件引用】指向外部文件内容的 URI */
  url?: string;
  /** 【结构化数据】任意 JSON 值（对象、数组等），适用于机器可读数据 */
  data?: Record<string, unknown>;
  /** 内容的 MIME 类型，如 "text/plain"、"image/png"、"application/json" */
  mediaType?: string;
  /** 文件或内容的可选显示名称 */
  filename?: string;
  /** 附加的元数据键值对，扩展可通过此字段传递自定义数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 消息 (Message) — 客户端与智能体之间的单轮通信
 *
 * 对应规范 §4.1.4 Message
 *
 * 消息在 A2A 协议中扮演多重角色：
 * - 任务启动：客户端发送消息以发起新任务
 * - 澄清请求：智能体在启动任务前请求更多信息
 * - 状态消息：智能体附加消息到状态更新事件中
 * - 后续交互：客户端为进行中的任务提供更多输入
 *
 * 注意：消息不应被用于传递任务输出；输出应使用 Artifact（制品）。
 */
export interface Message {
  /** 消息发送者的角色（用户或智能体） */
  role: Role;
  /** 消息内容部件列表，至少包含一个 Part */
  parts: Part[];
  /** 消息的唯一标识符，可用于幂等性检测 */
  messageId: string;
  /** 所属上下文的 ID，用于逻辑上分组相关消息和任务 */
  contextId?: string;
  /** 关联的任务 ID，表示此消息属于某个特定任务 */
  taskId?: string;
  /** 引用的相关任务 ID 列表，用于后续操作中指示关联关系 */
  referenceTaskIds?: string[];
  /** 此消息激活的扩展 URI 列表，v1.0 新增 */
  extensions?: string[];
  /** 附加的元数据键值对 */
  metadata?: Record<string, unknown>;
}

/**
 * 任务状态 (TaskStatus) — 任务在当前时刻的快照信息
 *
 * 对应规范 §4.1.2 TaskStatus
 */
export interface TaskStatus {
  /** 当前状态值 */
  state: TaskState;
  /** 状态变更的时间戳，ISO 8601 UTC 格式（毫秒精度），如 "2024-03-15T10:15:00.000Z" */
  timestamp?: string;
  /** 附加的状态消息，智能体可用此字段向客户端传递信息 */
  message?: Message;
  /** 状态码，可用于携带额外的机器可读状态信息 */
  code?: number;
}

/**
 * 任务 (Task) — A2A 协议中管理的基本工作单元
 *
 * 对应规范 §4.1.1 Task
 *
 * 任务是有状态的工作单元，通过唯一 ID 标识，经历已定义的生命周期。
 * 生命周期: SUBMITTED → WORKING → COMPLETED / FAILED / CANCELED
 *
 * 任务不可变性原则（规范 §3.4）：
 * 一旦任务达到终端状态，不能重新启动。
 * 任何后续交互必须在同一 contextId 内启动新任务。
 */
export interface Task {
  /** 任务的全局唯一标识符（UUID） */
  id: string;
  /** 所属上下文的 ID，用于将多个相关任务逻辑分组 */
  contextId?: string;
  /** 任务的当前状态 */
  status: TaskStatus;
  /** 任务产出的制品列表 */
  artifacts?: Artifact[];
  /** 任务执行过程中的消息历史 */
  history?: Message[];
  /** 应用于此任务的扩展 URI 列表 */
  extensions?: string[];
  /** 附加的元数据 */
  metadata?: Record<string, unknown>;
  /** 任务创建时间戳，v1.0 新增 */
  createdAt?: string;
  /** 任务最后修改时间戳，v1.0 新增 */
  lastModified?: string;
}

/**
 * 制品 (Artifact) — 智能体执行任务产生的有形输出
 *
 * 对应规范 §4.1.7 Artifact
 *
 * 制品是智能体工作的具体可交付成果，
 * 与 Message 的区别在于：Message 是通信，Artifact 是产出。
 *
 * 制品可以包含文档、图像、结构化数据等，
 * 并支持分块流式传输（通过 lastChunk 和 append 标志）。
 */
export interface Artifact {
  /** 制品的全局唯一标识符 */
  artifactId: string;
  /** 制品的人类可读名称 */
  name: string;
  /** 制品的描述信息 */
  description?: string;
  /** 制品包含的内容部件 */
  parts: Part[];
  /** 应用于此制品的扩展 URI 列表，v1.0 新增 */
  extensions?: string[];
  /** 附加的元数据 */
  metadata?: Record<string, unknown>;
  /** 制品在任务制品数组中的序号（用于流式更新） */
  index?: number;
  /** 是否为最后一个分块（流式传输中使用） */
  lastChunk?: boolean;
  /** 是否为追加到已有制品的新分块（流式传输中使用） */
  append?: boolean;
}

// --------------------------------------------------------------------------
// 2.2 流式事件 (Streaming Events) — 规范 §4.2 / §3.2.3
// --------------------------------------------------------------------------

/**
 * 任务状态更新事件 — 当任务生命周期状态发生变化时触发
 *
 * 对应规范 §4.2.1 TaskStatusUpdateEvent
 * v1.0 变更：移除了 kind 鉴别器和 final 字段，
 * 流关闭本身表示任务终止。
 */
export interface TaskStatusUpdateEvent {
  /** 关联的任务 ID */
  taskId: string;
  /** 所属上下文 ID */
  contextId?: string;
  /** 更新后的任务状态 */
  status: TaskStatus;
}

/**
 * 任务制品更新事件 — 当任务产出新制品或更新已有制品时触发
 *
 * 对应规范 §4.2.2 TaskArtifactUpdateEvent
 * v1.0 变更：移除了 kind 鉴别器，新增 index 字段。
 */
export interface TaskArtifactUpdateEvent {
  /** 关联的任务 ID */
  taskId: string;
  /** 所属上下文 ID */
  contextId?: string;
  /** 更新/新增的制品 */
  artifact: Artifact;
  /** 制品在任务 artifacts 数组中的位置索引 */
  index?: number;
}

/**
 * 流响应 (StreamResponse) — 流式端点的统一响应包装
 *
 * 对应规范 §3.2.3 Stream Response
 *
 * 流式端点通过此包装器在单个响应流中返回不同类型的事件，
 * 通过 JSON 成员名称区分事件类型（而非 v0.3.0 的 kind 字段）。
 */
export interface StreamResponse {
  /** 完整的任务对象（流中第一个事件通常是此类型） */
  task?: Task;
  /** 直接消息响应 */
  message?: Message;
  /** 任务状态更新事件 */
  statusUpdate?: TaskStatusUpdateEvent;
  /** 任务制品更新事件 */
  artifactUpdate?: TaskArtifactUpdateEvent;
}

// --------------------------------------------------------------------------
// 2.3 推送通知对象 (Push Notification Objects) — 规范 §4.3
// --------------------------------------------------------------------------

/**
 * 推送通知配置 — 用于客户端注册 Webhook 以接收异步任务更新
 *
 * 对应规范 §4.3.1 PushNotificationConfig
 *
 * 适用于非常长时间运行的任务（数分钟到数天），
 * 或客户端无法维持持久连接的场景（移动端、Serverless 函数等）。
 */
export interface PushNotificationConfig {
  /** 客户端提供的 Webhook URL，智能体将通过 HTTP POST 发送通知到此地址 */
  url: string;
  /** 用于客户端验证通知来源的可选令牌 */
  token?: string;
  /** 智能体向 Webhook 进行身份验证的配置 */
  authentication?: AuthenticationInfo;
  /** 配置的唯一标识符，由服务器生成 */
  configId?: string;
  /** 配置创建时间 */
  createdAt?: string;
}

/**
 * 身份验证信息 — 用于推送通知的 HTTP 身份验证
 *
 * 对应规范 §4.3.2 AuthenticationInfo
 */
export interface AuthenticationInfo {
  /** 身份验证方案，如 "Bearer"、"Basic" */
  scheme: string;
  /** 身份验证凭证 */
  credentials: string;
}

// --------------------------------------------------------------------------
// 2.4 智能体发现对象 (Agent Discovery Objects) — 规范 §4.4
// --------------------------------------------------------------------------

/**
 * 智能体卡片 (AgentCard) — 智能体的"数字名片"
 *
 * 对应规范 §4.4.1 AgentCard
 *
 * 智能体卡片是一个 JSON 元数据文档，A2A 服务器通常将其托管在
 * `/.well-known/agent-card.json` 端点（遵循 RFC 8615）。
 *
 * 客户端通过获取并解析智能体卡片来了解：
 * - 智能体的身份和能力
 * - 如何连接和认证
 * - 智能体提供哪些技能
 *
 * v1.0 重大变更：
 * - protocolVersion 从 AgentCard 移至各个 AgentInterface
 * - preferredTransport 和 additionalInterfaces 合并为 supportedInterfaces
 * - url 字段移至 supportedInterfaces[0].url
 */
export interface AgentCard {
  /** 智能体的显示名称 */
  name: string;
  /** 智能体的功能描述 */
  description: string;
  /** 智能体卡片的版本号，用于缓存和变更追踪 */
  version: string;
  /** 支持的传输接口列表（有序，按偏好排列），v1.0 合并自 preferredTransport + additionalInterfaces */
  supportedInterfaces: AgentInterface[];
  /** 智能体支持的 A2A 扩展能力 */
  capabilities?: AgentCapabilities;
  /** 默认的输入媒体类型列表 */
  defaultInputModes?: string[];
  /** 默认的输出媒体类型列表 */
  defaultOutputModes?: string[];
  /** 智能体提供的技能列表 */
  skills?: AgentSkill[];
  /** 智能体卡片的数字签名列表，用于验证卡片完整性和来源（v1.0 新增） */
  signatures?: AgentCardSignature[];
  /** 安全方案定义映射，键为方案名称 */
  securitySchemes?: Record<string, SecurityScheme>;
  /** 默认的安全要求列表 */
  security?: SecurityRequirement[];
  /** 智能体提供商信息 */
  provider?: AgentProvider;
  /** 附加元数据，扩展可通过此字段传递自定义信息 */
  metadata?: Record<string, unknown>;
  /** 智能体的文档 URL */
  documentationUrl?: string;
  /** 智能体的图标 URL */
  iconUrl?: string;
}

/**
 * 智能体提供商信息
 *
 * 对应规范 §4.4.2 AgentProvider
 */
export interface AgentProvider {
  /** 组织名称 */
  organization?: string;
  /** 提供商网站 URL */
  url?: string;
}

/**
 * 智能体能力声明
 *
 * 对应规范 §4.4.3 AgentCapabilities
 * v1.0 变更：supportsAuthenticatedExtendedCard 从顶层移入此对象
 */
export interface AgentCapabilities {
  /** 是否支持流式传输 (§3.1.2 SendStreamingMessage) */
  streaming?: boolean;
  /** 是否支持推送通知 (§3.1.7 CreatePushNotificationConfig) */
  pushNotifications?: boolean;
  /** 是否支持经过身份验证的扩展智能体卡片 (§3.1.11) */
  extendedAgentCard?: boolean;
  /** 支持的扩展声明列表 */
  extensions?: AgentExtension[];
}

/**
 * 智能体扩展声明
 *
 * 对应规范 §4.4.4 AgentExtension
 */
export interface AgentExtension {
  /** 扩展的唯一标识 URI */
  uri: string;
  /** 扩展的描述信息 */
  description?: string;
  /** 是否必需——如果为 true，不支持的客户端应拒绝交互 */
  required?: boolean;
  /** 扩展的参数，结构和含义由扩展规范定义 */
  params?: Record<string, unknown>;
}

/**
 * 智能体技能 (Skill) — 描述智能体可以执行的特定能力
 *
 * 对应规范 §4.4.5 AgentSkill
 */
export interface AgentSkill {
  /** 技能的唯一标识符 */
  id: string;
  /** 技能的人类可读名称 */
  name: string;
  /** 技能的详细描述 */
  description?: string;
  /** 用于分类和发现的关键词标签 */
  tags?: string[];
  /** 示例提示或用例 */
  examples?: string[];
  /** 此技能接受的输入媒体类型 */
  inputModes?: string[];
  /** 此技能产生的输出媒体类型 */
  outputModes?: string[];
  /** 调用此技能所需的安全要求 */
  securityRequirements?: SecurityRequirement[];
}

/**
 * 智能体接口 — 描述一个具体的传输端点和协议绑定
 *
 * 对应规范 §4.4.6 AgentInterface
 * v1.0 新增：合并了 url、protocolBinding、protocolVersion 和 tenant 字段
 */
export interface AgentInterface {
  /** 服务端点 URL */
  url: string;
  /** 协议绑定标识，如 "JSONRPC"、"HTTP+JSON"、"gRPC"，或自定义绑定 URI */
  protocolBinding: string;
  /** A2A 协议版本，如 "1.0" */
  protocolVersion: string;
  /** 多租户标识——当多个智能体共享同一端点时用于路由区分，v1.0 新增 */
  tenant?: string;
}

/**
 * 智能体卡片签名 — 用于加密验证卡片来源和完整性
 *
 * 对应规范 §4.4.7 AgentCardSignature
 * v1.0 新增，使用 JWS (RFC 7515) 和 JSON 规范化方案 JCS (RFC 8785)
 */
export interface AgentCardSignature {
  /**
   * 受保护的 JWS 头部（base64url 编码的 JSON 对象）
   * 对应 RFC 7515 JWS Protected Header
   */
  protected?: string;
  /**
   * 未受保护的 JWS 头部
   * 对应 RFC 7515 JWS Unprotected Header
   */
  header?: Record<string, unknown>;
  /**
   * JWS 签名字段值（base64url 编码）
   * 对应 RFC 7515 JWS Signature
   */
  signature: string;
}

// --------------------------------------------------------------------------
// 2.5 安全对象 (Security Objects) — 规范 §4.5
// --------------------------------------------------------------------------

/**
 * 安全方案 — 支持的多种身份验证方式
 *
 * 对应规范 §4.5.1 SecurityScheme
 * 通过 discriminated union 区分五种方案类型
 */
export type SecurityScheme =
  | { type: "apiKey"; apiKey: APIKeySecurityScheme }
  | { type: "http"; http: HTTPAuthSecurityScheme }
  | { type: "oauth2"; oauth2: OAuth2SecurityScheme }
  | { type: "openIdConnect"; openIdConnect: OpenIdConnectSecurityScheme }
  | { type: "mutualTls"; mutualTls: MutualTlsSecurityScheme };

/**
 * 安全要求 — 指定需要哪种安全方案及所需 OAuth 范围
 */
export interface SecurityRequirement {
  /**
   * 安全方案到所需范围的映射
   * 键为安全方案名称（对应 securitySchemes 中的键），
   * 值为该方案所需的 OAuth 2.0 范围列表
   */
  schemes: Record<string, string[]>;
}

/** API 密钥安全方案 — 规范 §4.5.2 */
export interface APIKeySecurityScheme {
  /** 参数名称（头名称或查询参数名） */
  name: string;
  /** 密钥传递位置：query（查询参数）/ header（请求头）/ cookie */
  in: "query" | "header" | "cookie";
  /** 描述信息 */
  description?: string;
}

/** HTTP 认证安全方案 — 规范 §4.5.3 */
export interface HTTPAuthSecurityScheme {
  /** HTTP 认证方案：basic / bearer / digest */
  scheme: "basic" | "bearer" | "digest";
  description?: string;
}

/** OAuth 2.0 安全方案 — 规范 §4.5.4 */
export interface OAuth2SecurityScheme {
  /** OAuth 流程定义 */
  flows: OAuthFlows;
  description?: string;
}

/** OpenID Connect 安全方案 — 规范 §4.5.5 */
export interface OpenIdConnectSecurityScheme {
  /** OpenID Connect 提供商配置 URL */
  openIdConnectUrl: string;
  description?: string;
}

/** 双向 TLS (mTLS) 安全方案 — 规范 §4.5.6 */
export interface MutualTlsSecurityScheme {
  description?: string;
}

/**
 * OAuth 2.0 流程定义 — 规范 §4.5.7
 *
 * v1.0 更新：
 * - 新增 DeviceCodeOAuthFlow (RFC 8628)
 * - 为 AuthorizationCodeOAuthFlow 新增 pkceRequired 字段 (RFC 7636)
 * - 移除已废弃的 ImplicitOAuthFlow 和 PasswordOAuthFlow
 */
export interface OAuthFlows {
  /** 授权码流程 — 最常用的 Web 服务端流程 */
  authorizationCode?: AuthorizationCodeOAuthFlow;
  /** 客户端凭证流程 — 适用于服务器到服务器通信 */
  clientCredentials?: ClientCredentialsOAuthFlow;
  /** 设备码流程 — 适用于 CLI 工具、IoT 设备等输入受限场景，v1.0 新增 */
  deviceCode?: DeviceCodeOAuthFlow;
}

/** 授权码 OAuth 流程 — 规范 §4.5.8 */
export interface AuthorizationCodeOAuthFlow {
  /** 授权端点 URL */
  authorizationUrl: string;
  /** 令牌端点 URL */
  tokenUrl: string;
  /** 刷新令牌端点 URL（可选） */
  refreshUrl?: string;
  /** 可用的 OAuth 范围映射（键为范围名，值为描述） */
  scopes: Record<string, string>;
  /** 是否需要 PKCE (Proof Key for Code Exchange)，v1.0 新增 */
  pkceRequired?: boolean;
}

/** 客户端凭证 OAuth 流程 — 规范 §4.5.9 */
export interface ClientCredentialsOAuthFlow {
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

/** 设备码 OAuth 流程 (RFC 8628) — 规范 §4.5.10，v1.0 新增 */
export interface DeviceCodeOAuthFlow {
  /** 设备授权端点 URL，客户端在此获取设备码和用户码 */
  deviceAuthorizationUrl: string;
  tokenUrl: string;
  scopes: Record<string, string>;
}

// --------------------------------------------------------------------------
// 2.6 请求/响应对象 (Operation Parameter Objects) — 规范 §3.2
// --------------------------------------------------------------------------

/**
 * 发送消息请求 — 发起智能体交互的主要操作
 *
 * 对应规范 §3.2.1 SendMessageRequest
 */
export interface SendMessageRequest {
  /** 要发送的消息内容 */
  message: Message;
  /** 发送配置（执行模式、推送通知等） */
  config?: SendMessageConfiguration;
  /** 附加元数据 */
  metadata?: Record<string, unknown>;
  /** 多租户标识，v1.0 新增 */
  tenant?: string;
}

/**
 * 发送消息配置 — 控制消息的执行模式
 *
 * 对应规范 §3.2.2 SendMessageConfiguration
 *
 * returnImmediately 字段控制操作是阻塞（默认）还是非阻塞：
 * - false（默认）：等待任务达到终端或中断状态才返回
 * - true：创建任务后立即返回，调用者需自行轮询/订阅
 */
export interface SendMessageConfiguration {
  /**
   * 是否立即返回而非等待任务完成
   * - false 或未设置：阻塞模式，等待终端/中断状态
   * - true：非阻塞模式，创建任务后立即返回
   */
  returnImmediately?: boolean;
  /** 为任务配置推送通知 */
  pushNotificationConfig?: PushNotificationConfig;
}

/** 获取任务请求 — 规范 §3.1.3 */
export interface GetTaskRequest {
  /** 要获取的任务 ID */
  taskId: string;
  /** 返回的历史消息条数（0=不返回，未设置=返回全部） */
  historyLength?: number;
  /** 附加上下文或参数 */
  metadata?: Record<string, unknown>;
  /** 多租户路由标识 */
  tenant?: string;
}

/** 列出任务请求 — 规范 §3.1.4 */
export interface ListTasksRequest {
  /** 按上下文 ID 过滤 */
  contextId?: string;
  /** 按任务状态过滤 */
  status?: TaskState;
  /** 每页最大条目数（默认 50，最大 100） */
  pageSize?: number;
  /** 分页游标令牌，用于获取下一页 */
  pageToken?: string;
  /** 返回历史消息的条数 */
  historyLength?: number;
  /** 是否在结果中包含制品数据（默认 false，为 true 时可能影响性能） */
  includeArtifacts?: boolean;
  /** 按状态更新时间过滤（ISO 8601 格式），仅返回在此时间之后更新状态的任务 */
  statusTimestampAfter?: string;
}

/** 列出任务响应 — 规范 §3.1.4 */
export interface ListTasksResponse {
  /** 当前页的任务列表 */
  tasks: Task[];
  /** 符合条件的总任务数 */
  totalSize?: number;
  /** 实际返回的条目数 */
  pageSize?: number;
  /** 下一页的游标令牌，空字符串表示已到最后一页 */
  nextPageToken: string;
}

/** 取消任务请求 — 规范 §3.1.5 */
export interface CancelTaskRequest {
  /** 要取消的任务资源 ID */
  id: string;
  /** 附加上下文或参数 */
  metadata?: Record<string, unknown>;
  /** 多租户路由标识 */
  tenant?: string;
}

/** 订阅任务请求 — 规范 §3.1.6 */
export interface SubscribeToTaskRequest {
  /** 要订阅的任务 ID */
  taskId: string;
  /** 返回的历史消息条数 */
  historyLength?: number;
}

/** 获取扩展智能体卡片请求 — 规范 §3.1.11 */
export interface GetExtendedAgentCardRequest {
  metadata?: Record<string, unknown>;
}

/** 创建推送通知配置的参数（用于创建/设置操作） */
export interface TaskPushNotificationConfigInput {
  taskId?: string;
  url?: string;
  token?: string;
  authentication?: AuthenticationInfo;
}

/** 获取推送通知配置请求 */
export interface GetTaskPushNotificationConfigRequest {
  taskId: string;
  configId: string;
}

/** 列出推送通知配置请求 */
export interface ListTaskPushNotificationConfigsRequest {
  taskId: string;
}

/** 列出推送通知配置响应 */
export interface ListTaskPushNotificationConfigsResponse {
  configs: PushNotificationConfig[];
}

/** 删除推送通知配置请求 */
export interface DeleteTaskPushNotificationConfigRequest {
  taskId: string;
  configId: string;
}

// --------------------------------------------------------------------------
// 2.7 错误对象 (Error Objects) — 规范 §3.3.2
// --------------------------------------------------------------------------

/**
 * A2A 协议错误 — 所有绑定通用的结构化错误信息
 *
 * 对应规范 §3.3.2 Error Payload Structure
 *
 * v1.0 变更：使用 google.rpc.Status 模型，在 details 数组中包含 ErrorInfo
 */
export interface A2AError {
  /** 错误码（JSON-RPC / HTTP 状态码） */
  code: number;
  /** 人类可读的错误描述 */
  message: string;
  /** 结构化的错误详情，符合 google.rpc.Status 规范 */
  details?: Array<{
    /** 类型标识，如 "type.googleapis.com/google.rpc.ErrorInfo" */
    "@type": string;
    /** 错误原因，如 "TASK_NOT_FOUND" */
    reason: string;
    /** 错误域，A2A 规范固定为 "a2a-protocol.org" */
    domain: string;
    /** 附加的元数据，如 { "taskId": "xxx" } */
    metadata?: Record<string, string>;
  }>;
}

// ============================================================================
// 第 3 部分 — Zod 运行时验证模式
// ============================================================================
//
// 注意 — Zod v4 重要变更：
// 1. errorMap 回调已移除，使用 refine/superRefine 实现自定义错误消息
// 2. z.enum(strings[]) 优先于 z.nativeEnum()，更好的类型推断
// 3. z.record(z.string(), z.unknown()) 双参数形式（明确键类型为 string）
// 4. z.string().url() 验证要求完整 URL（含协议）
// ============================================================================

/**
 * Zod v4 枚举辅助 — 替代 z.nativeEnum 的 errorMap 方式
 *
 * Zod v4 移除了 errorMap 回调参数。此函数通过 refine 实现自定义错误消息。
 *
 * @param values 枚举字符串值列表
 * @param message 自定义错误消息
 * @returns Zod 枚举模式
 *
 * @example
 * ```ts
 * const RoleEnum = enumMessage(['ROLE_USER', 'ROLE_AGENT'], '角色必须是...');
 * ```
 */
function enumMessage<T extends readonly [string, ...string[]]>(values: T, message: string) {
  return z.enum(values).refine((v): v is T[number] => values.includes(v), { message });
}

/**
 * Part 验证模式 — 规范 §4.1.6
 *
 * v1.0 统一 Part 结构：通过字段存在性（text/raw/url/data）判断内容类型，
 * 而非 v0.3.0 的 kind 字段。
 *
 * 验证规则：
 * - text/raw/url/data 四个字段全部 optional（支持部分更新场景）
 * - url 字段若提供必须是完整 URL（含协议）
 * - mediaType 为 MIME 类型字符串
 */
export const PartSchema = z.object({
  text: z.string().describe("纯文本内容").optional(),
  raw: z.string().describe("base64 编码的二进制数据").optional(),
  url: z
    .string()
    .url("URL 格式无效，需要完整 URL（如 https://example.com/file.pdf）")
    .describe("外部文件引用 URL")
    .optional(),
  data: z.record(z.string(), z.unknown()).describe("结构化 JSON 数据").optional(),
  mediaType: z.string().describe("MIME 类型，如 text/plain").optional(),
  filename: z.string().describe("文件或内容的显示名称").optional(),
  metadata: z.record(z.string(), z.unknown()).describe("附加元数据").optional(),
});

/**
 * Message 验证模式 — 规范 §4.1.4
 *
 * 验证规则：
 * - role 必须是 ROLE_USER 或 ROLE_AGENT
 * - parts 至少包含一个 Part
 * - messageId 不能为空
 */
export const MessageSchema = z.object({
  role: enumMessage(
    ["ROLE_USER", "ROLE_AGENT"] as const,
    "角色必须是 ROLE_USER（用户）或 ROLE_AGENT（智能体）",
  ),
  parts: z.array(PartSchema).min(1, "消息至少需要一个 Part"),
  messageId: z.string().min(1, "messageId 不能为空"),
  contextId: z.string().describe("上下文 ID，用于分组相关消息").optional(),
  taskId: z.string().describe("关联的任务 ID").optional(),
  referenceTaskIds: z.array(z.string()).describe("引用的相关任务 ID 列表").optional(),
  extensions: z.array(z.string()).describe("激活的扩展 URI 列表").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * TaskStatus 验证模式 — 规范 §4.1.2
 *
 * 验证规则：
 * - state 必须是 TaskState 枚举的有效值（SCREAMING_SNAKE_CASE 格式）
 * - timestamp 必须为 ISO 8601 UTC 格式（支持 Z 和时区偏移）
 */
export const TaskStatusSchema = z.object({
  state: enumMessage(
    [
      "TASK_STATE_SUBMITTED",
      "TASK_STATE_WORKING",
      "TASK_STATE_COMPLETED",
      "TASK_STATE_FAILED",
      "TASK_STATE_CANCELED",
      "TASK_STATE_REJECTED",
      "TASK_STATE_INPUT_REQUIRED",
      "TASK_STATE_AUTH_REQUIRED",
    ] as const,
    "无效的任务状态值，必须使用 SCREAMING_SNAKE_CASE 格式（如 TASK_STATE_COMPLETED）",
  ),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .describe("ISO 8601 UTC 时间戳，如 2024-03-15T10:15:00.000Z")
    .optional(),
  message: MessageSchema.describe("附加的状态消息").optional(),
  code: z.number().int().describe("机器可读的状态码").optional(),
});

/**
 * Artifact 验证模式 — 规范 §4.1.7
 *
 * v1.0 新增 extensions[] 数组字段
 */
export const ArtifactSchema = z.object({
  artifactId: z.string().min(1, "artifactId 不能为空"),
  name: z.string().min(1, "制品名称不能为空"),
  description: z.string().describe("制品描述").optional(),
  parts: z.array(PartSchema).min(1, "制品至少需要一个 Part"),
  extensions: z.array(z.string()).describe("应用的扩展 URI 列表").optional(),
  metadata: z.record(z.string(), z.unknown()).describe("附加元数据").optional(),
  index: z.number().int().min(0).describe("在任务制品数组中的位置索引").optional(),
  lastChunk: z.boolean().describe("是否最后一个分块（流式传输）").optional(),
  append: z.boolean().describe("是否追加到已有制品").optional(),
});

/**
 * Task 验证模式 — 规范 §4.1.1
 *
 * v1.0 新增：createdAt、lastModified 时间戳字段
 */
export const TaskSchema = z.object({
  id: z.string().min(1, "taskId 不能为空"),
  contextId: z.string().describe("上下文 ID").optional(),
  status: TaskStatusSchema,
  artifacts: z.array(ArtifactSchema).describe("任务产出的制品列表").optional(),
  history: z.array(MessageSchema).describe("任务执行过程中的消息历史").optional(),
  extensions: z.array(z.string()).describe("应用于此任务的扩展 URI 列表").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z
    .string()
    .datetime({ offset: true })
    .describe("任务创建时间（ISO 8601 UTC）")
    .optional(),
  lastModified: z
    .string()
    .datetime({ offset: true })
    .describe("任务最后修改时间（ISO 8601 UTC）")
    .optional(),
});

/**
 * AgentInterface 验证模式
 */
export const AgentInterfaceSchema = z.object({
  url: z.string().url("端点 URL 格式无效"),
  protocolBinding: z.string().min(1, "协议绑定标识不能为空"),
  protocolVersion: z.string().min(1, "协议版本不能为空"),
  tenant: z.string().optional(),
});

/**
 * AgentSkill 验证模式
 */
export const AgentSkillSchema = z.object({
  id: z.string().min(1, "技能 ID 不能为空"),
  name: z.string().min(1, "技能名称不能为空"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  inputModes: z.array(z.string()).optional(),
  outputModes: z.array(z.string()).optional(),
  securityRequirements: z
    .array(
      z.object({
        scheme: z.string(),
        scopes: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

/**
 * AgentCard 完整验证模式
 *
 * 验证规则：
 * - name、description、version 为必填
 * - supportedInterfaces 至少包含一个有效的接口定义
 * - skills（若提供）中的每个技能都必须有有效的 id 和 name
 * - v1.0 新增：supportedInterfaces 替换 url + preferredTransport + additionalInterfaces
 */
export const AgentCardSchema = z.object({
  name: z.string().min(1, "智能体名称不能为空"),
  description: z.string().min(1, "智能体描述不能为空"),
  version: z.string().min(1, "版本号不能为空"),
  supportedInterfaces: z.array(AgentInterfaceSchema).min(1, "至少需要一个传输接口"),
  capabilities: z
    .object({
      streaming: z.boolean().describe("是否支持流式传输").optional(),
      pushNotifications: z.boolean().describe("是否支持推送通知").optional(),
      extendedAgentCard: z.boolean().describe("是否支持扩展智能体卡片").optional(),
      extensions: z
        .array(
          z.object({
            uri: z.string().url("扩展 URI 格式无效"),
            description: z.string().optional(),
            required: z.boolean().describe("客户端必须支持此扩展").optional(),
            params: z.record(z.string(), z.unknown()).describe("扩展参数").optional(),
          }),
        )
        .optional(),
    })
    .describe("智能体能力声明")
    .optional(),
  defaultInputModes: z.array(z.string()).describe("默认输入媒体类型列表").optional(),
  defaultOutputModes: z.array(z.string()).describe("默认输出媒体类型列表").optional(),
  skills: z.array(AgentSkillSchema).describe("智能体提供的技能列表").optional(),
  signatures: z
    .array(
      z.object({
        protected: z.string().describe("受保护的 JWS 头部（base64url 编码）").optional(),
        header: z.record(z.string(), z.unknown()).describe("未受保护的 JWS 头部").optional(),
        signature: z.string().min(1, "签名字段不能为空"),
      }),
    )
    .describe("智能体卡片签名列表（RFC 7515 JWS 格式）")
    .optional(),
  provider: z
    .object({
      organization: z.string().describe("组织名称").optional(),
      url: z.string().url("提供商 URL 格式无效").describe("提供商网站 URL").optional(),
    })
    .describe("智能体提供商信息")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * SendMessageRequest 验证模式 — 规范 §3.2.1
 *
 * v1.0 新增：
 * - config.returnImmediately 字段（非阻塞模式）
 * - tenant 字段（多租户支持）
 */
export const SendMessageRequestSchema = z.object({
  message: MessageSchema,
  config: z
    .object({
      returnImmediately: z
        .boolean()
        .describe("true=非阻塞（立即返回），false=阻塞（等待完成）")
        .optional(),
      pushNotificationConfig: z
        .object({
          url: z.string().url("Webhook URL 格式无效"),
          token: z.string().describe("客户端验证令牌").optional(),
          authentication: z
            .object({
              scheme: z.string().describe("身份验证方案，如 Bearer"),
              credentials: z.string().describe("身份验证凭证"),
            })
            .optional(),
        })
        .describe("推送通知配置")
        .optional(),
    })
    .describe("发送配置")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tenant: z.string().describe("多租户标识，v1.0 新增").optional(),
});

// ============================================================================
// 第 4 部分 — 工具函数
// ============================================================================

/**
 * 创建一个纯文本消息的便捷函数
 *
 * @param text 消息文本内容
 * @param role 消息角色（默认为 ROLE_USER）
 * @param parts 可选的额外 Part 列表
 * @returns 符合 A2A v1.0 规范的消息对象
 *
 * @example
 * ```ts
 * const msg = createTextMessage('你好，A2A！');
 * // 结果: { role: 'ROLE_USER', parts: [{ text: '你好，A2A！' }], messageId: '...' }
 * ```
 */
export function createTextMessage(text: string, role: Role = Role.ROLE_USER): Message {
  return {
    role,
    parts: [{ text }],
    messageId: crypto.randomUUID(),
  };
}

/**
 * 创建一个包含文件引用的消息
 *
 * @param url 文件 URL
 * @param mediaType 文件的 MIME 类型
 * @param filename 可选的文件名
 * @param role 消息角色
 * @returns 符合 A2A v1.0 规范的消息对象
 */
export function createFileMessage(
  url: string,
  mediaType: string,
  filename?: string,
  role: Role = Role.ROLE_USER,
): Message {
  return {
    role,
    parts: [{ url, mediaType, filename }],
    messageId: crypto.randomUUID(),
  };
}

/**
 * 创建一个包含结构化数据的消息
 *
 * @param data 结构化 JSON 数据
 * @param mediaType 数据的 MIME 类型（默认 application/json）
 * @param role 消息角色
 * @returns 符合 A2A v1.0 规范的消息对象
 */
export function createDataMessage(
  data: Record<string, unknown>,
  mediaType: string = "application/json",
  role: Role = Role.ROLE_USER,
): Message {
  return {
    role,
    parts: [{ data, mediaType }],
    messageId: crypto.randomUUID(),
  };
}

/**
 * 检查一个值是否为有效的 TaskState 枚举值
 *
 * @param state 要检查的值
 * @returns 该值是否为有效的 TaskState
 */
export function isValidTaskState(state: string): state is TaskState {
  return Object.values<string>(TaskState).includes(state);
}

/**
 * 检查任务是否处于终端状态（不可再变更）
 *
 * 终端状态包括：COMPLETED、FAILED、CANCELED、REJECTED
 * 处于终端状态的任务不能接受新消息或重新启动（规范 §3.4）
 *
 * @param state 任务状态
 * @returns 是否为终端状态
 */
export function isTerminalState(state: TaskState): boolean {
  return [
    TaskState.TASK_STATE_COMPLETED,
    TaskState.TASK_STATE_FAILED,
    TaskState.TASK_STATE_CANCELED,
    TaskState.TASK_STATE_REJECTED,
  ].includes(state);
}

/**
 * 获取 A2A 错误类型对应的 JSON-RPC 错误码
 *
 * 对应规范 §5.4 Error Code Mappings
 */
export function getA2AErrorCode(errorType: A2AErrorType): number {
  const codeMap: Record<string, number> = {
    [A2AErrorType.TASK_NOT_FOUND]: -32001,
    [A2AErrorType.TASK_NOT_CANCELABLE]: -32002,
    [A2AErrorType.PUSH_NOTIFICATION_NOT_SUPPORTED]: -32003,
    [A2AErrorType.UNSUPPORTED_OPERATION]: -32004,
    [A2AErrorType.CONTENT_TYPE_NOT_SUPPORTED]: -32005,
    [A2AErrorType.INVALID_AGENT_RESPONSE]: -32006,
    [A2AErrorType.EXTENDED_AGENT_CARD_NOT_CONFIGURED]: -32007,
    [A2AErrorType.EXTENSION_SUPPORT_REQUIRED]: -32008,
    [A2AErrorType.VERSION_NOT_SUPPORTED]: -32009,
  };
  return codeMap[errorType] ?? -32603;
}

/**
 * 根据 HTTP 状态码获取对应的 gRPC 状态码名称
 *
 * 用于错误映射（规范 §5.4）
 */
export function httpStatusToGrpcCode(httpStatus: number): string {
  const map: Record<number, string> = {
    400: "INVALID_ARGUMENT",
    401: "UNAUTHENTICATED",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    409: "ABORTED",
    429: "UNAVAILABLE",
    499: "CANCELLED",
    500: "INTERNAL",
    503: "UNAVAILABLE",
    504: "DEADLINE_EXCEEDED",
  };
  return map[httpStatus] ?? "UNKNOWN";
}
