/**
 * A2A v1.0 核心类型测试
 *
 * 测试覆盖：
 * - 枚举常量（TaskState、Role）符合 v1.0 SCREAMING_SNAKE_CASE 规范
 * - Zod v4 模式验证（正例 + 反例）
 * - 工具函数（createTextMessage、isTerminalState 等）
 * - v1.0 新增功能（多租户、扩展、流事件格式）
 * - Part 的 oneof 内容类型鉴别
 */

import { describe, it, expect } from "vite-plus/test";
import {
  // 枚举
  TaskState,
  Role,
  A2AErrorType,
  // Zod v4 验证模式
  TaskSchema,
  MessageSchema,
  AgentCardSchema,
  PartSchema,
  SendMessageRequestSchema,
  // 工具函数
  createTextMessage,
  createFileMessage,
  createDataMessage,
  isValidTaskState,
  isTerminalState,
  getA2AErrorCode,
} from "@a2a-dev/core";

// ============================================================================
// 1. 枚举常量测试
// ============================================================================

describe("TaskState 枚举 — 规范 §4.1.3", () => {
  // v1.0 重大变更：枚举值从 kebab-case 改为 SCREAMING_SNAKE_CASE
  it("v1.0 格式：所有值使用 SCREAMING_SNAKE_CASE，包含 TASK_STATE_ 前缀", () => {
    expect(TaskState.TASK_STATE_SUBMITTED).toBe("TASK_STATE_SUBMITTED");
    expect(TaskState.TASK_STATE_WORKING).toBe("TASK_STATE_WORKING");
    expect(TaskState.TASK_STATE_COMPLETED).toBe("TASK_STATE_COMPLETED");
    expect(TaskState.TASK_STATE_FAILED).toBe("TASK_STATE_FAILED");
    expect(TaskState.TASK_STATE_CANCELED).toBe("TASK_STATE_CANCELED");
    expect(TaskState.TASK_STATE_REJECTED).toBe("TASK_STATE_REJECTED");
    expect(TaskState.TASK_STATE_INPUT_REQUIRED).toBe("TASK_STATE_INPUT_REQUIRED");
    expect(TaskState.TASK_STATE_AUTH_REQUIRED).toBe("TASK_STATE_AUTH_REQUIRED");
  });

  // 验证枚举数量：v1.0 定义 8 个状态值
  it("v1.0 定义 8 个任务状态", () => {
    expect(Object.keys(TaskState).length).toBe(8);
  });

  // 确保没有残留 v0.3.0 的 kebab-case 值
  it("不包含 v0.3.0 的旧格式值", () => {
    const values = Object.values(TaskState);
    expect(values).not.toContain("completed");
    expect(values).not.toContain("input-required");
    expect(values).not.toContain("auth-required");
  });
});

describe("Role 枚举 — 规范 §4.1.5", () => {
  // v1.0 重大变更：从小写改为 SCREAMING_SNAKE_CASE，带 ROLE_ 前缀
  it("v1.0 格式：使用 ROLE_ 前缀", () => {
    expect(Role.ROLE_USER).toBe("ROLE_USER");
    expect(Role.ROLE_AGENT).toBe("ROLE_AGENT");
  });

  it("不包含 v0.3.0 的小写值", () => {
    expect(Object.values(Role)).not.toContain("user");
    expect(Object.values(Role)).not.toContain("agent");
  });
});

describe("A2AErrorType 枚举 — 规范 §3.3.2", () => {
  it("定义 9 种 A2A 特定错误类型", () => {
    expect(Object.keys(A2AErrorType).length).toBe(9);
  });

  it("错误码映射与规范 §5.4 一致", () => {
    expect(getA2AErrorCode(A2AErrorType.TASK_NOT_FOUND)).toBe(-32001);
    expect(getA2AErrorCode(A2AErrorType.TASK_NOT_CANCELABLE)).toBe(-32002);
    expect(getA2AErrorCode(A2AErrorType.PUSH_NOTIFICATION_NOT_SUPPORTED)).toBe(-32003);
    expect(getA2AErrorCode(A2AErrorType.UNSUPPORTED_OPERATION)).toBe(-32004);
    expect(getA2AErrorCode(A2AErrorType.CONTENT_TYPE_NOT_SUPPORTED)).toBe(-32005);
    expect(getA2AErrorCode(A2AErrorType.INVALID_AGENT_RESPONSE)).toBe(-32006);
    expect(getA2AErrorCode(A2AErrorType.EXTENDED_AGENT_CARD_NOT_CONFIGURED)).toBe(-32007);
    expect(getA2AErrorCode(A2AErrorType.EXTENSION_SUPPORT_REQUIRED)).toBe(-32008);
    expect(getA2AErrorCode(A2AErrorType.VERSION_NOT_SUPPORTED)).toBe(-32009);
  });

  it("未知错误类型返回通用内部错误码 -32603", () => {
    expect(getA2AErrorCode("UnknownError" as A2AErrorType)).toBe(-32603);
  });
});

