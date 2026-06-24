/**
 * A2UI 数据绑定解析服务
 *
 * 解析 DynamicValue 类型的属性值：
 * - 字面量: 原样返回
 * - DataBinding ({path: "/..."}): 从 Surface 的 DataModel 中通过 JSON Pointer 获取
 * - FunctionCall ({call: "...", args: {...}}): 调用客户端函数
 *
 * @packageDocumentation
 */

import { Injectable, inject } from "@angular/core";
import { A2uiRendererService } from "../renderer/a2ui-renderer.service.js";

@Injectable({ providedIn: "root" })
export class DataBindingService {
  private renderer = inject(A2uiRendererService);

  /**
   * 解析单个 DynamicValue
   *
   * @param value 原始值（字面量、DataBinding 或 FunctionCall）
   * @param surfaceId 表面 ID（用于从 DataModel 中取值）
   * @returns 解析后的实际值
   */
  resolveValue(value: unknown, surfaceId: string): unknown {
    if (this.isDataBinding(value)) {
      return this.resolveDataBinding(value, surfaceId);
    }
    if (this.isFunctionCall(value)) {
      // FunctionCall 暂不实现客户端函数调用
      console.warn(`数据绑定: 函数调用暂不支持 "${(value as any).call}"`);
      return null;
    }
    return value;
  }

  /**
   * 解析 DynamicString（确保返回字符串）
   */
  resolveString(value: unknown, surfaceId: string): string {
    const resolved = this.resolveValue(value, surfaceId);
    if (resolved === null || resolved === undefined) return "";
    return String(resolved);
  }

  /**
   * 解析 DynamicNumber（确保返回数字）
   */
  resolveNumber(value: unknown, surfaceId: string): number {
    const resolved = this.resolveValue(value, surfaceId);
    if (typeof resolved === "number") return resolved;
    const n = Number(resolved);
    return isNaN(n) ? 0 : n;
  }

  /**
   * 解析 DynamicBoolean（确保返回布尔值）
   */
  resolveBoolean(value: unknown, surfaceId: string): boolean {
    const resolved = this.resolveValue(value, surfaceId);
    return Boolean(resolved);
  }

  /**
   * 检查是否为 DataBinding 对象: {path: string}
   */
  private isDataBinding(value: unknown): boolean {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "path" in (value as Record<string, unknown>)
    );
  }

  /**
   * 检查是否为 FunctionCall 对象: {call: string}
   */
  private isFunctionCall(value: unknown): boolean {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "call" in (value as Record<string, unknown>)
    );
  }

  /**
   * 通过 JSON Pointer 路径从 DataModel 获取值
   */
  /**
   * 解析 DataBinding 的路径（如果值为绑定对象）
   * 用于组件写回 DataModel 时确定写入路径
   *
   * @param value 属性值
   * @returns JSON Pointer 路径，如果不是绑定则返回 null
   */
  resolveBindingPath(value: unknown): string | null {
    if (this.isDataBinding(value)) {
      return (value as { path: string }).path;
    }
    return null;
  }

  private resolveDataBinding(binding: unknown, surfaceId: string): unknown {
    const path = (binding as { path: string }).path;
    const surface = this.renderer.getSurface(surfaceId);
    if (!surface) {
      console.warn(`数据绑定: Surface "${surfaceId}" 不存在`);
      return null;
    }
    const value = surface.dataModel.resolve(path);
    console.log(`[DataBinding] ${path} →`, value);
    return value;
  }
}
