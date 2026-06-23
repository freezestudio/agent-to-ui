import { AgentCard, SendMessageRequest, Task, TaskState, A2AErrorType } from "@a2a-dev/core";
import { AgentExecutor, RequestContext, SimpleEventQueue } from "./agent.js";
import { TaskStore } from "./task-store.js";

/**
 * A2A JSON-RPC 请求处理器
 * 根据 A2A v1.0 规范 3.1 处理所有核心操作
 */
export class A2ARequestHandler {
  constructor(
    private executor: AgentExecutor,
    private taskStore: TaskStore,
    private agentCard: AgentCard,
    private extendedAgentCard?: AgentCard,
  ) {}

  /**
   * 处理 JSON-RPC 方法调用
   * A2A 规范 7.3
   */
  async handleMethod(method: string, params: Record<string, unknown>): Promise<unknown> {
    switch (method) {
      case "SendMessage":
        return this.handleSendMessage(params as unknown as SendMessageRequest);
      case "SendStreamingMessage":
        return this.handleSendStreamingMessage(params as unknown as SendMessageRequest);
      case "GetTask":
        return this.handleGetTask(params as { taskId: string; historyLength?: number });
      case "ListTasks":
        return this.handleListTasks(
          params as {
            contextId?: string;
            status?: string;
            pageSize?: number;
            pageToken?: string;
            includeArtifacts?: boolean;
          },
        );
      case "CancelTask":
        return this.handleCancelTask(params as { taskId: string });
      case "GetExtendedAgentCard":
        return this.handleGetExtendedAgentCard();
      case "CreateTaskPushNotificationConfig":
        return this.handleCreatePushConfig(
          params as {
            taskId: string;
            url: string;
            token?: string;
          },
        );
      case "GetTaskPushNotificationConfig":
        return this.handleGetPushConfig(params as { taskId: string; configId: string });
      case "ListTaskPushNotificationConfigs":
        return this.handleListPushConfigs(params as { taskId: string });
      case "DeleteTaskPushNotificationConfig":
        return this.handleDeletePushConfig(params as { taskId: string; configId: string });
      default:
        throw this.createError(A2AErrorType.UNSUPPORTED_OPERATION, `不支持的方法: ${method}`);
    }
  }

