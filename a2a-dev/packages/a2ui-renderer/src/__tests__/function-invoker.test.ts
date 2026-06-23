/**
 * 函数调用器测试
 */
import { describe, it, expect } from "vitest";
import { FunctionInvoker } from "../processing/function-invoker.js";

describe("FunctionInvoker", () => {
  it("required 函数：空值应返回 false", async () => {
    const invoker = new FunctionInvoker();
    invoker.registerBuiltins();
    expect(await invoker.call({ call: "required", args: { value: "" } })).toBe(false);
    expect(await invoker.call({ call: "required", args: { value: "hello" } })).toBe(true);
    expect(await invoker.call({ call: "required", args: { value: null } })).toBe(false);
    expect(await invoker.call({ call: "required", args: { value: undefined } })).toBe(false);
  });

  it("email 函数：验证邮箱格式", async () => {
    const invoker = new FunctionInvoker();
    invoker.registerBuiltins();
    expect(await invoker.call({ call: "email", args: { value: "test@example.com" } })).toBe(true);
    expect(await invoker.call({ call: "email", args: { value: "bad-email" } })).toBe(false);
  });

  it("regex 函数：正则匹配", async () => {
    const invoker = new FunctionInvoker();
    invoker.registerBuiltins();
    expect(await invoker.call({ call: "regex", args: { value: "abc123", pattern: "^[a-z]+\\d+$" } })).toBe(true);
    expect(await invoker.call({ call: "regex", args: { value: "ABC", pattern: "^[a-z]+$" } })).toBe(false);
  });

  it("length 函数：长度范围校验", async () => {
    const invoker = new FunctionInvoker();
    invoker.registerBuiltins();
    expect(await invoker.call({ call: "length", args: { value: "abc", min: 2, max: 5 } })).toBe(true);
    expect(await invoker.call({ call: "length", args: { value: "a", min: 2 } })).toBe(false);
    expect(await invoker.call({ call: "length", args: { value: "abcdef", max: 5 } })).toBe(false);
  });

  it("and/or/not 逻辑函数", async () => {
    const invoker = new FunctionInvoker();
    invoker.registerBuiltins();
    expect(await invoker.call({ call: "and", args: { values: [true, true] } })).toBe(true);
    expect(await invoker.call({ call: "and", args: { values: [true, false] } })).toBe(false);
    expect(await invoker.call({ call: "or", args: { values: [false, true] } })).toBe(true);
    expect(await invoker.call({ call: "or", args: { values: [false, false] } })).toBe(false);
    expect(await invoker.call({ call: "not", args: { value: true } })).toBe(false);
    expect(await invoker.call({ call: "not", args: { value: false } })).toBe(true);
  });

  it("应抛出错误用于未知函数", async () => {
    const invoker = new FunctionInvoker();
    await expect(invoker.call({ call: "unknown" })).rejects.toThrow("未知函数");
  });
});
