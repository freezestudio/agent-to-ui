/**
 * A2UI v1.0 服务端→客户端 消息 Zod 模式
 *
 * 根据 `server_to_client.json` 规范定义 6 种信封消息的验证规则。
 * 所有消息使用 `discriminatedUnion` 模式通过消息类型字段鉴别。
 *
 * @packageDocumentation
 */

import { z } from "zod";
import { SPEC_VERSION } from "./common-types.js";

// ============================================================================
// createSurface 模式
// ============================================================================

/** createSurface 消息体验证 */
export const CreateSurfaceSchema = z.object({
  surfaceId: z.string().min(1, "surfaceId 不能为空"),
  catalogId: z.string().min(1, "catalogId 不能为空"),
  surfaceProperties: z.record(z.string(), z.unknown()).optional(),
  sendDataModel: z.boolean().optional(),
  components: z.array(z.record(z.string(), z.unknown())).optional(),
  dataModel: z.record(z.string(), z.unknown()).optional(),
}).strict();

// ============================================================================
// updateComponents 模式
// ============================================================================

/** updateComponents 消息体验证 */
export const UpdateComponentsSchema = z.object({
  surfaceId: z.string().min(1, "surfaceId 不能为空"),
  components: z.array(z.record(z.string(), z.unknown()))
    .min(1, "components 列表至少需要 1 个组件"),
}).strict();

// ============================================================================
// updateDataModel 模式
// ============================================================================

/** updateDataModel 消息体验证 */
export const UpdateDataModelSchema = z.object({
  surfaceId: z.string().min(1, "surfaceId 不能为空"),
  path: z.string().optional(),
  value: z.unknown().optional(),
}).strict();

// ============================================================================
// deleteSurface 模式
// ============================================================================

/** deleteSurface 消息体验证 */
export const DeleteSurfaceSchema = z.object({
  surfaceId: z.string().min(1, "surfaceId 不能为空"),
}).strict();

// ============================================================================
// actionResponse 模式（v1.0 新增）
// ============================================================================

/** actionResponse 消息体验证 */
export const ActionResponseSchema = z.object({
  actionId: z.string().min(1, "actionId 不能为空"),
  actionResponse: z.object({
    value: z.unknown().optional(),
    error: z.object({
      code: z.string().min(1),
      message: z.string(),
    }).strict().optional(),
  }).strict(),
}).strict();

// ============================================================================
// callFunction 模式（v1.0 新增）
// ============================================================================

/** callFunction 消息体验证 */
export const CallFunctionSchema = z.object({
  functionCallId: z.string().min(1, "functionCallId 不能为空"),
  wantResponse: z.boolean().optional(),
  callFunction: z.object({
    call: z.string().min(1, "函数名不能为空"),
    args: z.record(z.string(), z.unknown()).optional(),
  }),
}).strict();

// ============================================================================
// 信封消息联合模式
// ============================================================================

/**
 * A2UI 消息信封 Zod 模式
 *
 * 使用 z.union 实现 oneOf 鉴别器。
 * 每条消息使用 version + 消息类型键名来区分。
 */
export const A2uiMessageSchema = z.union([
  z.object({
    version: z.literal(SPEC_VERSION, { message: "版本必须是 '1.0'" }),
    createSurface: CreateSurfaceSchema,
  }),
  z.object({
    version: z.literal(SPEC_VERSION),
    updateComponents: UpdateComponentsSchema,
  }),
  z.object({
    version: z.literal(SPEC_VERSION),
    updateDataModel: UpdateDataModelSchema,
  }),
  z.object({
    version: z.literal(SPEC_VERSION),
    deleteSurface: DeleteSurfaceSchema,
  }),
  z.object({
    version: z.literal(SPEC_VERSION),
    actionResponse: ActionResponseSchema,
  }),
  z.object({
    version: z.literal(SPEC_VERSION),
    callFunction: CallFunctionSchema,
  }),
]);
