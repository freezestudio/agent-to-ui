/**
 * A2UI Surface 组件模型（SurfaceComponentsModel）
 *
 * 管理 surface 内所有组件的邻接表。
 * 使用扁平 Map（而非嵌套树）存储组件，通过 children 引用建立父子关系。
 * 这是 A2UI 协议的设计选择——扁平列表便于增量更新。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { EventSource } from "../common/events.js";
import { ComponentModel } from "./component-model.js";

const logger = pino({ name: "a2ui:surface-components" });

/**
 * SurfaceComponentsModel — 组件邻接表管理
 *
 * 提供组件的增删查改操作。每个组件通过 ID 唯一标识，
 * 容器组件通过 children 字段引用其他组件的 ID。
 */
export class SurfaceComponentsModel {
  /** 组件名 → ComponentModel 映射 */
  private components = new Map<string, ComponentModel>();
  /** 组件创建事件 */
  readonly onCreated = new EventSource<ComponentModel>();
  /** 组件删除事件 */
  readonly onDeleted = new EventSource<string>();

  /**
   * 获取指定 ID 的组件
   * @param id 组件 ID
   * @returns 组件实例，不存在返回 undefined
   */
  get(id: string): ComponentModel | undefined {
    return this.components.get(id);
  }

  /** 获取所有组件 */
  getAll(): Map<string, ComponentModel> {
    return this.components;
  }

  /**
   * 添加或更新组件
   *
   * 如果组件已存在，更新其属性。
   * 如果组件不存在，创建新组件。
   *
   * @param id 组件 ID
   * @param type 组件类型名
   * @param properties 组件属性
   */
  addOrUpdate(id: string, type: string, properties: Record<string, unknown>): void {
    if (this.components.has(id)) {
      // 更新已有组件
      this.components.get(id)!.setProperties(properties);
      logger.debug({ id, type }, "组件已存在，更新属性");
    } else {
      // 创建新组件
      const model = new ComponentModel(id, type, properties);
      this.components.set(id, model);
      logger.info({ id, type }, "组件创建");
      this.onCreated.emit(model);
    }
  }

  /**
   * 删除组件
   * @param id 要删除的组件 ID
   */
  remove(id: string): void {
    const comp = this.components.get(id);
    if (comp) {
      comp.dispose();
      this.components.delete(id);
      logger.debug({ id }, "组件删除");
      this.onDeleted.emit(id);
    }
  }

  /** 获取组件数量 */
  get size(): number {
    return this.components.size;
  }

  /** 清理所有组件 */
  dispose(): void {
    for (const comp of this.components.values()) {
      comp.dispose();
    }
    this.components.clear();
    logger.debug("所有组件已清理");
  }
}
