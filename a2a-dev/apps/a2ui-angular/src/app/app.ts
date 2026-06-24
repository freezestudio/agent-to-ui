/**
 * A2UI Angular 根组件
 *
 * 提供聊天式 UI：用户输入 → A2A 发送 → A2UI 渲染
 *
 * @packageDocumentation
 */

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { A2AClientService } from "../a2a/a2a-client.service.js";
import { A2uiRendererService } from "../a2ui/renderer/a2ui-renderer.service.js";
import { SurfaceComponent } from "../a2ui/renderer/surface.component.js";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, SurfaceComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class AppComponent {
  /** A2A 通信服务 */
  private a2a = inject(A2AClientService);
  /** A2UI 渲染器服务 */
  private renderer = inject(A2uiRendererService);

  /** 当前活跃的 surface ID 列表 */
  surfaces = signal<string[]>([]);
  /** 加载状态 */
  loading = signal(false);
  /** 最后一个响应的场景名 */
  lastScene = signal("");

  constructor() {
    // 注入 A2A 客户端到渲染器（延迟注入避免循环依赖）
    this.renderer.setA2AClient(this.a2a);

    // 监听 surface 创建/删除事件，更新列表
    this.renderer.model.onSurfaceCreated.subscribe((s) => {
      this.surfaces.update((list) => [...list, s.id]);
    });
    this.renderer.model.onSurfaceDeleted.subscribe((id) => {
      this.surfaces.update((list) => list.filter((s) => s !== id));
    });
  }

  /**
   * 发送用户消息到 A2A 服务器并渲染返回的 A2UI 消息
   * @param text 用户输入文本
   */
  async send(text: string): Promise<void> {
    if (!text.trim() || this.loading()) return;

    this.loading.set(true);
    this.lastScene.set(text);

    try {
      // 通过 A2A 客户端发送消息，获取 A2UI 消息
      const messages = await this.a2a.sendAndExtract(text);

      if (messages.length === 0) {
        console.warn("服务器返回的 A2UI 消息为空");
        return;
      }

      // 处理 A2UI 消息（创建 surface、更新组件等）
      this.renderer.processMessages(messages);
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * 切换到指定的演示场景
   * 先清空所有 surface，再发送场景请求
   */
  async switchScene(scene: string): Promise<void> {
    // 清空所有 surface
    for (const surface of this.surfaces()) {
      this.renderer.model.deleteSurface(surface);
    }
    this.surfaces.set([]);

    await this.send(scene);
  }
}
