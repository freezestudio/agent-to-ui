/**
 * A2UI Surface 组模型（SurfaceGroupModel）
 *
 * 全局 surface 生命周期管理器。
 * 维护所有活跃的 surface，提供创建、删除、查询操作。
 * 将各个 surface 的 action 事件汇聚到统一的 onAction 事件源。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { EventSource } from "../common/events.js";
import { SurfaceModel } from "./surface-model.js";
import type { A2uiClientAction } from "@a2a-dev/a2ui-core";

const logger = pino({ name: "a2ui:surface-group" });

/**
 * SurfaceGroupModel — 全局 surface 管理器
 *
 * 在渲染器生命周期内管理所有 surface。
 * surfaceId 必须在全局范围内唯一。
 */
export class SurfaceGroupModel {
  /** surfaceId → SurfaceModel 映射 */
  private surfaces = new Map<string, SurfaceModel>();
  /** surface 创建事件 */
  readonly onSurfaceCreated = new EventSource<SurfaceModel>();
  /** surface 删除事件 */
  readonly onSurfaceDeleted = new EventSource<string>();
  /** 统一 action 事件（汇聚所有 surface 的 action） */
  readonly onAction = new EventSource<A2uiClientAction>();

  /** surface 订阅的取消函数映射 */
  private unsubscribers = new Map<string, () => void>();

  /**
   * 获取指定 ID 的 surface
   */
  getSurface(id: string): SurfaceModel | undefined {
    return this.surfaces.get(id);
  }

  /** 获取所有活跃的 surface */
  getAllSurfaces(): SurfaceModel[] {
    return Array.from(this.surfaces.values());
  }

  /**
   * 添加 surface
   *
   * 自动将 surface 的 action 事件转发到全局 onAction。
   * 如果 surfaceId 已存在，不重复添加。
   *
   * @param surface 要添加的 SurfaceModel
   */
  addSurface(surface: SurfaceModel): void {
    if (this.surfaces.has(surface.id)) {
      logger.warn({ surfaceId: surface.id }, "Surface 已存在，跳过重复添加");
      return;
    }

    this.surfaces.set(surface.id, surface);

    // 转发 action 事件
    const unsub = surface.onAction.subscribe((action) => {
      this.onAction.emit(action);
    });
    this.unsubscribers.set(surface.id, unsub);

    logger.info({ surfaceId: surface.id }, "Surface 添加到组");
    this.onSurfaceCreated.emit(surface);
  }

  /**
   * 删除 surface
   *
   * 清理 surface 的订阅和资源。
   *
   * @param id 要删除的 surface ID
   */
  deleteSurface(id: string): void {
    const surface = this.surfaces.get(id);
    if (!surface) {
      logger.warn({ surfaceId: id }, "尝试删除不存在的 Surface");
      return;
    }

    // 取消订阅事件转发
    const unsub = this.unsubscribers.get(id);
    if (unsub) {
      unsub();
      this.unsubscribers.delete(id);
    }

    surface.dispose();
    this.surfaces.delete(id);

    logger.info({ surfaceId: id }, "Surface 从组删除");
    this.onSurfaceDeleted.emit(id);
  }

  /** 清理所有 surface */
  dispose(): void {
    logger.info("清理所有 Surface");
    for (const id of [...this.surfaces.keys()]) {
      this.deleteSurface(id);
    }
  }
}
