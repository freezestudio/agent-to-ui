/**
 * A2UI v1.0 函数 Zod 模式测试
 *
 * 测试 14 个内置函数的运行时验证行为。
 */

import { describe, it, expect } from "vite-plus/test";
import {
  RequiredFnSchema,
  RegexFnSchema,
  LengthFnSchema,
  EmailFnSchema,
  AndFnSchema,
  OrFnSchema,
  NotFnSchema,
  OpenUrlFnSchema,
  FormatDateFnSchema,
} from "../schema/catalog/functions.js";

describe("RequiredFn", () => {
  it("应该验证合法的 required 调用", () => {
    const result = RequiredFnSchema.safeParse({ call: "required", args: { value: "" } });
    expect(result.success).toBe(true);
  });
});

describe("RegexFn", () => {
  it("应该验证合法的 regex 调用", () => {
    const result = RegexFnSchema.safeParse({
      call: "regex",
      args: { value: "hello", pattern: "^h" },
    });
    expect(result.success).toBe(true);
  });
});

describe("EmailFn", () => {
  it("应该验证合法的 email 调用", () => {
    const result = EmailFnSchema.safeParse({
      call: "email",
      args: { value: "test@example.com" },
    });
    expect(result.success).toBe(true);
  });
});

describe("AndFn", () => {
  it("应该拒绝少于 2 个参数", () => {
    const result = AndFnSchema.safeParse({ call: "and", args: { values: [true] } });
    expect(result.success).toBe(false);
  });
});

describe("OrFn", () => {
  it("应该拒绝少于 2 个参数", () => {
    const result = OrFnSchema.safeParse({ call: "or", args: { values: [true] } });
    expect(result.success).toBe(false);
  });
});

describe("NotFn", () => {
  it("应该验证合法的 not 调用", () => {
    const result = NotFnSchema.safeParse({ call: "not", args: { value: true } });
    expect(result.success).toBe(true);
  });
});

describe("OpenUrlFn", () => {
  it("应该拒绝非 URL", () => {
    const result = OpenUrlFnSchema.safeParse({ call: "openUrl", args: { url: "not-a-url" } });
    expect(result.success).toBe(false);
  });
});

describe("FormatDateFn", () => {
  it("应该验证合法的 formatDate 调用", () => {
    const result = FormatDateFnSchema.safeParse({
      call: "formatDate",
      args: { value: "2026-01-01", format: "yyyy-MM-dd" },
    });
    expect(result.success).toBe(true);
  });
});
