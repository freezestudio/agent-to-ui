import { Task, TaskState, PushNotificationConfig } from "@a2a-dev/core";

/**
 * 任务存储接口 - 管理任务的持久化和检索
 * A2A 规范 3.1.3-3.1.5
 */
export interface TaskStore {
  createTask(task: Task): Promise<Task>;
  getTask(taskId: string): Promise<Task | null>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  listTasks(filter?: TaskFilter): Promise<{ tasks: Task[]; nextPageToken: string }>;
  deleteTask(taskId: string): Promise<void>;
}

export interface TaskFilter {
  contextId?: string;
  status?: TaskState;
  pageSize?: number;
  pageToken?: string;
}

/**
 * 内存任务存储 - A2A 规范参考实现
 */
export class InMemoryTaskStore implements TaskStore {
  private tasks: Map<string, Task> = new Map();
  private pushConfigs: Map<string, PushNotificationConfig[]> = new Map();

  async createTask(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);
    return task;
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) ?? null;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const existing = this.tasks.get(taskId);
    if (!existing) {
      throw new Error(`TaskNotFoundError: 任务 ${taskId} 不存在`);
    }
    const updated: Task = {
      ...existing,
      ...updates,
      status: updates.status ?? existing.status,
      lastModified: new Date().toISOString(),
    };
    this.tasks.set(taskId, updated);
    return updated;
  }

  async listTasks(filter?: TaskFilter): Promise<{ tasks: Task[]; nextPageToken: string }> {
    let tasks = Array.from(this.tasks.values());

    if (filter?.contextId) {
      tasks = tasks.filter((t) => t.contextId === filter.contextId);
    }
    if (filter?.status) {
      tasks = tasks.filter((t) => t.status.state === filter.status);
    }

    // 按最后修改时间降序排序
    tasks.sort((a, b) => {
      const timeA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const timeB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return timeB - timeA;
    });

    // 基于游标的分页 (A2A v1.0 规范 3.1.4)
    const pageSize = filter?.pageSize ?? 50;
    const startIndex = filter?.pageToken
      ? tasks.findIndex((t) => t.id === filter.pageToken) + 1
      : 0;

    const paged = tasks.slice(startIndex, startIndex + pageSize);
    const nextPageToken =
      startIndex + pageSize < tasks.length ? (paged[paged.length - 1]?.id ?? "") : "";

    return { tasks: paged, nextPageToken };
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
    this.pushConfigs.delete(taskId);
  }

  // 推送通知配置管理
  async setPushConfig(taskId: string, config: PushNotificationConfig): Promise<void> {
    const configs = this.pushConfigs.get(taskId) ?? [];
    configs.push({ ...config, configId: crypto.randomUUID() });
    this.pushConfigs.set(taskId, configs);
  }

  async getPushConfig(taskId: string, configId: string): Promise<PushNotificationConfig | null> {
    const configs = this.pushConfigs.get(taskId) ?? [];
    return configs.find((c) => c.configId === configId) ?? null;
  }

  async listPushConfigs(taskId: string): Promise<PushNotificationConfig[]> {
    return this.pushConfigs.get(taskId) ?? [];
  }

  async deletePushConfig(taskId: string, configId: string): Promise<void> {
    const configs = this.pushConfigs.get(taskId) ?? [];
    this.pushConfigs.set(
      taskId,
      configs.filter((c) => c.configId !== configId),
    );
  }
}
