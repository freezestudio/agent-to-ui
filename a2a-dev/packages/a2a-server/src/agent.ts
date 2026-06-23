import {
  Task,
  Message,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  TaskState,
  Role,
} from "@a2a-dev/core";

/**
 * 请求上下文 - 包含当前请求的信息
 */
export interface RequestContext {
  message: Message;
  task?: Task;
  authenticatedUser?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 事件队列 - 用于向客户端发送事件
 */
export interface EventQueue {
  push(event: Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent): void;
  complete(): void;
  error(error: Error): void;
}

/**
 * 智能体执行器接口
 * A2A 规范 3.1 - 核心操作
 *
 * 开发者实现此接口来定义智能体的业务逻辑
 */
export interface AgentExecutor {
  /**
   * 处理传入请求并生成响应/事件
   * @param context - 请求上下文（包含消息和当前任务）
   * @param eventQueue - 事件队列，用于发送回事件
   */
  execute(context: RequestContext, eventQueue: EventQueue): Promise<void>;

  /**
   * 取消正在进行的任务
   * @param context - 请求上下文
   * @param eventQueue - 事件队列
   */
  cancel(context: RequestContext, eventQueue: EventQueue): Promise<void>;
}

/**
 * 简单事件队列实现
 */
export class SimpleEventQueue implements EventQueue {
  private events: Array<Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent> = [];
  private _completed = false;
  private _error: Error | null = null;

  push(event: Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent): void {
    this.events.push(event);
  }

  complete(): void {
    this._completed = true;
  }

  error(error: Error): void {
    this._error = error;
    this._completed = true;
  }

  getEvents(): Array<Task | TaskStatusUpdateEvent | TaskArtifactUpdateEvent> {
    return this.events;
  }

  isCompleted(): boolean {
    return this._completed;
  }

  getError(): Error | null {
    return this._error;
  }
}

/**
 * Hello World 智能体执行器 - 示例实现
 * 演示 A2A 规范中的基本任务生命周期
 */
export class HelloWorldAgentExecutor implements AgentExecutor {
  async execute(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    // 第 1 步：创建新任务（如果上下文中没有任务）
    if (!context.task) {
      const task: Task = {
        id: crypto.randomUUID(),
        status: { state: TaskState.TASK_STATE_SUBMITTED },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      eventQueue.push(task);
    }

    // 第 2 步：发送工作中状态
    eventQueue.push({
      taskId: context.task?.id ?? "pending",
      status: {
        state: TaskState.TASK_STATE_WORKING,
        message: {
          role: Role.ROLE_AGENT,
          parts: [{ text: "正在处理请求..." }],
          messageId: crypto.randomUUID(),
        },
      },
    });

    // 第 3 步：执行业务逻辑（此处为简单 echo）
    const responseText = `Hello, World! 你说: ${context.message.parts[0]?.text ?? ""}`;

    // 第 4 步：发送制品更新
    eventQueue.push({
      taskId: context.task?.id ?? "pending",
      artifact: {
        artifactId: crypto.randomUUID(),
        name: "result",
        parts: [{ text: responseText }],
        lastChunk: true,
      },
    });

    // 第 5 步：发送完成状态
    eventQueue.push({
      taskId: context.task?.id ?? "pending",
      status: {
        state: TaskState.TASK_STATE_COMPLETED,
        timestamp: new Date().toISOString(),
      },
    });

    eventQueue.complete();
  }

  async cancel(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    eventQueue.push({
      taskId: context.task?.id ?? "unknown",
      status: {
        state: TaskState.TASK_STATE_CANCELED,
        timestamp: new Date().toISOString(),
      },
    });
    eventQueue.complete();
  }
}
