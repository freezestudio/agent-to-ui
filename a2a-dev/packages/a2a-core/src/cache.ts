/**
 * AgentCard 缓存中间件 — 支持 ETag / If-None-Match
 *
 * 对应 A2A 规范 §8.6 Caching
 *
 * 服务器端：
 * - 为 AgentCard JSON 计算 ETag（基于内容的 SHA-256 哈希）
 * - 处理 If-None-Match 头，返回 304 Not Modified
 * - 设置 Cache-Control: max-age=<seconds>
 *
 * 客户端：
 * - 缓存 AgentCard
 * - 使用 If-None-Match 条件请求避免不必要下载
 */

import crypto from "node:crypto";
import { AgentCard } from "./types/index.js";
import { canonicalizeAgentCard } from "./signature.js";

/**
 * 为 AgentCard 计算 ETag 值
 *
 * 基于规范化的 AgentCard JSON 内容的 SHA-256 哈希，
 * 确保相同内容的卡片始终产生相同的 ETag。
 *
 * @param card AgentCard 对象
 * @param includeSignatures 是否包含签名字段（默认 false，因为签名会变化）
 * @returns ETag 字符串，如 "sha256-abc123..."
 */
export function computeAgentCardETag(card: AgentCard, includeSignatures = false): string {
  const json = includeSignatures ? JSON.stringify(card) : canonicalizeAgentCard(card);
  const hash = crypto.createHash("sha256").update(json, "utf-8").digest("hex");
  return `"sha256-${hash}"`;
}

/**
 * 服务器端 — 生成带 ETag 和 Cache-Control 头的 AgentCard 响应
 *
 * 使用示例：
 * ```ts
 * const { body, status, headers } = serveAgentCard(agentCard, req.headers["if-none-match"]);
 * res.writeHead(status, headers);
 * res.end(body);
 * ```
 */
export function serveAgentCard(
  card: AgentCard,
  ifNoneMatch?: string,
  maxAgeSeconds = 300,
): { body: string; status: number; headers: Record<string, string> } {
  const etag = computeAgentCardETag(card);
  const body = JSON.stringify(card);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ETag: etag,
    "Cache-Control": `public, max-age=${maxAgeSeconds}`,
  };

  if (ifNoneMatch && ifNoneMatch === etag) {
    return { body: "", status: 304, headers };
  }

  return { body, status: 200, headers };
}

/**
 * 客户端 — 带条件请求的 AgentCard 获取
 */
export async function fetchAgentCardWithCache(
  url: string,
  cachedETag?: string,
): Promise<{ card: AgentCard; etag: string; cached: boolean }> {
  const headers: Record<string, string> = {};
  if (cachedETag) {
    headers["If-None-Match"] = cachedETag;
  }

  const response = await fetch(url, { headers });

  if (response.status === 304) {
    throw new Error("缓存命中但未提供上次的卡片");
  }

  if (!response.ok) {
    throw new Error(`获取 AgentCard 失败: ${response.status}`);
  }

  const card = (await response.json()) as AgentCard;
  const etag = response.headers.get("etag") ?? computeAgentCardETag(card);

  return { card, etag, cached: response.status === 304 };
}

/**
 * AgentCard 缓存管理器 — 管理 ETag 缓存和条件请求
 */
export class AgentCardCache {
  private store = new Map<string, { card: AgentCard; etag: string }>();

  async fetch(url: string): Promise<{ card: AgentCard; cached: boolean }> {
    const cached = this.store.get(url);

    if (!cached) {
      const { card, etag } = await fetchAgentCardWithCache(url);
      this.store.set(url, { card, etag });
      return { card, cached: false };
    }

    const headers: Record<string, string> = { "If-None-Match": cached.etag };
    const response = await fetch(url, { headers });

    if (response.status === 304) {
      return { card: cached.card, cached: true };
    }
    if (!response.ok) throw new Error(`获取 AgentCard 失败: ${response.status}`);

    const card = (await response.json()) as AgentCard;
    const etag = response.headers.get("etag") ?? computeAgentCardETag(card);
    this.store.set(url, { card, etag });
    return { card, cached: false };
  }

  clear(): void {
    this.store.clear();
  }
}
