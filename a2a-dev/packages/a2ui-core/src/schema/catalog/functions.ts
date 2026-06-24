/**
 * A2UI v1.0 基本目录内置函数 Zod 模式
 *
 * 根据 `catalogs/basic/catalog.json` 的 functions 定义。
 * 包含 14 个内置函数 + 1 个系统函数 @index 的验证模式。
 *
 * @packageDocumentation
 */

import { z } from "zod";
import { DynamicStringSchema, DynamicNumberSchema, DynamicBooleanSchema } from "../common-types.js";

// ============================================================================
// 校验函数（Validation Functions）
// ============================================================================

/** required — 非 null/非空校验 */
export const RequiredFnSchema = z
  .object({
    call: z.literal("required"),
    args: z.object({ value: z.unknown() }).strict(),
  })
  .strict();

/** regex — 正则匹配校验 */
export const RegexFnSchema = z
  .object({
    call: z.literal("regex"),
    args: z
      .object({
        value: DynamicStringSchema,
        pattern: z.string({ message: "pattern 必须为字符串" }),
      })
      .strict(),
  })
  .strict();

/** length — 字符串长度范围校验 */
export const LengthFnSchema = z
  .object({
    call: z.literal("length"),
    args: z
      .object({
        value: DynamicStringSchema,
        min: z.number().int().min(0).optional(),
        max: z.number().int().min(0).optional(),
      })
      .strict(),
  })
  .strict();

/** numeric — 数值范围校验 */
export const NumericFnSchema = z
  .object({
    call: z.literal("numeric"),
    args: z
      .object({
        value: DynamicNumberSchema,
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .strict(),
  })
  .strict();

/** email — 邮箱格式校验 */
export const EmailFnSchema = z
  .object({
    call: z.literal("email"),
    args: z.object({ value: DynamicStringSchema }).strict(),
  })
  .strict();

// ============================================================================
// 格式化函数（Formatting Functions）
// ============================================================================

/** formatString — 字符串插值（${path} 语法） */
export const FormatStringFnSchema = z
  .object({
    call: z.literal("formatString"),
    args: z.object({ value: DynamicStringSchema }).strict(),
  })
  .strict();

/** formatNumber — 数字格式化（小数位数 + 分组） */
export const FormatNumberFnSchema = z
  .object({
    call: z.literal("formatNumber"),
    args: z
      .object({
        value: DynamicNumberSchema,
        decimals: DynamicNumberSchema.optional(),
        grouping: DynamicBooleanSchema.optional(),
      })
      .strict(),
  })
  .strict();

/** formatCurrency — 货币格式化 */
export const FormatCurrencyFnSchema = z
  .object({
    call: z.literal("formatCurrency"),
    args: z
      .object({
        value: DynamicNumberSchema,
        currency: DynamicStringSchema,
        decimals: DynamicNumberSchema.optional(),
        grouping: DynamicBooleanSchema.optional(),
      })
      .strict(),
  })
  .strict();

/** formatDate — 日期格式化（Unicode TR35 模式） */
export const FormatDateFnSchema = z
  .object({
    call: z.literal("formatDate"),
    args: z
      .object({
        value: z.unknown(),
        format: DynamicStringSchema,
      })
      .strict(),
  })
  .strict();

/** pluralize — CLDR 复数规则匹配 */
export const PluralizeFnSchema = z
  .object({
    call: z.literal("pluralize"),
    args: z
      .object({
        value: DynamicNumberSchema,
        zero: DynamicStringSchema.optional(),
        one: DynamicStringSchema.optional(),
        two: DynamicStringSchema.optional(),
        few: DynamicStringSchema.optional(),
        many: DynamicStringSchema.optional(),
        other: DynamicStringSchema,
      })
      .strict(),
  })
  .strict();

// ============================================================================
// 操作函数（Action Functions）
// ============================================================================

/** openUrl — 在浏览器中打开 URL */
export const OpenUrlFnSchema = z
  .object({
    call: z.literal("openUrl"),
    args: z.object({ url: z.string().url("URL 格式无效") }).strict(),
  })
  .strict();

// ============================================================================
// 逻辑函数（Logical Functions）
// ============================================================================

/** and — 逻辑与 */
export const AndFnSchema = z
  .object({
    call: z.literal("and"),
    args: z
      .object({
        values: z.array(DynamicBooleanSchema).min(2, "and 至少需要 2 个参数"),
      })
      .strict(),
  })
  .strict();

/** or — 逻辑或 */
export const OrFnSchema = z
  .object({
    call: z.literal("or"),
    args: z
      .object({
        values: z.array(DynamicBooleanSchema).min(2, "or 至少需要 2 个参数"),
      })
      .strict(),
  })
  .strict();

/** not — 逻辑非 */
export const NotFnSchema = z
  .object({
    call: z.literal("not"),
    args: z.object({ value: DynamicBooleanSchema }).strict(),
  })
  .strict();

// ============================================================================
// 系统函数（System Function）
// ============================================================================

/** @index — 模板列表中当前项的 0 基索引 */
export const IndexFnSchema = z
  .object({
    call: z.literal("@index"),
    args: z.object({ offset: DynamicNumberSchema.optional() }).strict(),
  })
  .strict();

// ============================================================================
// 函数鉴别联合
// ============================================================================

/**
 * 任意函数 Zod 模式
 *
 * 使用 discriminatedUnion 通过 call 字段值鉴别函数类型。
 */
export const AnyFunctionSchema = z.discriminatedUnion("call", [
  RequiredFnSchema,
  RegexFnSchema,
  LengthFnSchema,
  NumericFnSchema,
  EmailFnSchema,
  FormatStringFnSchema,
  FormatNumberFnSchema,
  FormatCurrencyFnSchema,
  FormatDateFnSchema,
  PluralizeFnSchema,
  OpenUrlFnSchema,
  AndFnSchema,
  OrFnSchema,
  NotFnSchema,
]);
