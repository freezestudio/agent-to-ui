/**
 * AgentCard 签名测试 — JCS (RFC 8785) + JWS (RFC 7515)
 */

import { describe, it, expect } from "vite-plus/test";
import {
  generateAgentCardKeyPair,
  signAgentCard,
  verifyAgentCardSignature,
  canonicalizeAgentCard,
  selfTest,
} from "../signature.js";
import type { AgentCard } from "../types/index.js";

describe("JCS 规范化 — RFC 8785", () => {
  it("对象键按 Unicode 升序排列", () => {
    const input = { z: 1, a: 2, m: 3 };
    const result = canonicalizeAgentCard(input as any);
    // 期待: {"a":2,"m":3,"z":1}
    expect(result).toBe('{"a":2,"m":3,"z":1}');
  });

  it("字符串正确转义", () => {
    const input = { text: 'hello "world"\nline2' };
    const result = canonicalizeAgentCard(input as any);
    expect(result).toContain('"hello');
  });

  it("排除 signatures 字段", () => {
    const card: AgentCard = {
      name: "test",
      description: "desc",
      version: "1.0",
      supportedInterfaces: [
        { url: "http://x", protocolBinding: "JSONRPC", protocolVersion: "1.0" },
      ],
      signatures: [{ type: "JWS", algorithm: "ES256", signature: "fake" }],
    };
    const result = canonicalizeAgentCard(card);
    expect(result).not.toContain("signatures");
    expect(result).toContain('"name"');
  });

  it("相同逻辑内容产生相同的规范形式", () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(canonicalizeAgentCard(a as any)).toBe(canonicalizeAgentCard(b as any));
  });
});

describe("JWS 签名与验证 — RFC 7515", () => {
  it("生成密钥对", () => {
    const keys = generateAgentCardKeyPair();
    expect(keys.publicKey).toContain("-----BEGIN PUBLIC KEY-----");
    expect(keys.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
  });

  it("签名并验证通过", () => {
    const card: AgentCard = {
      name: "验证测试",
      description: "test",
      version: "1.0.0",
      supportedInterfaces: [
        { url: "http://x", protocolBinding: "JSONRPC", protocolVersion: "1.0" },
      ],
    };

    const { publicKey, privateKey } = generateAgentCardKeyPair();
    const sig = signAgentCard(card, privateKey, "key-1");

    expect(sig.type).toBe("JWS");
    expect(sig.algorithm).toBe("ES256");
    expect(sig.signature).toMatch(/^.+\.(.+)\.(.+)$/); // header.payload.signature
    expect(sig.keyUrl).toContain("key-1");

    const signedCard: AgentCard = { ...card, signatures: [sig] };
    const valid = verifyAgentCardSignature(signedCard, sig, publicKey);
    expect(valid).toBe(true);
  });

  it("篡改后验证失败", () => {
    const card: AgentCard = {
      name: "原始名称",
      description: "desc",
      version: "1.0.0",
      supportedInterfaces: [
        { url: "http://x", protocolBinding: "JSONRPC", protocolVersion: "1.0" },
      ],
    };

    const { publicKey, privateKey } = generateAgentCardKeyPair();
    const sig = signAgentCard(card, privateKey);

    // 篡改卡片内容
    const tampered: AgentCard = {
      ...card,
      name: "被篡改的名称",
      signatures: [sig],
    };

    const valid = verifyAgentCardSignature(tampered, sig, publicKey);
    expect(valid).toBe(false);
  });

  it("自检函数通过", () => {
    expect(selfTest()).toBe(true);
  });
});
