/**
 * A2UI 消息提取工具
 *
 * 从 A2A Task 的 Artifact 中提取 A2UI 消息。
 * A2UI 消息作为 DataPart（mimeType: application/a2ui+json）
 * 嵌入在 A2A 响应的 Artifact.parts 中。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { A2UI_MIME_TYPE } from "./extension.js";
import type { A2uiMessage } from "@a2a-dev/a2ui-core";

const logger = pino({ name: "a2ui:extract" });

/**
 * 类似 Task 的结构（避免引入完整类型）
 */
interface TaskLike {
  artifacts?: Array<{
    parts?: Array<{
      data?: unknown;
      mediaType?: string;
    }>;
  }>;
}

/**
 * 从 A2A Task 中提取 A2UI 消息
 *
 * 遍历 Task 的所有 Artifact 和 Part，
 * 查找 mediaType 为 application/a2ui+json 的 DataPart。
 * 返回所有匹配的 A2UI 消息。
 *
 * @param task A2A Task 对象（或其子集）
 * @returns A2UI 消息数组
 *
 * @example
 * ```ts
 * const task = await client.sendMessage({ ... });
 * const msgs = extractA2uiFromTask(task);
 * renderer.processMessages(msgs);
 * ```
 */
export function extractA2uiFromTask(task: TaskLike): A2uiMessage[] {
  const messages: A2uiMessage[] = [];
  let partCount = 0;

  for (const artifact of task.artifacts ?? []) {
    for (const part of artifact.parts ?? []) {
      partCount++;
      if (part.mediaType === A2UI_MIME_TYPE && part.data) {
        const data = part.data as { a2uiMessages?: A2uiMessage[] };
        if (data.a2uiMessages && Array.isArray(data.a2uiMessages)) {
          logger.debug({ count: data.a2uiMessages.length }, "从 DataPart 提取 A2UI 消息");
          messages.push(...data.a2uiMessages);
        }
      }
    }
  }

  logger.info({ totalParts: partCount, extracted: messages.length }, "A2UI 消息提取完成");
  return messages;
}
