/**
 * 轻量 A2A HTTP 客户端
 *
 * 直接发送 HTTP JSON-RPC 请求到 A2A 服务器。
 * 内联 A2UI 消息提取逻辑，避免 Node.js 环境依赖。
 *
 * @packageDocumentation
 */

import { Injectable } from "@angular/core";
import { A2UI_MIME_TYPE } from "./constants.js";
import type { A2uiMessage } from "@a2a-dev/a2ui-core";

const A2A_BASE_URL = "/a2a";

/** 浏览器兼容的 UUID 生成器 */
function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** 从 Task 对象中提取 A2UI 消息 */
function extractA2uiMessages(task: any): A2uiMessage[] {
  const messages: A2uiMessage[] = [];
  for (const artifact of task.artifacts ?? []) {
    for (const part of artifact.parts ?? []) {
      if (part.mediaType === A2UI_MIME_TYPE && part.data) {
        const data = part.data as { a2uiMessages?: A2uiMessage[] };
        if (data.a2uiMessages && Array.isArray(data.a2uiMessages)) {
          messages.push(...data.a2uiMessages);
        }
      }
    }
  }
  return messages;
}

@Injectable({ providedIn: "root" })
export class A2AClientService {
  /**
   * 发送文本消息到 A2A 服务器并提取 A2UI 消息
   */
  async sendAndExtract(text: string): Promise<A2uiMessage[]> {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: uuid(),
      method: "SendMessage",
      params: {
        message: {
          role: "ROLE_USER",
          parts: [{ text }],
          messageId: uuid(),
        },
      },
    });

    const response = await fetch(A2A_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "A2A-Version": "1.0" },
      body,
    });

    if (!response.ok) {
      throw new Error(`A2A 请求失败: ${response.status}`);
    }

    const json = await response.json();
    const task = json?.result?.task;
    if (!task) return [];
    return extractA2uiMessages(task);
  }
}
