/**
 * A2UI v1.0 客户端→服务端 消息 Zod 模式
 *
 * 根据 `client_to_server.json` 规范定义客户端消息的验证规则。
 * 客户端消息有三种类型：
 * - action（用户交互事件）
 * - functionResponse（函数调用响应）
 * - error（错误报告）
 *
 * @packageDocumentation
 */

import { z } from "zod";
import { SPEC_VERSION } from "./common-types.js";

// ============================================================================
// action 模式
// ============================================================================

/**
 * A2UI 客户端 action Zod 模式
 *
 * 当用户与 UI 组件交互时，客户端发送此消息。
 * 必须包含 version、action.name、surfaceId、sourceComponentId、timestamp 和 context。
 */
export const A2uiClientActionSchema = z.object({
  version: z.literal(SPEC_VERSION),
  action: z.object({
    name: z.string().min(1, "action 名称不能为空"),
    surfaceId: z.string().min(1, "surfaceId 不能为空"),
    sourceComponentId: z.string().min(1, "sourceComponentId 不能为空"),
    timestamp: z.string().min(1, "时间戳不能为空"),
    context: z.record(z.string(), z.unknown()),
    wantResponse: z.boolean().optional(),
    actionId: z.string().optional(),
  }).strict(),
}).strict();

// ============================================================================
// functionResponse 模式
// ============================================================================

/**
 * A2UI 客户端函数响应 Zod 模式
 *
 * 响应服务端 callFunction 消息的结果。
 * functionCallId 和 call 必须与请求一致。
 */
export const A2uiClientFunctionResponseSchema = z.object({
  version: z.literal(SPEC_VERSION),
  functionResponse: z.object({
    functionCallId: z.string().min(1, "functionCallId 不能为空"),
    call: z.string().min(1, "函数名不能为空"),
    value: z.unknown(),
  }).strict(),
}).strict();

// ============================================================================
// error 模式
// ============================================================================

/**
 * A2UI 客户端错误 Zod 模式
 *
 * 报告客户端侧的验证失败或运行时错误。
 * code 为错误类型，message 为错误描述。
 */
export const A2uiClientErrorSchema = z.object({
  version: z.literal(SPEC_VERSION),
  error: z.object({
    code: z.string().min(1, "错误码不能为空"),
    message: z.string(),
    surfaceId: z.string().optional(),
    path: z.string().optional(),
    functionCallId: z.string().optional(),
  }),
}).strict();

// ============================================================================
// 客户端消息联合模式
// ============================================================================

/**
 * A2UI 客户端消息联合 Zod 模式
 *
 * 三种客户端消息类型的联合。
 */
export const A2uiClientMessageSchema = z.union([
  A2uiClientActionSchema,
  A2uiClientFunctionResponseSchema,
  A2uiClientErrorSchema,
]);
