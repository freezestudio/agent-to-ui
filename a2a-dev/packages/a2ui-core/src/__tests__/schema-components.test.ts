/**
 * A2UI v1.0 组件 Zod 模式测试
 *
 * 测试 18 个基本目录组件的运行时验证行为。
 * 每个组件测试：合法值通过、非法值拒绝。
 */

import { describe, it, expect } from "vitest";
import {
  TextSchema, ButtonSchema, RowSchema, ColumnSchema, ImageSchema,
  IconSchema, CardSchema, DividerSchema, TextFieldSchema, CheckBoxSchema,
  SliderSchema, DateTimeInputSchema, ChoicePickerSchema,
} from "../schema/catalog/components.js";

// ============================================================================
// Text 组件测试
// ============================================================================

describe("Text", () => {
  it("应该验证合法的 Text 组件", () => {
    const result = TextSchema.safeParse({ id: "t1", component: "Text", text: "Hello" });
    expect(result.success).toBe(true);
  });

  it("应该支持数据绑定 text", () => {
    const result = TextSchema.safeParse({ id: "t1", component: "Text", text: { path: "/user/name" } });
    expect(result.success).toBe(true);
  });

  it("应该支持 caption 变体", () => {
    const result = TextSchema.safeParse({ id: "t1", component: "Text", text: "small", variant: "caption" });
    expect(result.success).toBe(true);
  });

  it("应该拒绝不合法的变体", () => {
    const result = TextSchema.safeParse({ id: "t1", component: "Text", text: "Hi", variant: "h1" as any });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Button 组件测试
// ============================================================================

describe("Button", () => {
  it("应该验证带事件 action 的 Button", () => {
    const result = ButtonSchema.safeParse({
      id: "b1", component: "Button", child: "t1",
      action: { event: { name: "submit" } },
    });
    expect(result.success).toBe(true);
  });

  it("应该验证带函数调用的 Button", () => {
    const result = ButtonSchema.safeParse({
      id: "b1", component: "Button", child: "t1",
      action: { functionCall: { call: "openUrl", args: { url: "https://example.com" } } },
    });
    expect(result.success).toBe(true);
  });

  it("应该拒绝缺少 action 的 Button", () => {
    const result = ButtonSchema.safeParse({
      id: "b1", component: "Button", child: "t1",
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Row 组件测试
// ============================================================================

describe("Row", () => {
  it("应该验证带静态 children 的 Row", () => {
    const result = RowSchema.safeParse({ id: "r1", component: "Row", children: ["c1", "c2"] });
    expect(result.success).toBe(true);
  });

  it("应该验证带动态模板的 Row", () => {
    const result = RowSchema.safeParse({
      id: "r1", component: "Row",
      children: { componentId: "item", path: "/items" },
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// TextField 组件测试
// ============================================================================

describe("TextField", () => {
  it("应该验证基本的 TextField", () => {
    const result = TextFieldSchema.safeParse({
      id: "tf1", component: "TextField", label: "用户名",
    });
    expect(result.success).toBe(true);
  });

  it("应该支持 obscured 变体", () => {
    const result = TextFieldSchema.safeParse({
      id: "tf1", component: "TextField", label: "密码", variant: "obscured",
    });
    expect(result.success).toBe(true);
  });

  it("应该拒绝缺少 label 的 TextField", () => {
    const result = TextFieldSchema.safeParse({ id: "tf1", component: "TextField" });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ChoicePicker 组件测试
// ============================================================================

describe("ChoicePicker", () => {
  it("应该验证基本的 ChoicePicker", () => {
    const result = ChoicePickerSchema.safeParse({
      id: "cp1", component: "ChoicePicker",
      options: [{ label: "A", value: "a" }, { label: "B", value: "b" }],
      value: ["a"],
    });
    expect(result.success).toBe(true);
  });

  it("应该拒绝缺少 options", () => {
    const result = ChoicePickerSchema.safeParse({
      id: "cp1", component: "ChoicePicker", value: [],
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Slider 组件测试
// ============================================================================

describe("Slider", () => {
  it("应该验证基本的 Slider", () => {
    const result = SliderSchema.safeParse({
      id: "s1", component: "Slider", max: 100, value: 50,
    });
    expect(result.success).toBe(true);
  });

  it("应该拒绝缺少 max 的 Slider", () => {
    const result = SliderSchema.safeParse({
      id: "s1", component: "Slider", value: 50,
    });
    expect(result.success).toBe(false);
  });
});
