/**
 * @a2a-dev/core — A2A Protocol v1.0 核心类型与验证
 *
 * 本包提供 A2A 协议规范所需的全部 TypeScript 类型定义、
 * Zod v4 运行时验证模式，以及便捷工具函数。
 *
 * 使用示例：
 * ```ts
 * import { TaskState, Role, createTextMessage, TaskSchema } from '@a2a-dev/core';
 *
 * const msg = createTextMessage('你好', Role.ROLE_USER);
 * const task = { id: '...', status: { state: TaskState.TASK_STATE_COMPLETED } };
 * TaskSchema.parse(task); // Zod v4 运行时验证
 * ```
 */

// 枚举常量
export { TaskState, Role, A2AErrorType, ServiceParameter } from "./types/index.js";

// 类型接口
export type {
  // 核心数据对象 (§4.1)
  Part,
  Message,
  TaskStatus,
  Task,
  Artifact,
  // 流式事件 (§4.2)
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  StreamResponse,
  // 推送通知 (§4.3)
  PushNotificationConfig,
  AuthenticationInfo,
  // 智能体发现 (§4.4)
  AgentCard,
  AgentProvider,
  AgentCapabilities,
  AgentExtension,
  AgentSkill,
  AgentInterface,
  AgentCardSignature,
  // 安全对象 (§4.5)
  SecurityScheme,
  SecurityRequirement,
  APIKeySecurityScheme,
  HTTPAuthSecurityScheme,
  OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme,
  MutualTlsSecurityScheme,
  OAuthFlows,
  AuthorizationCodeOAuthFlow,
  ClientCredentialsOAuthFlow,
  DeviceCodeOAuthFlow,
  // 请求/响应 (§3.2)
  SendMessageRequest,
  SendMessageConfiguration,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  CancelTaskRequest,
  SubscribeToTaskRequest,
  GetExtendedAgentCardRequest,
  TaskPushNotificationConfigInput,
  GetTaskPushNotificationConfigRequest,
  ListTaskPushNotificationConfigsRequest,
  ListTaskPushNotificationConfigsResponse,
  DeleteTaskPushNotificationConfigRequest,
  // 错误 (§3.3.2)
  A2AError,
} from "./types/index.js";

// Zod v4 验证模式
export {
  PartSchema,
  MessageSchema,
  TaskStatusSchema,
  ArtifactSchema,
  TaskSchema,
  AgentInterfaceSchema,
  AgentSkillSchema,
  AgentCardSchema,
  SendMessageRequestSchema,
} from "./types/index.js";

// 工具函数
export {
  createTextMessage,
  createFileMessage,
  createDataMessage,
  isValidTaskState,
  isTerminalState,
  getA2AErrorCode,
  httpStatusToGrpcCode,
} from "./types/index.js";

// 智能体卡片签名 (JCS RFC 8785 + JWS RFC 7515)
export {
  canonicalizeAgentCard,
  generateAgentCardKeyPair,
  signAgentCard,
  verifyAgentCardSignature,
  selfTest as signatureSelfTest,
} from "./signature.js";

// AgentCard 缓存 (ETag / If-None-Match, 规范 §8.6)
export {
  computeAgentCardETag,
  serveAgentCard,
  fetchAgentCardWithCache,
  AgentCardCache,
} from "./cache.js";
