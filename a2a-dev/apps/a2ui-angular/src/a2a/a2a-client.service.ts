/**
 * A2A 客户端服务
 *
 * 封装 @a2a-dev/client 的 A2AClient，提供 A2UI 消息提取。
 *
 * @packageDocumentation
 */

import { Injectable } from "@angular/core";
import { A2AClient } from "@a2a-dev/client";
import { extractA2uiFromTask } from "@a2a-dev/a2ui-extension";
import type { A2uiMessage } from "@a2a-dev/a2ui-core";

/** A2UI MIME 类型 */
const A2UI_MIME = "application/a2ui+json";

@Injectable({ providedIn: "root" })
export class A2AClientService {
  /** A2A 客户端实例 */
  private client = new A2AClient({ baseUrl: "/a2a" });

  /**
   * 发送消息到 A2A 服务器并提取 A2UI 消息
   *
   * @param text 用户输入文本
   * @returns A2UI 消息数组
   */
  async sendAndExtract(text: string): Promise<A2uiMessage[]> {
    const task = await this.client.sendMessage({
      role: "ROLE_USER" as any,
      parts: [{ text }],
    });

    const messages = extractA2uiFromTask(task);
    return messages;
  }
}
