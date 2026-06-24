/**
 * AgentCard 签名工具 — 基于 JCS (RFC 8785) + JWS (RFC 7515)
 *
 * 对应 A2A 规范 §4.4.7 AgentCardSignature / §10.4
 *
 * 使用场景：
 *   server: 创建密钥对 → 对 AgentCard 签名 → 发布含签名的卡片
 *   client: 获取卡片 → 验证签名 → 确认卡片来源可信
 *
 * JCS (JSON Canonicalization Scheme, RFC 8785)：
 *   将 JSON 对象序列化为确定的、字节对字节可比较的规范形式。
 *   确保相同逻辑内容的 JSON 始终产生相同的签名输入。
 *
 * JWS (JSON Web Signature, RFC 7515)：
 *   使用 ECDSA P-256 (ES256) 对规范化的 JSON 进行签名。
 */

import { AgentCard, AgentCardSignature } from "./types/index.js";
import crypto from "node:crypto";

// ==================== JCS — JSON 规范化 (RFC 8785) ====================

/**
 * 将 JSON 值序列化为 RFC 8785 规范形式
 *
 * 规则：
 * 1. 对象键按 Unicode 码点升序排列
 * 2. 字符串使用双引号，特殊字符转义
 * 3. 数字使用精确表示，无前导零
 * 4. 布尔值和 null 小写
 * 5. 数组保持顺序
 * 6. **不包含 signatures 字段**（签名时排除自身）
 */
function jcsSerialize(value: unknown, excludeSignatures = true): string {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }

  if (Array.isArray(value)) {
    const items = value.map((v) => jcsSerialize(v, false));
    return `[${items.join(",")}]`;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => {
      // 签名时排除 signatures 字段本身
      if (excludeSignatures && k === "signatures") return false;
      return true;
    });
    // Unicode 码点升序排序
    keys.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

    const pairs = keys.map(
      (k) => `${JSON.stringify(k)}:${jcsSerialize(obj[k], excludeSignatures)}`,
    );
    return `{${pairs.join(",")}}`;
  }

  throw new Error(`JCS: 不支持的类型 ${typeof value}`);
}

/**
 * 计算 AgentCard 的规范化 JSON 字符串（排除 signatures 字段）
 *
 * @param card AgentCard 对象
 * @returns RFC 8785 规范化 JSON 字符串
 */
export function canonicalizeAgentCard(card: AgentCard): string {
  return jcsSerialize(card as unknown as Record<string, unknown>, true);
}

// ==================== JWS — JSON Web Signature (RFC 7515) ====================

/** Base64url 编码（无填充） */
function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64url");
}

/** JWS 受保护的头部 */
interface JwsProtectedHeader {
  alg: "ES256";
  kid?: string;
  typ?: "JWT";
}

/** JWS 签名结果 */
interface JwsSignature {
  protected: string; // base64url 编码的头部
  payload: string; // base64url 编码的负载
  signature: string; // base64url 编码的签名
}

/**
 * JWS 紧凑序列化 — 生成 "protected.payload.signature" 格式
 */
function jwsCompact(
  protectedHeader: JwsProtectedHeader,
  payload: string,
  privateKey: crypto.KeyObject,
): string {
  const header = base64url(JSON.stringify(protectedHeader));
  const payloadB64 = base64url(payload);
  const signingInput = `${header}.${payloadB64}`;
  const sig = crypto.sign("sha256", Buffer.from(signingInput, "utf-8"), privateKey);
  const signature = base64url(sig);
  return `${signingInput}.${signature}`;
}

/**
 * JWS 验证 — 解析紧凑序列化并验证签名
 */
function jwsVerify(
  jws: string,
  publicKey: crypto.KeyObject,
): { payload: string; header: JwsProtectedHeader } | null {
  const parts = jws.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  try {
    const header: JwsProtectedHeader = JSON.parse(
      Buffer.from(headerB64, "base64url").toString("utf-8"),
    );
    const signature = Buffer.from(sigB64, "base64url");
    const valid = crypto.verify("sha256", Buffer.from(signingInput, "utf-8"), publicKey, signature);
    if (!valid) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    return { payload, header };
  } catch {
    return null;
  }
}

// ==================== AgentCard 签名与验证 ====================

/**
 * 为 AgentCard 生成密钥对（ECDSA P-256）
 *
 * @returns { publicKey, privateKey } PEM 格式的密钥对
 */
export function generateAgentCardKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

/**
 * 对 AgentCard 进行 JWS 签名
 *
 * @param card AgentCard 对象（将被规范化后签名）
 * @param privateKey PEM 格式的 ECDSA P-256 私钥
 * @param keyId 可选的密钥标识符（用于多密钥轮换场景）
 * @returns AgentCardSignature 对象
 *
 * 流程（规范 §10.4）：
 * 1. 对 AgentCard 进行 JCS 规范化（排除 signatures 字段）
 * 2. 使用 ES256 (ECDSA P-256 + SHA-256) 签名
 * 3. 将签名结果包装为 AgentCardSignature
 */
export function signAgentCard(
  card: AgentCard,
  privateKeyPem: string,
  keyId?: string,
): AgentCardSignature {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const canonical = canonicalizeAgentCard(card);

  const protectedHeader: JwsProtectedHeader = { alg: "ES256" };
  if (keyId) protectedHeader.kid = keyId;

  const jws = jwsCompact(protectedHeader, canonical, privateKey);
  const [headerB64, _payloadB64, sigB64] = jws.split(".");

  return {
    protected: headerB64,
    header: protectedHeader as unknown as Record<string, unknown>,
    signature: sigB64,
  };
}

/**
 * 验证 AgentCard 的 JWS 签名
 *
 * @param card AgentCard 对象
 * @param signature AgentCardSignature 对象
 * @param publicKeyPem 可选：PEM 格式公钥
 * @returns 验证是否通过
 */
export function verifyAgentCardSignature(
  card: AgentCard,
  signature: AgentCardSignature,
  publicKeyPem?: string,
): boolean {
  if (!publicKeyPem) {
    console.warn("[AgentCard-Sig] 未提供公钥，无法验证");
    return false;
  }

  try {
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const canonical = canonicalizeAgentCard(card);
    const payloadB64 = base64urlEncode(Buffer.from(canonical, "utf-8"));
    const jws = `${signature.protected}.${payloadB64}.${signature.signature}`;

    const result = jwsVerify(jws, publicKey);
    if (!result) return false;

    // 验证负载是否与规范化后的卡片一致
    return result.payload === canonical;
  } catch (err) {
    console.warn("[AgentCard-Sig] 验证异常:", (err as Error).message);
    return false;
  }
}

// ==================== 测试辅助 ====================

/**
 * 测试：生成密钥对 → 签名 → 验证
 */
export function selfTest(): boolean {
  const card: AgentCard = {
    name: "测试智能体",
    description: "用于签名测试",
    version: "1.0.0",
    supportedInterfaces: [
      {
        url: "http://localhost:9999/a2a",
        protocolBinding: "JSONRPC",
        protocolVersion: "1.0",
      },
    ],
    skills: [{ id: "test", name: "测试技能" }],
  };

  const { publicKey, privateKey } = generateAgentCardKeyPair();
  const sig = signAgentCard(card, privateKey);

  // 将签名附加到卡片
  const signedCard: AgentCard = { ...card, signatures: [sig] };

  const valid = verifyAgentCardSignature(signedCard, sig, publicKey);
  return valid;
}
