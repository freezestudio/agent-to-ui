import {
  AgentCard,
  Task,
  TaskState,
  Message,
  Role,
  SendMessageRequest,
  StreamResponse,
} from "@a2a-dev/core";

/**
 * A2A 客户端配置
 */
export interface A2AClientConfig {
  agentCardUrl?: string;
  baseUrl?: string;
  protocolBinding?: "JSONRPC" | "HTTP+JSON" | "gRPC";
  protocolVersion?: string;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
}

/**
 * A2A 客户端 - 根据 A2A v1.0 规范与 A2A 服务器通信
 *
 * 核心功能：
 * - 发现智能体（获取 AgentCard）
 * - 发送消息（SendMessage）
 * - 流式消息（SendStreamingMessage）
 * - 任务管理（GetTask、ListTasks、CancelTask）
 */
export class A2AClient {
  private config: A2AClientConfig;
  private agentCard: AgentCard | null = null;

  constructor(config: A2AClientConfig = {}) {
    this.config = {
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      ...config,
    };
  }

  // ========== 智能体发现 (A2A 规范 4.4) ==========

  /**
   * 从 Well-Known URI 获取智能体卡片
   * A2A 规范 - 发现策略 1: Well-Known URI
   */
  async discover(baseUrl?: string): Promise<AgentCard> {
    const url = baseUrl ?? this.config.baseUrl;
    if (!url) {
      throw new Error("需要提供 baseUrl 来发现智能体卡片");
    }

    const agentCardUrl = `${url.replace(/\/$/, "")}/.well-known/agent-card.json`;
    const response = await fetch(agentCardUrl, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`获取智能体卡片失败: ${response.status} ${response.statusText}`);
    }

    this.agentCard = (await response.json()) as AgentCard;
    return this.agentCard;
  }

  /**
   * 直接设置智能体卡片（用于已获取或本地配置的场景）
   */
  setAgentCard(card: AgentCard): void {
    this.agentCard = card;
  }

  /**
   * 获取当前缓存的智能体卡片
   */
  getAgentCard(): AgentCard | null {
    return this.agentCard;
  }

  /**
   * 获取扩展智能体卡片 (A2A 规范 3.1.11)
   */
  async getExtendedAgentCard(): Promise<AgentCard> {
    if (!this.agentCard?.capabilities?.extendedAgentCard) {
      throw new Error("智能体不支持扩展智能体卡片");
    }

    const endpoint = this.getEndpoint();
    const response = await this.jsonRpcCall(endpoint, "GetExtendedAgentCard", {});

    return response as AgentCard;
  }

  // ========== 核心操作 (A2A 规范 3.1) ==========

  /**
   * 3.1.1 发送消息
   */
  async sendMessage(message: Omit<Message, "messageId"> & { messageId?: string }): Promise<Task> {
    const endpoint = this.getEndpoint();
    const msg: Message = {
      ...message,
      messageId: message.messageId ?? crypto.randomUUID(),
      role: message.role ?? Role.ROLE_USER,
    };

    const request: SendMessageRequest = { message: msg };
    const response = await this.jsonRpcCall(endpoint, "SendMessage", request);

    return (response as { task: Task }).task;
  }

  /**
   * 3.1.2 发送流式消息
   * 返回一个 AsyncGenerator，用于实时接收事件
   */
  async *sendStreamingMessage(
    message: Omit<Message, "messageId"> & { messageId?: string },
  ): AsyncGenerator<StreamResponse> {
    const endpoint = this.getEndpoint();
    const msg: Message = {
      ...message,
      messageId: message.messageId ?? crypto.randomUUID(),
      role: message.role ?? Role.ROLE_USER,
    };

    const request: SendMessageRequest = { message: msg };

    // 使用 SSE 进行流式传输
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method: "SendStreamingMessage",
        params: request,
      }),
    });

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("响应体不可读");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data as StreamResponse;
            } catch {
              // 跳过无法解析的 data
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 3.1.3 获取任务
   */
  async getTask(taskId: string, historyLength?: number): Promise<Task> {
    const endpoint = this.getEndpoint();
    const response = await this.jsonRpcCall(endpoint, "GetTask", {
      taskId,
      historyLength,
    });

    return response as Task;
  }

  /**
   * 3.1.4 列出任务
   */
  async listTasks(filter?: {
    contextId?: string;
    status?: TaskState;
    pageSize?: number;
    pageToken?: string;
    includeArtifacts?: boolean;
  }): Promise<{ tasks: Task[]; nextPageToken: string }> {
    const endpoint = this.getEndpoint();
    const response = await this.jsonRpcCall(endpoint, "ListTasks", filter ?? {});

    return response as { tasks: Task[]; nextPageToken: string };
  }

  /**
   * 3.1.5 取消任务
   */
  async cancelTask(taskId: string): Promise<Task> {
    const endpoint = this.getEndpoint();
    const response = await this.jsonRpcCall(endpoint, "CancelTask", { taskId });

    return response as Task;
  }

  // ========== 辅助方法 ==========

  /**
   * 获取智能体的服务端点
   */
  private getEndpoint(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }
    if (this.agentCard?.supportedInterfaces?.length) {
      return this.agentCard.supportedInterfaces[0].url;
    }
    throw new Error("未配置服务端点");
  }

  /**
   * 获取 HTTP 请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "A2A-Version": this.config.protocolVersion ?? "1.0",
      ...this.config.defaultHeaders,
    };

    if (this.config.authToken) {
      headers["Authorization"] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  /**
   * 执行 JSON-RPC 2.0 调用
   * A2A 规范 7.3 - JSON-RPC 方法调用
   */
  private async jsonRpcCall(endpoint: string, method: string, params: unknown): Promise<unknown> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`JSON-RPC 调用失败 [${response.status}]: ${errorBody}`);
    }

    const json = await response.json();

    if (json.error) {
      const a2aError = json.error;
      const error = new Error(a2aError.message ?? "A2A 错误");
      (error as any).code = a2aError.code;
      (error as any).details = a2aError.details;
      throw error;
    }

    return json.result;
  }
}

/**
 * 便捷函数：创建一条文本消息
 */
export function createTextMessage(text: string, role: Role = Role.ROLE_USER): Message {
  return {
    role,
    parts: [{ text }],
    messageId: crypto.randomUUID(),
  };
}
