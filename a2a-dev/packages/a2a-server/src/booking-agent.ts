import {
  Task,
  Message,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  TaskState,
  Role,
} from "@a2a-dev/core";
import { AgentExecutor, RequestContext, EventQueue } from "./agent.js";

/**
 * 多轮对话订票智能体 — 演示 A2A 规范的 input-required 状态流转
 *
 * 对话流程（规范 §3.4 多轮交互）：
 *   用户: "帮我订票"
 *   智能体: INPUT_REQUIRED → "请问您的目的地是？"
 *   用户: "北京"
 *   智能体: INPUT_REQUIRED → "请问什么时间出发？"
 *   用户: "明天"
 *   智能体: COMPLETED → "已为您预订明天前往北京的行程"
 *
 * 关键：通过 sessionStore 跟踪对话状态，而非依赖 context.task 的有无
 *（因为 handler 始终会创建新 Task 对象）
 */
export class MultiTurnBookingAgentExecutor implements AgentExecutor {
  // 模拟数据库：存储每个 task 的对话中间状态
  private sessionStore = new Map<
    string,
    { phase: "initial" | "asked_dest" | "asked_date"; destination?: string }
  >();

  async execute(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    const taskId = context.task?.id ?? crypto.randomUUID();
    const session = this.sessionStore.get(taskId) ?? { phase: "initial" as const };
    const userText = context.message.parts[0]?.text ?? "";
    const taskStatus: Partial<Task> = {
      id: taskId,
      createdAt: context.task?.createdAt ?? new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    switch (session.phase) {
      // ===== Phase 1: 初始请求 =====
      case "initial": {
        // 创建工作状态
        eventQueue.push({
          taskId,
          status: {
            state: TaskState.TASK_STATE_WORKING,
            message: {
              role: Role.ROLE_AGENT,
              parts: [{ text: "正在为您处理订票请求..." }],
              messageId: crypto.randomUUID(),
            },
          },
        });

        // 询问目的地 → 进入 input-required
        this.sessionStore.set(taskId, { phase: "asked_dest" });
        eventQueue.push({
          taskId,
          status: {
            state: TaskState.TASK_STATE_INPUT_REQUIRED,
            message: {
              role: Role.ROLE_AGENT,
              parts: [{ text: "请问您的目的地是？" }],
              messageId: crypto.randomUUID(),
            },
          },
        });
        eventQueue.complete();
        return;
      }

      // ===== Phase 2: 用户已回答目的地 =====
      case "asked_dest": {
        this.sessionStore.set(taskId, {
          phase: "asked_date",
          destination: userText,
        });

        eventQueue.push({
          taskId,
          status: {
            state: TaskState.TASK_STATE_INPUT_REQUIRED,
            message: {
              role: Role.ROLE_AGENT,
              parts: [{ text: `好的，目的地是 ${userText}。请问什么时间出发？` }],
              messageId: crypto.randomUUID(),
            },
          },
        });
        eventQueue.complete();
        return;
      }

      // ===== Phase 3: 用户已回答时间 → 完成 =====
      case "asked_date": {
        this.sessionStore.delete(taskId);

        eventQueue.push({
          taskId,
          artifact: {
            artifactId: crypto.randomUUID(),
            name: "booking-confirmation",
            parts: [
              {
                text: [
                  `✅ 已为您预订 ${userText} 前往 ${session.destination} 的行程。`,
                  `订单号: ${taskId.slice(0, 8).toUpperCase()}`,
                  `祝旅途愉快！`,
                ].join("\n"),
              },
            ],
            lastChunk: true,
          },
        });

        eventQueue.push({
          taskId,
          status: {
            state: TaskState.TASK_STATE_COMPLETED,
            timestamp: new Date().toISOString(),
          },
        });
        eventQueue.complete();
        return;
      }
    }
  }

  async cancel(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    const taskId = context.task?.id ?? "unknown";
    this.sessionStore.delete(taskId);

    eventQueue.push({
      taskId,
      status: {
        state: TaskState.TASK_STATE_CANCELED,
        timestamp: new Date().toISOString(),
      },
    });
    eventQueue.complete();
  }
}
