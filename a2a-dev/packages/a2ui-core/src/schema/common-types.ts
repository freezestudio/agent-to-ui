/**
 * A2UI v1.0 通用类型 Zod v4 验证模式
 *
 * 根据规范 `common_types.json` 定义运行时验证规则。
 * 使用 Zod v4 确保所有 A2UI 消息在运行时符合协议规范。
 *
 * @packageDocumentation
 */

import { z } from "zod";

// ============================================================================
// 协议版本常量
// ============================================================================

/** A2UI v1.0 协议版本标识 */
export const SPEC_VERSION = "1.0";

// ============================================================================
// 基础标识符
// ============================================================================

/** 组件 ID 验证：非空字符串 */
export const ComponentIdSchema = z.string().min(1, "组件 ID 不能为空");

// ============================================================================
// 数据绑定模式
// ============================================================================

/**
 * DataBinding Zod 模式
 *
 * 验证 { path: string } 格式的数据绑定。
 * 使用 .strict() 禁止额外字段。
 */
export const DataBindingSchema = z
  .object({
    path: z.string().min(1, "JSON Pointer 路径不能为空"),
  })
  .strict();

// ============================================================================
// 函数调用模式
// ============================================================================

/**
 * FunctionCall Zod 模式
 *
 * 验证 { call: string, args?: Record<string, unknown> } 格式的函数调用。
 * args 为可选字段。
 */
export const FunctionCallSchema = z.object({
  call: z.string().min(1, "函数名不能为空"),
  args: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// 动态值模式
// ============================================================================

/**
 * DynamicString Zod 模式
 *
 * 字符串值的联合类型：字面量 | DataBinding | FunctionCall
 */
export const DynamicStringSchema = z.union([z.string(), DataBindingSchema, FunctionCallSchema]);

/**
 * DynamicNumber Zod 模式
 *
 * 数值值的联合类型：number | DataBinding | FunctionCall
 */
export const DynamicNumberSchema = z.union([z.number(), DataBindingSchema, FunctionCallSchema]);

/**
 * DynamicBoolean Zod 模式
 *
 * 布尔值的联合类型：boolean | DataBinding | FunctionCall
 */
export const DynamicBooleanSchema = z.union([z.boolean(), DataBindingSchema, FunctionCallSchema]);

/**
 * DynamicStringList Zod 模式
 *
 * 字符串数组的联合类型：Array<string> | DataBinding | FunctionCall
 */
export const DynamicStringListSchema = z.union([
  z.array(z.string()),
  DataBindingSchema,
  FunctionCallSchema,
]);

// ============================================================================
// 组件公共属性模式
// ============================================================================

/**
 * ComponentCommon Zod 模式
 *
 * 所有组件的公共基础验证：
 * - id: 必填，非空字符串
 * - accessibility: 可选，包含 label 和/或 description
 */
export const ComponentCommonSchema = z.object({
  id: z.string().min(1, "组件 ID 不能为空"),
  accessibility: z
    .object({
      label: DynamicStringSchema.optional(),
      description: DynamicStringSchema.optional(),
    })
    .strict()
    .optional(),
});

// ============================================================================
// 子组件列表模式
// ============================================================================

/**
 * ChildList Zod 模式
 *
 * 两种形式：
 * - 静态 ID 数组: ["id1", "id2"]
 * - 动态模板: { componentId: "...", path: "..." }
 */
export const ChildListSchema: z.ZodType<unknown> = z.union([
  z.array(z.string()),
  z
    .object({
      componentId: z.string().min(1, "模板组件 ID 不能为空"),
      path: z.string().min(1, "数据路径不能为空"),
    })
    .strict(),
]);

// ============================================================================
// 校验规则模式
// ============================================================================

/**
 * CheckRule Zod 模式
 *
 * 验证 { condition: DynamicBoolean, message: string } 格式的校验规则。
 */
export const CheckRuleSchema = z.object({
  condition: DynamicBooleanSchema,
  message: z.string(),
});

// ============================================================================
// 事件模式
// ============================================================================

/**
 * Action 模式：事件触发或函数调用
 */
export const ActionEventSchema = z
  .object({
    event: z
      .object({
        name: z.string().min(1, "事件名称不能为空"),
        context: z.record(z.string(), z.unknown()).optional(),
        wantResponse: z.boolean().optional(),
        responsePath: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export const ActionFunctionCallSchema = z
  .object({
    functionCall: FunctionCallSchema,
  })
  .strict();

export const ActionSchema: z.ZodType<unknown> = z.union([
  ActionEventSchema,
  ActionFunctionCallSchema,
]);
