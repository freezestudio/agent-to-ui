/**
 * A2UI Surface 模型（SurfaceModel）
 *
 * 表示一个 UI 表面的完整状态。
 * 包含数据模型、组件模型、事件处理器等。
 * 每个表面是一个独立的 UI 区域（如主内容区、侧面板、对话框）。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { EventSource } from "../common/events.js";
import { DataModel } from "./data-model.js";
import { SurfaceComponentsModel } from "./surface-components-model.js";
import type { A2uiClientAction } from "@a2a-dev/a2ui-core";

const logger = pino({ name: "a2ui:surface" });

/**
 * SurfaceModel — 单个 UI 表面状态
 *
 * 协调组件模型、数据模型和 action 分发。
 * Surface 的创建和销毁由 SurfaceGroupModel 管理。
 */
export class SurfaceModel {
  /** 表面唯一标识符 */
  readonly id: string;
  /** 数据模型（应用状态） */
  readonly dataModel: DataModel;
  /** 组件模型（组件树邻接表） */
  readonly componentsModel: SurfaceComponentsModel;

  /** action 事件源（用户交互→服务器） */
  readonly onAction = new EventSource<A2uiClientAction>();
  /** 错误事件源 */
  readonly onError = new EventSource<Error>();

  /** 是否在每次 A2A 消息中同步完整数据模型 */
  sendDataModel: boolean;

  /**
   * @param id 表面 ID
   * @param sendDataModel 是否同步数据模型
   */
  constructor(id: string, sendDataModel = false) {
    this.id = id;
    this.sendDataModel = sendDataModel;
    this.dataModel = new DataModel();
    this.componentsModel = new SurfaceComponentsModel();

    logger.info({ surfaceId: id, sendDataModel }, "Surface 创建");
  }

  /**
   * 分发 action（用户交互事件）
   *
   * 当组件触发交互时调用此方法。
   * action 通过 onAction 事件源传递给 A2A 客户端服务，
   * 最终发送给服务器。
   *
   * @param action 客户端 action 对象
   */
  async dispatchAction(action: A2uiClientAction): Promise<void> {
    logger.debug({ surfaceId: this.id, action: action.action?.name }, "分发 action");
    this.onAction.emit(action);
  }

  /** 清理 surface 资源 */
  dispose(): void {
    logger.info({ surfaceId: this.id }, "Surface 销毁");
    this.componentsModel.dispose();
    this.onAction.dispose();
    this.onError.dispose();
  }
}