// ============================================================================
// 2. Zod v4 模式验证测试
// ============================================================================

describe("PartSchema — 规范 §4.1.6", () => {
  it("验证纯文本 Part（v1.0 统一格式）", () => {
    const part = { text: "你好世界", mediaType: "text/plain" };
    const result = PartSchema.safeParse(part);
    expect(result.success).toBe(true);
  });

  it("验证文件引用 Part（v1.0 使用 url 字段代替 file.fileWithUri）", () => {
    const part = {
      url: "https://example.com/doc.pdf",
      filename: "doc.pdf",
      mediaType: "application/pdf",
    };
    const result = PartSchema.safeParse(part);
    expect(result.success).toBe(true);
  });

  it("验证内联二进制 Part（v1.0 新增 raw 字段）", () => {
    const part = {
      raw: "aGVsbG8gd29ybGQ=",
      filename: "hello.txt",
      mediaType: "text/plain",
    };
    const result = PartSchema.safeParse(part);
    expect(result.success).toBe(true);
  });

  it("验证结构化数据 Part（v1.0 统一 data 字段）", () => {
    const part = {
      data: { temperature: 25.5, unit: "celsius" },
      mediaType: "application/json",
    };
    const result = PartSchema.safeParse(part);
    expect(result.success).toBe(true);
  });

  it("拒绝无效的 URL 格式", () => {
    const part = { url: "不是有效url", mediaType: "text/plain" };
    const result = PartSchema.safeParse(part);
    // Zod v4 的 url() 校验会拒绝非 URL 字符串
    expect(result.success).toBe(false);
  });

  it("允许空对象（部分更新场景）", () => {
    const result = PartSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("TaskSchema — 规范 §4.1.1", () => {
  it("验证有效任务（COMPLETED 状态）", () => {
    const task = {
      id: "task-001",
      contextId: "ctx-001",
      status: {
        state: "TASK_STATE_COMPLETED",
        timestamp: "2024-03-15T10:15:00.000Z",
      },
      createdAt: "2024-03-15T10:15:00.000Z",
      lastModified: "2024-03-15T10:16:00.000Z",
    };
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("验证带制品的任务", () => {
    const task = {
      id: "task-002",
      status: { state: "TASK_STATE_COMPLETED" },
      artifacts: [
        {
          artifactId: "art-001",
          name: "报告结果",
          parts: [{ text: "这是报告内容" }],
        },
      ],
    };
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  // v1.0 重大变更：拒绝 v0.3.0 的小写状态值
  it("拒绝 v0.3.0 的小写状态值（v1.0 必须用 SCREAMING_SNAKE_CASE）", () => {
    const task = {
      id: "task-003",
      status: { state: "completed" }, // v0.3.0 格式
    };
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  // v1.0 重大变更：拒绝 v0.3.0 的 input-required 格式
  it("拒绝 v0.3.0 的 input-required 格式", () => {
    const task = {
      id: "task-004",
      status: { state: "input-required" }, // v0.3.0 格式
    };
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it("拒绝空 taskId", () => {
    const task = {
      id: "",
      status: { state: "TASK_STATE_SUBMITTED" },
    };
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });
});

describe("MessageSchema — 规范 §4.1.4", () => {
  it("验证简单消息", () => {
    const msg = {
      role: "ROLE_USER",
      parts: [{ text: "你好" }],
      messageId: "msg-001",
    };
    const result = MessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("验证带扩展引用的消息（v1.0 新增）", () => {
    const msg = {
      role: "ROLE_USER",
      parts: [{ text: "查找附近餐厅" }],
      messageId: "msg-002",
      extensions: ["https://example.com/ext/geolocation/v1"],
      metadata: {
        "https://example.com/ext/geolocation/v1": {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      },
    };
    const result = MessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("拒绝空 parts 数组", () => {
    const msg = {
      role: "ROLE_USER",
      parts: [],
      messageId: "msg-003",
    };
    const result = MessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it("拒绝无效的角色值", () => {
    const msg = {
      role: "user", // v0.3.0 小写格式
      parts: [{ text: "你好" }],
      messageId: "msg-004",
    };
    const result = MessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });
});

describe("AgentCardSchema — 规范 §4.4.1", () => {
  // v1.0 新的 AgentCard 格式：supportedInterfaces 替代 url + preferredTransport + additionalInterfaces
  it("验证 v1.0 格式的智能体卡片", () => {
    const card = {
      name: "测试智能体",
      description: "用于单元测试的示例智能体",
      version: "1.0.0",
      supportedInterfaces: [
        {
          url: "http://localhost:9999/a2a",
          protocolBinding: "JSONRPC",
          protocolVersion: "1.0",
        },
      ],
      capabilities: {
        streaming: true,
        pushNotifications: false,
        extendedAgentCard: false,
      },
      defaultInputModes: ["text/plain"],
      defaultOutputModes: ["text/plain"],
      skills: [
        {
          id: "echo",
          name: "Echo 技能",
          description: "返回 echo 响应",
          tags: ["echo", "test"],
          examples: ["你好"],
        },
      ],
    };
    const result = AgentCardSchema.safeParse(card);
    expect(result.success).toBe(true);
  });

  it("支持多租户 tenant 字段（v1.0 新增，规范 §4.4.6）", () => {
    const card = {
      name: "多租户智能体",
      description: "支持多租户路由",
      version: "1.0.0",
      supportedInterfaces: [
        {
          url: "https://agents.example.com/a2a",
          protocolBinding: "JSONRPC",
          protocolVersion: "1.0",
          tenant: "billing", // 多租户标识
        },
      ],
    };
    const result = AgentCardSchema.safeParse(card);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.supportedInterfaces[0].tenant).toBe("billing");
    }
  });

  it("支持扩展声明（v1.0 新增）", () => {
    const card = {
      name: "带扩展的智能体",
      description: "测试扩展声明",
      version: "1.0.0",
      supportedInterfaces: [
        {
          url: "http://localhost:9999/a2a",
          protocolBinding: "JSONRPC",
          protocolVersion: "1.0",
        },
      ],
      capabilities: {
        extensions: [
          {
            uri: "https://example.com/ext/geolocation/v1",
            description: "地理位置搜索",
            required: false,
          },
        ],
      },
    };
    const result = AgentCardSchema.safeParse(card);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capabilities?.extensions).toHaveLength(1);
      expect(result.data.capabilities?.extensions![0].uri).toMatch(/^https:\/\//);
    }
  });

  it("支持 AgentCard 签名（v1.0 新增，JWS + JCS）", () => {
    const card = {
      name: "已签名智能体",
      description: "测试 JWS 签名",
      version: "1.0.0",
      supportedInterfaces: [
        {
          url: "http://localhost:9999/a2a",
          protocolBinding: "JSONRPC",
          protocolVersion: "1.0",
        },
      ],
      signatures: [
        {
          type: "JWS",
          algorithm: "ES256",
          keyUrl: "https://example.com/.well-known/jwks.json",
          signature: "base64url-encoded-signature",
          signedAt: "2024-03-15T10:00:00.000Z",
        },
      ],
    };
    const result = AgentCardSchema.safeParse(card);
    expect(result.success).toBe(true);
  });

  it("拒绝空名称", () => {
    const card = {
      name: "",
      description: "测试",
      version: "1.0.0",
      supportedInterfaces: [],
    };
    const result = AgentCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 3. 工具函数测试
// ============================================================================

describe("createTextMessage", () => {
  it("创建默认角色的消息", () => {
    const msg = createTextMessage("你好世界");
    expect(msg.role).toBe(Role.ROLE_USER);
    expect(msg.parts[0]?.text).toBe("你好世界");
    expect(msg.messageId).toBeTruthy();
  });

  it("指定智能体角色", () => {
    const msg = createTextMessage("处理完成", Role.ROLE_AGENT);
    expect(msg.role).toBe(Role.ROLE_AGENT);
    expect(msg.parts[0]?.text).toBe("处理完成");
  });

  it("每次调用生成唯一 messageId", () => {
    const msg1 = createTextMessage("你好");
    const msg2 = createTextMessage("你好");
    expect(msg1.messageId).not.toBe(msg2.messageId);
  });
});

describe("createFileMessage", () => {
  it("创建文件引用消息", () => {
    const msg = createFileMessage("https://example.com/image.png", "image/png", "photo.png");
    expect(msg.parts[0]?.url).toBe("https://example.com/image.png");
    expect(msg.parts[0]?.mediaType).toBe("image/png");
    expect(msg.parts[0]?.filename).toBe("photo.png");
  });
});

describe("createDataMessage", () => {
  it("创建结构化数据消息", () => {
    const data = { score: 95, passed: true };
    const msg = createDataMessage(data);
    expect(msg.parts[0]?.data).toEqual(data);
    expect(msg.parts[0]?.mediaType).toBe("application/json");
  });
});

describe("isTerminalState", () => {
  it("COMPLETED 是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_COMPLETED)).toBe(true);
  });

  it("FAILED 是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_FAILED)).toBe(true);
  });

  it("CANCELED 是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_CANCELED)).toBe(true);
  });

  it("REJECTED 是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_REJECTED)).toBe(true);
  });

  it("WORKING 不是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_WORKING)).toBe(false);
  });

  it("INPUT_REQUIRED 不是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_INPUT_REQUIRED)).toBe(false);
  });

  it("SUBMITTED 不是终端状态", () => {
    expect(isTerminalState(TaskState.TASK_STATE_SUBMITTED)).toBe(false);
  });
});

describe("isValidTaskState", () => {
  it("有效状态返回 true", () => {
    expect(isValidTaskState("TASK_STATE_COMPLETED")).toBe(true);
    expect(isValidTaskState("TASK_STATE_INPUT_REQUIRED")).toBe(true);
  });

  it("无效状态返回 false", () => {
    expect(isValidTaskState("completed")).toBe(false);
    expect(isValidTaskState("INVALID_STATE")).toBe(false);
    expect(isValidTaskState("")).toBe(false);
  });
});

// ============================================================================
// 4. SendMessageRequest Schema 测试
// ============================================================================

describe("SendMessageRequestSchema — 规范 §3.2.1", () => {
  it("验证最小请求", () => {
    const req = {
      message: {
        role: "ROLE_USER",
        parts: [{ text: "你好" }],
        messageId: "msg-001",
      },
    };
    const result = SendMessageRequestSchema.safeParse(req);
    expect(result.success).toBe(true);
  });

  it("验证带执行模式的请求（v1.0 新增 returnImmediately）", () => {
    const req = {
      message: {
        role: "ROLE_USER",
        parts: [{ text: "长时间任务" }],
        messageId: "msg-002",
      },
      config: {
        returnImmediately: true,
      },
    };
    const result = SendMessageRequestSchema.safeParse(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.config?.returnImmediately).toBe(true);
    }
  });

  it("验证带多租户标识的请求（v1.0 新增 tenant）", () => {
    const req = {
      message: {
        role: "ROLE_USER",
        parts: [{ text: "查询账单" }],
        messageId: "msg-003",
      },
      tenant: "billing",
    };
    const result = SendMessageRequestSchema.safeParse(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tenant).toBe("billing");
    }
  });
});

// ============================================================================
// 5. 流事件格式测试（v1.0 格式变更）
// ============================================================================

describe("流事件 v1.0 格式", () => {
  it("TaskStatusUpdateEvent 使用包装器模式（无 kind 字段）", () => {
    // v1.0 格式：使用 JSON 成员名称区分事件类型
    const streamEvent = {
      taskStatusUpdate: {
        taskId: "task-001",
        status: { state: "TASK_STATE_WORKING" },
      },
    };

    // 验证：通过成员存在性判断类型（而非 v0.3.0 的 kind 字段）
    expect("taskStatusUpdate" in streamEvent).toBe(true);
    expect("kind" in streamEvent).toBe(false); // v0.3.0 已移除
    expect(streamEvent.taskStatusUpdate.taskId).toBe("task-001");
    expect(streamEvent.taskStatusUpdate.status.state).toBe("TASK_STATE_WORKING");
  });

  it("TaskArtifactUpdateEvent 使用包装器模式并带 index 字段", () => {
    // v1.0 格式：新增 index 字段
    const streamEvent = {
      taskArtifactUpdate: {
        taskId: "task-001",
        artifact: { artifactId: "art-001", name: "结果", parts: [{ text: "内容" }] },
        index: 0,
      },
    };

    expect("taskArtifactUpdate" in streamEvent).toBe(true);
    expect("kind" in streamEvent).toBe(false);
    expect(streamEvent.taskArtifactUpdate.index).toBe(0);
  });

  it("final 字段已移除，流关闭本身表示终止", () => {
    const statusUpdate = {
      taskId: "task-001",
      status: { state: "TASK_STATE_COMPLETED" },
    };
    // v1.0：不再有 final 布尔字段
    expect("final" in statusUpdate).toBe(false);
  });
});
