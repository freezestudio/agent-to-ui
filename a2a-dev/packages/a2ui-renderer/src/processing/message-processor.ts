/**
 * A2UI 消息处理器（MessageProcessor）
 *
 * 核心消息处理引擎。将 A2UI 协议消息解析并应用到 SurfaceGroupModel。
 * 这是渲染器的入口点——所有来自服务器的 A2UI 消息都经过此处理器。
 *
 * 处理流程：
 *   createSurface → 创建 Surface → 可选初始组件/数据
 *   updateComponents → 更新组件属性
 *   updateDataModel → 更新数据模型
 *   deleteSurface → 删除 Surface
 *
 * @packageDocumentation
 */

import pino from "pino";
import type {
  A2uiMessage,
  CreateSurfaceMessage,
  UpdateComponentsMessage,
  UpdateDataModelMessage,
  DeleteSurfaceMessage,
  A2uiClientAction,
} from "@a2a-dev/a2ui-core";

import { SurfaceGroupModel } from "../state/surface-group-model.js";
import { SurfaceModel } from "../state/surface-model.js";

const logger = pino({ name: "a2ui:message-processor" });

/**
 * MessageProcessor — 消息处理引擎
 *
 * 解析 A2UI 消息并更新 SurfaceGroupModel 的状态。
 * 每条消息按顺序处理，保证状态一致性。
 */
export class MessageProcessor {
  /** 全局 surface 组模型 */
  readonly model: SurfaceGroupModel;

  /**
   * @param actionHandler 可选的全局 action 处理器
   */
  constructor(private actionHandler?: (action: A2uiClientAction) => void) {
    this.model = new SurfaceGroupModel();

    // 如果有全局 action 处理器，订阅全局 action 事件
    if (actionHandler) {
      this.model.onAction.subscribe(actionHandler);
    }

    logger.info("MessageProcessor 初始化完成");
  }

  /**
   * 处理一组 A2UI 消息
   *
   * 消息按顺序逐个处理。单条消息失败不影响后续消息处理。
   * 这是协议规定的行为——消息列表不是事务单元。
   *
   * @param messages A2UI 消息数组
   */
  processMessages(messages: A2uiMessage[]): void {
    logger.info({ count: messages.length }, "开始处理 A2UI 消息");

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      try {
        if ("createSurface" in msg) {
          this.processCreateSurface(msg.createSurface as CreateSurfaceMessage & {
            components?: unknown[];
            dataModel?: Record<string, unknown>;
          });
        } else if ("updateComponents" in msg) {
          this.processUpdateComponents(msg.updateComponents as UpdateComponentsMessage);
        } else if ("updateDataModel" in msg) {
          this.processUpdateDataModel(msg.updateDataModel as UpdateDataModelMessage);
        } else if ("deleteSurface" in msg) {
          this.processDeleteSurface(msg.deleteSurface as DeleteSurfaceMessage);
        } else if ("actionResponse" in msg) {
          logger.debug({ index: i }, "actionResponse 消息暂由外层处理");
        } else if ("callFunction" in msg) {
          logger.debug({ index: i }, "callFunction 消息暂由外层处理");
        }
      } catch (error) {
        logger.error({ index: i, error }, "处理消息失败，继续下一条");
      }
    }

    logger.info({ count: messages.length }, "A2UI 消息处理完成");
  }

  /**
   * 处理 createSurface 消息
   *
   * v1.0 支持单消息 UI 实例化：直接在 createSurface 中嵌入
   * components 和 dataModel 字段。
   */
  private processCreateSurface(
    payload: CreateSurfaceMessage & {
      components?: unknown[];
      dataModel?: Record<string, unknown>;
    },
  ): void {
    logger.info({ surfaceId: payload.surfaceId }, "处理 createSurface");

    const surface = new SurfaceModel(payload.surfaceId, payload.sendDataModel);
    this.model.addSurface(surface);

    // v1.0 单消息 UI 实例化：内联组件
    if (payload.components) {
      logger.debug({ count: payload.components.length }, "处理内联组件");
      for (const comp of payload.components) {
        const def = comp as { id: string; component: string };
        if (def.id && def.component) {
          const { id, component, ...props } = def;
          surface.componentsModel.addOrUpdate(id, component, props);
        }
      }
    }

    // v1.0 单消息 UI 实例化：内联数据
    if (payload.dataModel) {
      surface.dataModel.set("/", payload.dataModel);
    }
  }

  /** 处理 updateComponents 消息 */
  private processUpdateComponents(payload: UpdateComponentsMessage): void {
    const surface = this.model.getSurface(payload.surfaceId);
    if (!surface) {
      logger.warn({ surfaceId: payload.surfaceId }, "updateComponents：Surface 不存在");
      return;
    }

    logger.debug({ surfaceId: payload.surfaceId, count: payload.components.length }, "处理 updateComponents");

    for (const comp of payload.components) {
      const def = comp as { id: string; component: string } & Record<string, unknown>;
      if (def.id && def.component) {
        const { id, component, ...props } = def;
        surface.componentsModel.addOrUpdate(id, component, props);
      }
    }
  }

  /** 处理 updateDataModel 消息 */
  private processUpdateDataModel(payload: UpdateDataModelMessage): void {
    const surface = this.model.getSurface(payload.surfaceId);
    if (!surface) {
      logger.warn({ surfaceId: payload.surfaceId }, "updateDataModel：Surface 不存在");
      return;
    }

    const path = payload.path ?? "/";
    logger.debug({ surfaceId: payload.surfaceId, path }, "处理 updateDataModel");
    surface.dataModel.set(path, payload.value);
  }

  /** 处理 deleteSurface 消息 */
  private processDeleteSurface(payload: DeleteSurfaceMessage): void {
    logger.info({ surfaceId: payload.surfaceId }, "处理 deleteSurface");
    this.model.deleteSurface(payload.surfaceId);
  }
}
