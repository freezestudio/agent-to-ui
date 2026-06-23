/**
 * A2UI 组件模型（ComponentModel）
 *
 * 表示一个 UI 组件实例的状态。
 * 包含组件 ID、类型名和属性映射。
 * 属性变更时通过 onUpdated 事件通知。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { EventSource } from "../common/events.js";

const logger = pino({ name: "a2ui:component-model" });

/**
 * ComponentModel — 单个组件实例
 *
 * 存储组件的运行时状态。组件属性是扁平键值对，
 * 渲染器根据 component.type 查找对应的框架组件进行渲染。
 */
export class ComponentModel {
  /** 组件在 surface 内的唯一标识符 */
  readonly id: string;
  /** 组件类型名（对应 catalog 中的组件名） */
  readonly type: string;
  /** 属性变更事件源 */
  readonly onUpdated = new EventSource<ComponentModel>();

  /** 组件属性 */
  private _properties: Record<string, unknown>;

  /**
   * @param id 组件 ID
   * @param type 组件类型名
   * @param properties 初始属性
   */
  constructor(id: string, type: string, properties?: Record<string, unknown>) {
    this.id = id;
    this.type = type;
    this._properties = { ...properties };
    logger.debug({ id, type, props: properties }, "组件创建");
  }

  /** 获取当前属性 */
  get properties(): Record<string, unknown> {
    return this._properties;
  }

  /**
   * 合并更新属性
   * 新属性会与现有属性合并（浅合并）
   */
  setProperties(props: Record<string, unknown>): void {
    this._properties = { ...this._properties, ...props };
    logger.debug({ id: this.id, props }, "组件属性更新");
    this.onUpdated.emit(this);
  }

  /** 清理资源 */
  dispose(): void {
    this.onUpdated.dispose();
  }
}
