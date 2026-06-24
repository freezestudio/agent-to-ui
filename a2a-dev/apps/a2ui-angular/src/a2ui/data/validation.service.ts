/**
 * A2UI 客户端校验服务
 *
 * 实现 v1.0 协议的 CheckRule 校验系统。
 * 使用 FunctionInvoker 执行 CheckRule.condition 中的函数调用，
 * 在用户交互时触发校验并报告错误消息。
 *
 * @packageDocumentation
 */

import { Injectable, inject } from "@angular/core";
import { FunctionInvoker } from "@a2a-dev/a2ui-renderer";
import { FunctionCallSchema } from "@a2a-dev/a2ui-core";
import { DataBindingService } from "./data-binding.service.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable({ providedIn: "root" })
export class ValidationService {
  private binding = inject(DataBindingService);

  /**
   * 执行一组校验规则
   *
   * @param checks 校验规则数组（来自组件 props 的 checks 字段）
   * @param surfaceId 表面 ID（用于解析 DataBinding）
   * @returns 校验结果
   */
  async validate(checks: unknown, surfaceId: string): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!Array.isArray(checks)) {
      return { valid: true, errors: [] };
    }

    for (const check of checks) {
      if (!check || typeof check !== "object") continue;
      const rule = check as { condition?: unknown; message?: string };
      if (!rule.condition || !rule.message) continue;

      try {
        const conditionValue = this.binding.resolveValue(rule.condition, surfaceId);

        // condition 可能是 FunctionCall { call, args }
        if (conditionValue && typeof conditionValue === "object" && "call" in (conditionValue as any)) {
          const fc = conditionValue as { call: string; args?: Record<string, unknown> };
          const fnInvoker = new FunctionInvoker();
          fnInvoker.registerBuiltins();
          const result = await fnInvoker.call(fc);
          if (!result) {
            errors.push(rule.message);
          }
        }
      } catch (err) {
        console.warn(`校验执行失败:`, err);
        errors.push(rule.message ?? "校验失败");
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
