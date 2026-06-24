/**
 * A2UI 函数调用器（FunctionInvoker）
 *
 * 实现 v1.0 协议的 14 个内置客户端函数。
 * 函数可以用于校验（CheckRule.condition）、数据转换
 * 和本地操作（如 openUrl）。
 *
 * 调用链：FunctionCall → 参数解析（含 DataBinding 解析）→ 函数执行
 *
 * @packageDocumentation
 */

import pino from "pino";
import type { DataModel } from "../state/data-model.js";

const logger = pino({ name: "a2ui:function-invoker" });

/** 函数实现类型 */
/** 函数实现类型（同步或异步均可） */
export type FunctionImpl = (args: Record<string, unknown>, dataModel?: DataModel) => unknown;

/**
 * FunctionInvoker — 客户端函数调用引擎
 *
 * 管理函数注册、参数解析和函数调用。
 * 内置 14 个基本目录函数。
 */
export class FunctionInvoker {
  /** 函数注册表 */
  private functions = new Map<string, FunctionImpl>();
  /** 数据模型引用（用于解析 DataBinding 参数） */
  private dataModel?: DataModel;

  constructor(dataModel?: DataModel) {
    this.dataModel = dataModel;
  }

  /**
   * 注册自定义函数
   * @param name 函数名
   * @param impl 函数实现
   */
  register(name: string, impl: FunctionImpl): void {
    this.functions.set(name, impl);
    logger.debug({ name }, "函数已注册");
  }

  /**
   * 调用函数
   *
   * 自动解析参数中的 DataBinding 和嵌套 FunctionCall。
   *
   * @param callArgs 函数调用参数 { call, args }
   * @returns 函数执行结果
   */
  async call(callArgs: { call: string; args?: Record<string, unknown> }): Promise<unknown> {
    const fn = this.functions.get(callArgs.call);
    if (!fn) {
      throw new Error(`未知函数: ${callArgs.call}`);
    }
    const resolvedArgs = await this.resolveArgs(callArgs.args ?? {});
    logger.debug({ call: callArgs.call, args: resolvedArgs }, "调用函数");
    return fn(resolvedArgs, this.dataModel);
  }

  /**
   * 递归解析参数中的 DataBinding 和 FunctionCall
   */
  private async resolveArgs(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      resolved[key] = await this.resolveValue(value);
    }
    return resolved;
  }

  /**
   * 递归解析单个值
   *
   * - 普通值 → 原样返回
   * - DataBinding ({ path }) → 从 dataModel 取值
   * - FunctionCall ({ call }) → 递归调用
   */
  private async resolveValue(value: unknown): Promise<unknown> {
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;

      // DataBinding 解析
      if ("path" in obj && Object.keys(obj).length === 1) {
        const resolved = this.dataModel?.resolve(obj.path as string);
        logger.trace({ path: obj.path, resolved }, "解析 DataBinding");
        return resolved;
      }

      // FunctionCall 递归
      if ("call" in obj) {
        return this.call(obj as { call: string; args?: Record<string, unknown> });
      }
    }
    return value;
  }

  // ==================================================================
  // 14 个内置函数注册
  // ==================================================================

  /** 注册所有内置函数 */
  registerBuiltins(): void {
    // ---- 校验函数 ----

    // required: 非 null/非空校验
    this.register("required", (args) => {
      const result = args.value !== null && args.value !== undefined && args.value !== "";
      logger.trace({ value: args.value, result }, "校验: required");
      return result;
    });

    // regex: 正则匹配
    this.register("regex", (args) => {
      const result = new RegExp(args.pattern as string).test(String(args.value ?? ""));
      logger.trace({ value: args.value, pattern: args.pattern, result }, "校验: regex");
      return result;
    });

    // length: 字符串长度范围
    this.register("length", (args) => {
      const len = String(args.value ?? "").length;
      if (args.min !== undefined && len < (args.min as number)) return false;
      if (args.max !== undefined && len > (args.max as number)) return false;
      return true;
    });

    // numeric: 数值范围
    this.register("numeric", (args) => {
      const val = Number(args.value);
      if (isNaN(val)) return false;
      if (args.min !== undefined && val < (args.min as number)) return false;
      if (args.max !== undefined && val > (args.max as number)) return false;
      return true;
    });

    // email: 邮箱格式
    this.register("email", (args) => {
      const result = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(args.value ?? ""));
      logger.trace({ value: args.value, result }, "校验: email");
      return result;
    });

    // ---- 格式化函数 ----

    // formatString: ${path} 插值
    this.register("formatString", (args) => {
      let str = String(args.value ?? "");
      str = str.replace(/\$\{(\/[^}]+)\}/g, (_, p: string) => {
        const resolved = this.dataModel?.resolve(p);
        return String(resolved ?? `$\{${p}}`);
      });
      return str;
    });

    // formatNumber: 数字格式化
    this.register("formatNumber", (args) => {
      const n = Number(args.value);
      const decimals = args.decimals !== undefined ? Number(args.decimals) : undefined;
      const grouping = args.grouping !== false;
      try {
        return decimals !== undefined
          ? n.toFixed(decimals)
          : grouping
            ? n.toLocaleString()
            : String(n);
      } catch {
        return String(n);
      }
    });

    // formatCurrency: 货币格式化
    this.register("formatCurrency", (args) => {
      const n = Number(args.value);
      const currency = String(args.currency ?? "USD");
      try {
        return n.toLocaleString(undefined, { style: "currency", currency });
      } catch {
        return `${currency} ${n}`;
      }
    });

    // formatDate: 日期格式化
    this.register("formatDate", (args) => {
      const d = new Date(String(args.value ?? ""));
      if (isNaN(d.getTime())) return String(args.value);
      try {
        return d.toLocaleDateString();
      } catch {
        return String(args.value);
      }
    });

    // pluralize: 复数规则
    this.register("pluralize", (args) => {
      const count = Number(args.value);
      if (count === 0 && args.zero) return args.zero;
      if (count === 1 && args.one) return args.one;
      return args.other ?? "";
    });

    // ---- 操作函数 ----

    // openUrl: 打开 URL
    this.register("openUrl", (args) => {
      logger.info({ url: args.url }, "操作: openUrl");
      if (typeof window !== "undefined") {
        window.open(String(args.url), "_blank");
      } else {
        logger.warn({ url: args.url }, "非浏览器环境，无法打开 URL");
      }
    });

    // ---- 逻辑函数 ----

    // and: 逻辑与
    this.register("and", (args) => {
      const values = args.values as boolean[];
      return values.every(Boolean);
    });

    // or: 逻辑或
    this.register("or", (args) => {
      const values = args.values as boolean[];
      return values.some(Boolean);
    });

    // not: 逻辑非
    this.register("not", (args) => {
      return !args.value;
    });

    logger.info("14 个内置函数已注册");
  }
}
