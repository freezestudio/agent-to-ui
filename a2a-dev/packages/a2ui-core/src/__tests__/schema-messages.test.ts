/**
 * A2UI v1.0 信封消息类型测试
 *
 * 根据 server_to_client.json 规范测试 6 种信封消息的
 * Zod v4 验证行为。
 */

import { describe, it, expect } from "vite-plus/test";

/**
 * 红灯：从尚未实现的模块导入
 */
import { A2uiMessageSchema } from "../schema/server-to-client.js";
import { A2uiClientMessageSchema } from "../schema/client-to-server.js";

import type {
  A2uiMessage,
  A2uiClientAction,
  A2uiClientFunctionResponse,
} from "../types/messages.js";

// ============================================================================
// createSurface 消息测试
// ============================================================================

describe("CreateSurfaceMessage", () => {
  /** 最基本的 createSurface：只需 surfaceId 和 catalogId */
  it("应该验证最简 createSurface", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      createSurface: { surfaceId: "main", catalogId: "test-catalog" },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  /** 带可选字段的 createSurface */
  it("应该支持 surfaceProperties 和 components", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      createSurface: {
        surfaceId: "main",
        catalogId: "test-catalog",
        surfaceProperties: { iconUrl: "https://example.com/icon.png" },
        components: [{ id: "root", component: "Text", text: "Hello" }],
        dataModel: { user: { name: "Alice" } },
      },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  /** 缺少必填的 surfaceId */
  it("应该拒绝缺少 surfaceId", () => {
    const result = A2uiMessageSchema.safeParse({
      version: "1.0",
      createSurface: { catalogId: "test" },
    });
    expect(result.success).toBe(false);
  });

  /** 版本号错误 */
  it("应该拒绝非 v1.0 的版本号", () => {
    const result = A2uiMessageSchema.safeParse({
      version: "v0.9",
      createSurface: { surfaceId: "main", catalogId: "test" },
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// updateComponents 消息测试
// ============================================================================

describe("UpdateComponentsMessage", () => {
  it("应该验证合法的 updateComponents", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [{ id: "t1", component: "Text", text: "Hello" }],
      },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("应该拒绝空的 components 列表", () => {
    const result = A2uiMessageSchema.safeParse({
      version: "1.0",
      updateComponents: { surfaceId: "main", components: [] },
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// updateDataModel 消息测试
// ============================================================================

describe("UpdateDataModelMessage", () => {
  it("应该验证 updateDataModel（带 path 和 value）", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      updateDataModel: { surfaceId: "main", path: "/user/name", value: "Bob" },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("应该允许不带 value 的 updateDataModel（表示删除）", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      updateDataModel: { surfaceId: "main", path: "/user/temp" },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// deleteSurface 消息测试
// ============================================================================

describe("DeleteSurfaceMessage", () => {
  it("应该验证 deleteSurface", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      deleteSurface: { surfaceId: "main" },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// actionResponse 消息测试（v1.0 新增）
// ============================================================================

describe("ActionResponseMessage", () => {
  it("应该验证带返回值的 actionResponse", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      actionResponse: {
        actionId: "act-001",
        actionResponse: { value: "ok" },
      },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("应该验证带错误的 actionResponse", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      actionResponse: {
        actionId: "act-001",
        actionResponse: { error: { code: "NOT_FOUND", message: "资源不存在" } },
      },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// callFunction 消息测试（v1.0 新增）
// ============================================================================

describe("CallFunctionMessage", () => {
  it("应该验证 callFunction", () => {
    const msg: A2uiMessage = {
      version: "1.0",
      callFunction: {
        functionCallId: "fc-001",
        callFunction: { call: "required", args: { value: { path: "/email" } } },
      },
    };
    const result = A2uiMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// 客户端消息测试
// ============================================================================

describe("A2uiClientMessage", () => {
  it("应该验证客户端 action", () => {
    const msg: A2uiClientAction = {
      version: "1.0",
      action: {
        name: "submit",
        surfaceId: "main",
        sourceComponentId: "btn-1",
        timestamp: "2026-01-01T00:00:00.000Z",
        context: { username: "Alice" },
      },
    };
    const result = A2uiClientMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("应该验证客户端 functionResponse", () => {
    const msg: A2uiClientFunctionResponse = {
      version: "1.0",
      functionResponse: {
        functionCallId: "fc-001",
        call: "required",
        value: true,
      },
    };
    const result = A2uiClientMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });
});
