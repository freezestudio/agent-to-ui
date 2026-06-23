/**
 * A2UI 数据模型（DataModel）
 *
 * 基于 JSON Pointer（RFC 6901）路径的树状数据存储。
 * 管理 surface 的应用状态，支持路径级别的响应式更新。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { EventSource } from "../common/events.js";

/** 数据模型日志记录器 */
const logger = pino({ name: "a2ui:data-model" });

/**
 * 数据模型变更事件
 */
export interface DataModelChange {
  /** 变更的 JSON Pointer 路径 */
  path: string;
  /** 变更后的值 */
  value: unknown;
}

/**
 * DataModel — 树状数据模型
 *
 * 使用惰性初始化的嵌套对象树存储数据。
 * 支持通过 JSON Pointer 路径读写数据。
 * 每次变更通过 onUpdated 事件通知订阅者。
 */
export class DataModel {
  /** 根数据对象 */
  private root: unknown = {};
  /** 变更事件源 */
  readonly onUpdated = new EventSource<DataModelChange>();

  /**
   * 创建数据模型
   * @param initialData 可选的初始数据
   */
  constructor(initialData?: Record<string, unknown>) {
    if (initialData) {
      this.root = structuredClone(initialData);
      logger.debug({ data: initialData }, "数据模型初始化");
    }
  }

  /**
   * 通过 JSON Pointer 路径解析值
   *
   * @param path JSON Pointer 路径，如 "/user/name" 或 "/"（返回根对象）
   * @returns 路径对应的值，不存在返回 undefined
   *
   * @example
   * ```ts
   * dm.set("/user/name", "Alice");
   * dm.resolve("/user/name"); // "Alice"
   * dm.resolve("/"); // { user: { name: "Alice" } }
   * ```
   */
  resolve(path: string): unknown {
    if (path === "/" || !path) return this.root;

    const parts = path.split("/").filter(Boolean);
    let current: unknown = this.root;

    for (const part of parts) {
      if (current && typeof current === "object" && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[part];
      } else if (Array.isArray(current)) {
        const idx = parseInt(part, 10);
        current = isNaN(idx) ? undefined : current[idx];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * 设置路径上的值
   *
   * 自动创建路径上不存在的中间对象。
   * 如果 value 为 undefined，删除路径上的键。
   * 每次设置后发射 onUpdated 事件。
   *
   * @param path JSON Pointer 路径
   * @param value 要设置的值（undefined 表示删除）
   */
  set(path: string, value: unknown): void {
    if (path === "/" || !path) {
      this.root = value;
    } else {
      const parts = path.split("/").filter(Boolean);
      let current: Record<string, unknown> = this.root as Record<string, unknown>;

      // 遍历到父节点
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      const lastKey = parts[parts.length - 1];
      if (value === undefined) {
        delete current[lastKey];
        logger.debug({ path, action: "delete" }, "数据模型：删除路径");
      } else {
        current[lastKey] = value;
        logger.debug({ path, value }, "数据模型：设置值");
      }
    }

    this.onUpdated.emit({ path, value });
  }

  /**
   * 获取当前数据模型的深拷贝快照
   * 用于发送给服务器（sendDataModel 场景）
   */
  getSnapshot(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(this.root)) as Record<string, unknown>;
  }
}
