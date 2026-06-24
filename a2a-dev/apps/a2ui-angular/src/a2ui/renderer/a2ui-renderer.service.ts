/**
 * A2UI Angular 渲染器服务
 *
 * 连接框架无关的 MessageProcessor 到 Angular 应用。
 * 管理 surface 生命周期、action 分发和消息处理。
 * 自动将组件交互产生的 action 发送回 A2A 服务器。
 *
 * @packageDocumentation
 */

import { Injectable, OnDestroy } from "@angular/core";
import { MessageProcessor, SurfaceGroupModel } from "@a2a-dev/a2ui-renderer";
import type { A2uiMessage, A2uiClientAction } from "@a2a-dev/a2ui-core";
import { A2AClientService } from "../../a2a/a2a-client.service.js";

@Injectable({ providedIn: "root" })
export class A2uiRendererService implements OnDestroy {
  private processor: MessageProcessor;
  private a2a: A2AClientService | null = null;

  /** 全局 Surface 组模型 */
  readonly model: SurfaceGroupModel;

  constructor() {
    this.processor = new MessageProcessor();
    this.model = this.processor.model;

    // 监听 action 事件，自动发送回 A2A 服务器
    this.model.onAction.subscribe((action) => {
      this.sendAction(action);
    });
  }

  /**
   * 设置 A2A 客户端服务（延迟注入，避免循环依赖）
   */
  setA2AClient(a2a: A2AClientService): void {
    this.a2a = a2a;
  }

  /**
   * 处理一组 A2UI 消息并更新 UI
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

  /**
   * 将 action 发送到 A2A 服务器
   * 服务器可能返回新的 A2UI 消息，自动处理
   */
  private async sendAction(action: A2uiClientAction): Promise<void> {
    if (!this.a2a) {
      console.log("[A2UI] Action 已捕获（A2A 客户端未配置）:", action.action?.name);
      return;
    }
    try {
      const result = await this.a2a.sendAction(action);
      if (result.length > 0) {
        console.log(`[A2UI] Action "${action.action?.name}" 返回 ${result.length} 条消息`);
        this.processMessages(result);
      }
    } catch (err) {
      console.error("[A2UI] Action 发送失败:", err);
    }
  }

  ngOnDestroy(): void {
    this.model.dispose();
  }
}
