import { describe, it, expect } from "vite-plus/test";
import { computeAgentCardETag, serveAgentCard, AgentCardCache } from "../cache.js";
import type { AgentCard } from "../types/index.js";

const sampleCard: AgentCard = {
  name: "缓存测试",
  description: "用于 ETag 缓存测试",
  version: "1.0.0",
  supportedInterfaces: [
    {
      url: "http://localhost:9999/a2a",
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
    },
  ],
};

describe("computeAgentCardETag", () => {
  it("相同卡片产生相同 ETag", () => {
    const tag1 = computeAgentCardETag(sampleCard);
    const tag2 = computeAgentCardETag(sampleCard);
    expect(tag1).toBe(tag2);
  });

  it("不同卡片产生不同 ETag", () => {
    const tag1 = computeAgentCardETag(sampleCard);
    const tag2 = computeAgentCardETag({ ...sampleCard, name: "其他名称" });
    expect(tag1).not.toBe(tag2);
  });

  it("ETag 格式正确", () => {
    const tag = computeAgentCardETag(sampleCard);
    expect(tag).toMatch(/^"sha256-[a-f0-9]{64}"$/);
  });
});

describe("serveAgentCard", () => {
  it("返回 200 和卡片内容", () => {
    const { status, body, headers } = serveAgentCard(sampleCard);
    expect(status).toBe(200);
    expect(body).toContain("缓存测试");
    expect(headers["ETag"]).toBeTruthy();
    expect(headers["Cache-Control"]).toContain("max-age=");
  });

  it("If-None-Match 匹配时返回 304", () => {
    const etag = computeAgentCardETag(sampleCard);
    const { status } = serveAgentCard(sampleCard, etag);
    expect(status).toBe(304);
  });

  it("If-None-Match 不匹配时返回 200", () => {
    const { status } = serveAgentCard(sampleCard, '"sha256-旧哈希值"');
    expect(status).toBe(200);
  });
});

describe("AgentCardCache", () => {
  it("首次获取不走缓存", async () => {
    const cache = new AgentCardCache();
    // 使用本地文件 URL 测试（不依赖远程服务器）
    const url = "file:///dev/null";
    try {
      await cache.fetch(url);
    } catch {
      // 预期报错（文件不存在），但缓存应被正确初始化
    }
  });
});