  // ========== 3.1.1 发送消息 ==========
  private async handleSendMessage(
    request: SendMessageRequest,
  ): Promise<{ task?: Task; message?: unknown }> {
    // 多轮对话：如果请求包含 taskId，从存储中恢复已有任务
    let existingTask: Task | null = null;
    if (request.message.taskId) {
      existingTask = await this.taskStore.getTask(request.message.taskId);
      if (!existingTask) {
        throw this.createError(
          A2AErrorType.TASK_NOT_FOUND,
          `任务 ${request.message.taskId} 未找到`,
        );
      }
    }

    const task: Task = existingTask ?? {
      id: crypto.randomUUID(),
      contextId: request.message.contextId ?? crypto.randomUUID(),
      status: { state: TaskState.TASK_STATE_SUBMITTED },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    if (!existingTask) {
      await this.taskStore.createTask(task);
    }

    const context: RequestContext = {
      message: request.message,
      task,
    };

    const eventQueue = new SimpleEventQueue();
    await this.executor.execute(context, eventQueue);

    const events = eventQueue.getEvents();

    // 从事件中提取最终状态，更新 Task 对象
    let finalTask = { ...task };
    for (const event of events) {
      if (this.isTask(event)) {
        finalTask = { ...finalTask, ...event };
      } else if (this.isStatusUpdate(event)) {
        finalTask = {
          ...finalTask,
          status: { ...finalTask.status, ...event.status },
          lastModified: new Date().toISOString(),
        };
      } else if (this.isArtifactUpdate(event)) {
        const existing = finalTask.artifacts ?? [];
        if (event.artifact.append && existing.length > 0) {
          existing[existing.length - 1] = event.artifact;
        } else {
          existing.push(event.artifact);
        }
        finalTask = { ...finalTask, artifacts: existing, lastModified: new Date().toISOString() };
      }
    }

    await this.taskStore.updateTask(finalTask.id, finalTask);
    return { task: finalTask };
  }

  // ========== 3.1.2 发送流式消息 ==========
  private async handleSendStreamingMessage(request: SendMessageRequest): Promise<{
    task?: Task;
    stream?: AsyncGenerator<unknown>;
  }> {
    // 验证流式传输能力
    if (!this.agentCard.capabilities?.streaming) {
      throw this.createError(A2AErrorType.UNSUPPORTED_OPERATION, "此智能体不支持流式传输");
    }

    const task: Task = {
      id: crypto.randomUUID(),
      contextId: request.message.contextId ?? crypto.randomUUID(),
      status: { state: TaskState.TASK_STATE_SUBMITTED },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    await this.taskStore.createTask(task);

    return {
      task,
      stream: this.generateStream(task, request),
    };
  }

  private async *generateStream(task: Task, request: SendMessageRequest): AsyncGenerator<unknown> {
    const context: RequestContext = { message: request.message, task };
    const eventQueue = new SimpleEventQueue();

    await this.executor.execute(context, eventQueue);

    for (const event of eventQueue.getEvents()) {
      yield this.formatStreamEvent(event);
    }
  }

  private formatStreamEvent(event: unknown): unknown {
    // A2A v1.0 流事件格式（基于包装器，非 kind 字段）
    if (this.isTask(event)) {
      return { task: event };
    }
    if (this.isStatusUpdate(event)) {
      return { statusUpdate: event };
    }
    if (this.isArtifactUpdate(event)) {
      return { artifactUpdate: event };
    }
    return event;
  }

  // ========== 3.1.3 获取任务 ==========
  private async handleGetTask(params: { taskId: string; historyLength?: number }): Promise<Task> {
    const task = await this.taskStore.getTask(params.taskId);
    if (!task) {
      throw this.createError(A2AErrorType.TASK_NOT_FOUND, `任务 ${params.taskId} 未找到`);
    }
    return task;
  }

  // ========== 3.1.4 列出任务 ==========
  private async handleListTasks(params: {
    contextId?: string;
    status?: string;
    pageSize?: number;
    pageToken?: string;
    includeArtifacts?: boolean;
  }): Promise<{ tasks: Task[]; nextPageToken: string }> {
    const result = await this.taskStore.listTasks({
      contextId: params.contextId,
      status: params.status as TaskState | undefined,
      pageSize: params.pageSize,
      pageToken: params.pageToken,
    });

    if (!params.includeArtifacts) {
      result.tasks = result.tasks.map((t) => ({ ...t, artifacts: undefined }));
    }

    return result;
  }

  // ========== 3.1.5 取消任务 ==========
  private async handleCancelTask(params: { taskId: string }): Promise<Task> {
    const task = await this.taskStore.getTask(params.taskId);
    if (!task) {
      throw this.createError(A2AErrorType.TASK_NOT_FOUND, `任务 ${params.taskId} 未找到`);
    }

    const terminalStates: TaskState[] = [
      TaskState.TASK_STATE_COMPLETED,
      TaskState.TASK_STATE_FAILED,
      TaskState.TASK_STATE_CANCELED,
      TaskState.TASK_STATE_REJECTED,
    ];

    if (terminalStates.includes(task.status.state)) {
      throw this.createError(
        A2AErrorType.TASK_NOT_CANCELABLE,
        `任务 ${params.taskId} 已处于终止状态: ${task.status.state}`,
      );
    }

    const context: RequestContext = { message: {} as never, task };
    const eventQueue = new SimpleEventQueue();
    await this.executor.cancel(context, eventQueue);

    const updated = await this.taskStore.updateTask(params.taskId, {
      status: { state: TaskState.TASK_STATE_CANCELED },
    });

    return updated;
  }

  // ========== 3.1.11 获取扩展智能体卡片 ==========
  private async handleGetExtendedAgentCard(): Promise<AgentCard> {
    if (!this.agentCard.capabilities?.extendedAgentCard) {
      throw this.createError(A2AErrorType.UNSUPPORTED_OPERATION, "此智能体不支持扩展智能体卡片");
    }
    if (!this.extendedAgentCard) {
      throw this.createError(
        A2AErrorType.EXTENDED_AGENT_CARD_NOT_CONFIGURED,
        "扩展智能体卡片未配置",
      );
    }
    return this.extendedAgentCard;
  }

  // ========== 推送通知配置操作 ==========
  private async handleCreatePushConfig(params: { taskId: string; url: string; token?: string }) {
    const task = await this.taskStore.getTask(params.taskId);
    if (!task) {
      throw this.createError(A2AErrorType.TASK_NOT_FOUND, `任务 ${params.taskId} 未找到`);
    }
    if (!this.agentCard.capabilities?.pushNotifications) {
      throw this.createError(
        A2AErrorType.PUSH_NOTIFICATION_NOT_SUPPORTED,
        "此智能体不支持推送通知",
      );
    }

    const store = this.taskStore as any;
    if (typeof store.setPushConfig === "function") {
      await store.setPushConfig(params.taskId, { url: params.url, token: params.token });
    }

    return { url: params.url, token: params.token, configId: crypto.randomUUID() };
  }

  private async handleGetPushConfig(params: { taskId: string; configId: string }) {
    const store = this.taskStore as any;
    if (typeof store.getPushConfig === "function") {
      const config = await store.getPushConfig(params.taskId, params.configId);
      if (!config) {
        throw this.createError(A2AErrorType.TASK_NOT_FOUND, "推送配置未找到");
      }
      return config;
    }
    throw this.createError(A2AErrorType.UNSUPPORTED_OPERATION, "推送配置管理不可用");
  }

  private async handleListPushConfigs(params: { taskId: string }) {
    const store = this.taskStore as any;
    if (typeof store.listPushConfigs === "function") {
      const configs = await store.listPushConfigs(params.taskId);
      return { configs };
    }
    return { configs: [] };
  }

  private async handleDeletePushConfig(params: { taskId: string; configId: string }) {
    const store = this.taskStore as any;
    if (typeof store.deletePushConfig === "function") {
      await store.deletePushConfig(params.taskId, params.configId);
    }
    return {};
  }

  // ========== 辅助方法 ==========
  private isTask(event: unknown): event is Task {
    return typeof event === "object" && event !== null && "id" in event && "status" in event;
  }

  private isStatusUpdate(event: unknown): event is { taskId: string; status: unknown } {
    return (
      typeof event === "object" &&
      event !== null &&
      "taskId" in event &&
      "status" in event &&
      !("artifact" in event)
    );
  }

  private isArtifactUpdate(event: unknown): event is { taskId: string; artifact: unknown } {
    return typeof event === "object" && event !== null && "taskId" in event && "artifact" in event;
  }

  private createError(
    type: A2AErrorType,
    message: string,
  ): Error & { a2aErrorType: A2AErrorType; code: number; httpStatus: number; details: unknown[] } {
    const httpStatus = this.getHttpStatus(type);
    const code = this.getErrorCode(type);
    const error = new Error(message) as any;
    error.a2aErrorType = type;
    error.code = code;
    error.httpStatus = httpStatus;
    error.details = [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        reason: type
          .replace(/([A-Z])/g, "_$1")
          .toUpperCase()
          .replace(/^_/, ""),
        domain: "a2a-protocol.org",
        metadata: {},
      },
    ];
    return error;
  }

  private getHttpStatus(type: A2AErrorType): number {
    const map: Record<string, number> = {
      [A2AErrorType.TASK_NOT_FOUND]: 404,
      [A2AErrorType.TASK_NOT_CANCELABLE]: 400,
      [A2AErrorType.PUSH_NOTIFICATION_NOT_SUPPORTED]: 400,
      [A2AErrorType.UNSUPPORTED_OPERATION]: 400,
      [A2AErrorType.CONTENT_TYPE_NOT_SUPPORTED]: 400,
      [A2AErrorType.INVALID_AGENT_RESPONSE]: 500,
      [A2AErrorType.EXTENDED_AGENT_CARD_NOT_CONFIGURED]: 400,
      [A2AErrorType.EXTENSION_SUPPORT_REQUIRED]: 400,
      [A2AErrorType.VERSION_NOT_SUPPORTED]: 400,
    };
    return map[type] ?? 500;
  }

  private getErrorCode(type: A2AErrorType): number {
    const codeMap: Record<string, number> = {
      [A2AErrorType.TASK_NOT_FOUND]: -32001,
      [A2AErrorType.TASK_NOT_CANCELABLE]: -32002,
      [A2AErrorType.PUSH_NOTIFICATION_NOT_SUPPORTED]: -32003,
      [A2AErrorType.UNSUPPORTED_OPERATION]: -32004,
      [A2AErrorType.CONTENT_TYPE_NOT_SUPPORTED]: -32005,
      [A2AErrorType.INVALID_AGENT_RESPONSE]: -32006,
      [A2AErrorType.EXTENDED_AGENT_CARD_NOT_CONFIGURED]: -32007,
      [A2AErrorType.EXTENSION_SUPPORT_REQUIRED]: -32008,
      [A2AErrorType.VERSION_NOT_SUPPORTED]: -32009,
    };
    return codeMap[type] ?? -32603;
  }
}
