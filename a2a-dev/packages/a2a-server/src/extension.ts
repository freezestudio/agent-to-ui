import { Message, Task, TaskStatusUpdateEvent, TaskArtifactUpdateEvent } from "@a2a-dev/core";

/**
 * 扩展上下文 — 激活的扩展及其参数
 */
export interface ExtensionContext {
  /** 所有已激活的扩展 URI */
  activatedExtensions: Set<string>;
  /** 扩展特定的元数据 */
  metadata: Record<string, unknown>;
}

/**
 * 扩展处理器接口 — 实现此接口定义扩展的行为
 *
 * 对应 A2A 规范 §4.6 Extensions
 */
export interface ExtensionHandler {
  /** 扩展的唯一标识 URI */
  uri: string;
  /** 扩展名称 */
  name: string;
  /** 扩展描述 */
  description: string;
  /**
   * 在消息处理前调用，允许扩展修改消息
   * @param message 原始消息
   * @param ctx 扩展上下文
   * @returns 可选的修改后消息
   */
  beforeProcessMessage?(message: Message, ctx: ExtensionContext): Message | void;
  /**
   * 在消息处理后调用，允许扩展修改任务/事件
   */
  afterProcessMessage?(
    result: { task?: Task; events?: Array<Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent> },
    ctx: ExtensionContext,
  ): void;
}

/**
 * 扩展注册中心 — 管理扩展的注册、激活和调用
 *
 * 对应规范 §4.6.3 Extension Activation
 * 客户端通过 A2A-Extensions 头声明要激活的扩展，
 * 服务端解析头并执行扩展生命周期钩子。
 */
export class ExtensionRegistry {
  private handlers = new Map<string, ExtensionHandler>();

  /** 注册一个扩展处理器 */
  register(handler: ExtensionHandler): void {
    if (this.handlers.has(handler.uri)) {
      console.warn(`  [Extension] ⚠ 扩展 ${handler.uri} 已存在，将被覆盖`);
    }
    this.handlers.set(handler.uri, handler);
    console.log(`  [Extension] 注册扩展: "${handler.name}" (${handler.uri})`);
  }

  /** 获取已注册的所有扩展 URI */
  getRegisteredUris(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 解析 A2A-Extensions 头，返回激活的扩展上下文
   *
   * @param headerValue A2A-Extensions 头的值（逗号分隔的 URI 列表）
   * @returns 扩展上下文，包含已激活的扩展和元数据
   */
  parseExtensions(headerValue?: string): ExtensionContext {
    const activated = new Set<string>();
    const metadata: Record<string, unknown> = {};

    if (!headerValue) {
      return { activatedExtensions: activated, metadata };
    }

    const uris = headerValue
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);

    for (const uri of uris) {
      if (this.handlers.has(uri)) {
        activated.add(uri);
        console.log(`  [Extension] 激活: ${uri}`);
      } else {
        console.log(`  [Extension] ⚠ 未注册的扩展: ${uri}，已忽略`);
      }
    }

    return { activatedExtensions: activated, metadata };
  }

  /**
   * 调用扩展的消息前处理钩子
   */
  applyBeforeProcessMessage(message: Message, ctx: ExtensionContext): Message {
    let modified = { ...message };
    for (const uri of ctx.activatedExtensions) {
      const handler = this.handlers.get(uri);
      if (handler?.beforeProcessMessage) {
        const result = handler.beforeProcessMessage(modified, ctx);
        if (result) modified = result;
      }
    }
    return modified;
  }

  /**
   * 调用扩展的消息后处理钩子
   */
  applyAfterProcessMessage(
    result: { task?: Task; events?: Array<Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent> },
    ctx: ExtensionContext,
  ): void {
    for (const uri of ctx.activatedExtensions) {
      const handler = this.handlers.get(uri);
      handler?.afterProcessMessage?.(result, ctx);
    }
  }
}

// ==================== 内置扩展示例 ====================

/**
 * 时间戳扩展 (Timestamp Extension)
 *
 * 对应 A2A 示例扩展：
 * https://github.com/a2aproject/a2a-samples/tree/main/extensions/timestamp
 *
 * 在消息和制品的 metadata 中添加时间戳信息
 */
export const timestampExtension: ExtensionHandler = {
  uri: "https://a2a-dev.local/ext/timestamp/v1",
  name: "时间戳扩展",
  description: "在消息和制品的 metadata 中添加处理时间戳",
  beforeProcessMessage(message: Message, ctx: ExtensionContext): Message {
    const ts = new Date().toISOString();
    return {
      ...message,
      metadata: {
        ...message.metadata,
        [`${this.uri}/received-at`]: ts,
      },
    };
  },
};

/**
 * 日志扩展 (Logging Extension)
 *
 * 记录所有经过扩展处理的消息和任务事件
 */
export const loggingExtension: ExtensionHandler = {
  uri: "https://a2a-dev.local/ext/logging/v1",
  name: "日志扩展",
  description: "记录所有经过扩展处理的消息和任务事件",
  beforeProcessMessage(message: Message): Message {
    console.log(
      `  [Extension/Log] 收到消息: ${message.messageId} (${message.parts[0]?.text?.slice(0, 30)}...)`,
    );
    return message;
  },
  afterProcessMessage(result): void {
    if (result.task) {
      console.log(`  [Extension/Log] 任务完成: ${result.task.id} → ${result.task.status.state}`);
    }
  },
};
