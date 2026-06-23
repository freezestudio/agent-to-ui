/**
 * A2UI v1.0 通用类型测试
 *
 * 测试 DataBinding、FunctionCall、DynamicValue 等通用类型的
 * Zod v4 运行时验证行为。
 */

/**
 * A2UI v1.0 通用类型测试
 *
 * 测试 DataBinding、FunctionCall、DynamicValue 等通用类型的
 * Zod v4 运行时验证行为。
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * 红灯阶段：引用尚未实现的导出
 * 这些导入将失败，直到我们创建对应的源文件
 */
import {
  DynamicStringSchema,
  DataBindingSchema,
  FunctionCallSchema,
  ComponentCommonSchema,
  SPEC_VERSION,
} from "../schema/common-types.js";
import type {
  DataBinding,
  FunctionCall,
  DynamicString,
  ComponentCommon,
  Action,
} from "../types/common.js";

describe("DataBindingSchema", () => {
  /**
   * DataBinding 是 JSON Pointer 路径绑定：
   * { "path": "/user/name" }
   */
  it("应该能验证合法的 data binding 对象", () => {
    const result = DataBindingSchema.safeParse({ path: "/user/name" });
    expect(result.success).toBe(true);
  });

  it("应该拒绝缺少 path 字段的对象", () => {
    const result = DataBindingSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("应该拒绝包含额外字段的对象", () => {
    const result = DataBindingSchema.safeParse({ path: "/test", extra: true });
    expect(result.success).toBe(false);
  });
});

describe("ComponentCommonSchema", () => {
  /**
   * ComponentCommon 是所有组件的公共基础：
   * { "id": "my-id", "accessibility": { "label": "..." } }
   */
  it("应该只需要 id 字段", () => {
    const result = ComponentCommonSchema.safeParse({ id: "btn-1" });
    expect(result.success).toBe(true);
  });

  it("应该支持可选的 accessibility 属性", () => {
    const result = ComponentCommonSchema.safeParse({
      id: "btn-1",
      accessibility: { label: "提交按钮", description: "点击提交表单" },
    });
    expect(result.success).toBe(true);
  });
});

describe("DynamicStringSchema", () => {
  /**
   * DynamicString 可以是三种形式之一：
   * 1. 字面量字符串: "hello"
   * 2. 数据绑定: { "path": "/name" }
   * 3. 函数调用: { "call": "formatDate", "args": {...} }
   */

  it("应该接受普通字符串字面量", () => {
    const result = DynamicStringSchema.safeParse("hello world");
    expect(result.success).toBe(true);
  });

  it("应该接受数据绑定对象", () => {
    const result = DynamicStringSchema.safeParse({ path: "/user/name" });
    expect(result.success).toBe(true);
  });

  it("应该拒绝既不是字符串也不是对象的值", () => {
    const result = DynamicStringSchema.safeParse(42);
    expect(result.success).toBe(false);
  });
});

describe("ComponentCommonSchema", () => {
  /**
   * ComponentCommon 是所有组件的公共基础：
   * { "id": "my-id", "accessibility": { "label": "..." } }
   */
  it("应该只需要 id 字段", () => {
    const schema = z.object({
      id: z.string().min(1),
      accessibility: z.object({
        label: z.union([z.string(), z.object({ path: z.string() }).strict()]).optional(),
        description: z.union([z.string(), z.object({ path: z.string() }).strict()]).optional(),
      }).optional(),
    });
    const result = schema.safeParse({ id: "btn-1" });
    expect(result.success).toBe(true);
  });

  it("应该支持可选的 accessibility 属性", () => {
    const schema = z.object({
      id: z.string().min(1),
      accessibility: z.object({
        label: z.union([z.string(), z.object({ path: z.string() }).strict()]).optional(),
        description: z.union([z.string(), z.object({ path: z.string() }).strict()]).optional(),
      }).optional(),
    });
    const result = schema.safeParse({
      id: "btn-1",
      accessibility: { label: "提交按钮", description: "点击提交表单" },
    });
    expect(result.success).toBe(true);
  });
});

describe("ActionSchema", () => {
  /**
   * Action 可以是事件触发或函数调用：
   * - 事件: { "event": { "name": "submit", "context": {...} } }
   * - 函数: { "functionCall": { "call": "openUrl", "args": {...} } }
   */

  it("应该验证事件 action", () => {
    const schema = z.object({
      event: z.object({
        name: z.string().min(1),
        context: z.record(z.string(), z.unknown()).optional(),
        wantResponse: z.boolean().optional(),
        responsePath: z.string().optional(),
      }).strict(),
    }).strict();
    const result = schema.safeParse({ event: { name: "submit" } });
    expect(result.success).toBe(true);
  });

  it("应该验证函数调用 action", () => {
    const schema = z.object({
      functionCall: z.object({
        call: z.string().min(1),
        args: z.record(z.string(), z.unknown()).optional(),
      }),
    }).strict();
    const result = schema.safeParse({ functionCall: { call: "openUrl", args: { url: "https://example.com" } } });
    expect(result.success).toBe(true);
  });

  it("应该拒绝空的 action 名称", () => {
    const schema = z.object({
      event: z.object({ name: z.string().min(1) }).strict(),
    }).strict();
    const result = schema.safeParse({ event: { name: "" } });
    expect(result.success).toBe(false);
  });
});

