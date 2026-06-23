import { PushNotificationConfig, StreamResponse } from "@a2a-dev/core";

/**
 * 推送通知服务 — 向客户端注册的 Webhook 发送异步任务更新
 *
 * 对应 A2A 规范 §3.5.3 / §4.3
 * 当任务达到终端状态时，通过 HTTP POST 通知客户端
 */
export class PushNotificationService {
  private configs = new Map<string, PushNotificationConfig[]>();

  /**
   * 为指定任务注册 Webhook 配置
   */
  register(taskId: string, config: PushNotificationConfig): void {
    const list = this.configs.get(taskId) ?? [];
    list.push({ ...config, configId: crypto.randomUUID() });
    this.configs.set(taskId, list);
  }

  /**
   * 获取任务的 Webhook 配置列表
   */
  getConfigs(taskId: string): PushNotificationConfig[] {
    return this.configs.get(taskId) ?? [];
  }

  /**
   * 删除指定的 Webhook 配置
   */
  remove(taskId: string, configId: string): boolean {
    const list = this.configs.get(taskId);
    if (!list) return false;
    const filtered = list.filter((c) => c.configId !== configId);
    if (filtered.length === 0) {
      this.configs.delete(taskId);
    } else {
      this.configs.set(taskId, filtered);
    }
    return list.length !== filtered.length;
  }

  /**
   * 任务状态变更时，向所有注册的 Webhook 发送通知
   *
   * 对应规范 §4.3.3 Push Notification Payload
   * 负载格式与 StreamResponse 一致
   */
  async notify(taskId: string, payload: StreamResponse): Promise<void> {
    const configs = this.configs.get(taskId);
    if (!configs || configs.length === 0) return;

    const body = JSON.stringify(payload);

    for (const config of configs) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/a2a+json",
        };

        if (config.authentication) {
          headers["Authorization"] =
            `${config.authentication.scheme} ${config.authentication.credentials}`;
        } else if (config.token) {
          headers["Authorization"] = `Bearer ${config.token}`;
        }

        console.log(`  [PushNotify] → POST ${config.url} (task=${taskId})`);

        await fetch(config.url, {
          method: "POST",
          headers,
          body,
          // 规范建议 10-30 秒超时
          signal: AbortSignal.timeout(15_000),
        });
      } catch (err) {
        console.error(`  [PushNotify] ⚠ 通知失败 ${config.url}:`, (err as Error).message);
      }
    }
  }
}
