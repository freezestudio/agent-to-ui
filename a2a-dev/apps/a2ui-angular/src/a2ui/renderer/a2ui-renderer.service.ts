/**
 * A2UI Angular 渲染器服务
 *
 * 连接框架无关的 MessageProcessor 到 Angular 应用。
 * 管理 surface 生命周期、action 分发和消息处理。
 *
 * @packageDocumentation
 */

import { Injectable, OnDestroy, NgZone, inject } from "@angular/core";
import { MessageProcessor, SurfaceGroupModel } from "@a2a-dev/a2ui-renderer";
import type { A2uiMessage, A2uiClientAction } from "@a2a-dev/a2ui-core";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class A2uiRendererService implements OnDestroy {
  /** A2UI 消息处理器 */
  private processor: MessageProcessor;

  /** 全局 Surface 组模型 */
  readonly model: SurfaceGroupModel;

  /** Action 事件流（组件交互 → 逻辑处理） */
  readonly onAction = new Subject<A2uiClientAction>();

  constructor() {
    // 创建消息处理器，绑定 action 处理
    this.processor = new MessageProcessor((action) => {
      this.onAction.next(action);
    });
    this.model = this.processor.model;
  }

  /**
   * 处理一组 A2UI 消息并更新 UI
   *
   * @param messages A2UI 消息数组
   */
  processMessages(messages: A2uiMessage[]): void {
    this.processor.processMessages(messages);
  }

  /**
   * 获取指定 ID 的 Surface
   */
  getSurface(id: string) {
    return this.model.getSurface(id);
  }

  /** 清理资源 */
  ngOnDestroy(): void {
    this.model.dispose();
    this.onAction.complete();
  }
}
