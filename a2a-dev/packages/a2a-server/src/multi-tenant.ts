import { AgentCard } from "@a2a-dev/core";
import { AgentExecutor, RequestContext, EventQueue } from "./agent.js";
import { A2ARequestHandler } from "./handler.js";
import { TaskStore, InMemoryTaskStore } from "./task-store.js";
import { PushNotificationService } from "./push-notify.js";

/**
 * 租户配置 — 每个租户（智能体）的完整定义
 */
export interface TenantConfig {
  /** 租户标识，对应 AgentInterface.tenant 和请求中的 tenant 字段 */
  id: string;
  /** 该租户的智能体卡片 */
  agentCard: AgentCard;
  /** 可选的扩展智能体卡片 */
  extendedAgentCard?: AgentCard;
  /** 该租户使用的任务存储（默认共享全局存储） */
  taskStore?: TaskStore;
  /** 该租户的业务执行器 */
  executor: AgentExecutor;
}

/**
 * 多租户路由器 — 根据请求中的 tenant 字段分派到不同的 AgentExecutor
 *
 * 对应 A2A 规范 §8.3.2 / topics/multi-tenancy.md
 *
 * 三种路由方式（此处实现方式 #3：基于 tenant 字段）：
 * 1. URL 路径路由 — 每个智能体不同 URL 前缀
 * 2. 认证头路由 — 通过 JWT claims / API Key 区分
 * 3. ✅ tenant 字段路由 — 请求消息中的不透明字符串
 */
export class MultiTenantRouter {
  private tenants = new Map<
    string,
    {
      config: TenantConfig;
      handler: A2ARequestHandler;
    }
  >();

  private pushService: PushNotificationService;

  constructor(pushService?: PushNotificationService) {
    this.pushService = pushService ?? new PushNotificationService();
  }

  /**
   * 注册一个租户
   */
  register(config: TenantConfig): void {
    if (this.tenants.has(config.id)) {
      throw new Error(`租户 "${config.id}" 已注册`);
    }

    const store = config.taskStore ?? new InMemoryTaskStore();
    const notify = this.pushService;

    // 自定义 handler：按规范 §8.3.2 客户端必须回显 tenant 值
    const originalHandler = new A2ARequestHandler(
      config.executor,
      store,
      config.agentCard,
      config.extendedAgentCard,
    );

    this.tenants.set(config.id, {
      config,
      handler: originalHandler,
    });

    console.log(`  [Tenant] 注册租户: "${config.id}" → ${config.agentCard.name}`);
  }

  /**
   * 获取所有注册的智能体卡片（用于合并发现端点）
   */
  getAgentCards(): AgentCard[] {
    return Array.from(this.tenants.values()).map((t) => t.config.agentCard);
  }

  /**
   * 根据 tenant 值路由到对应的 handler
   *
   * @param tenant tenant 标识符（来自请求消息或 URL 路径）
   * @returns 对应的 A2ARequestHandler
   */
  route(tenant?: string): { handler: A2ARequestHandler; agentCard: AgentCard } {
    const key = tenant ?? "default";

    const entry = this.tenants.get(key);
    if (!entry) {
      // 如果指定了不存在的租户，返回默认租户或报错
      const defaultEntry = this.tenants.get("default");
      if (defaultEntry) {
        return { handler: defaultEntry.handler, agentCard: defaultEntry.config.agentCard };
      }
      throw new Error(`未找到租户 "${key}"，且无默认租户`);
    }
    return { handler: entry.handler, agentCard: entry.config.agentCard };
  }

  /**
   * 创建合并的智能体发现卡片列表
   * 用于在 `/.well-known/agent-card.json` 返回所有租户信息
   */
  createDiscoveryDocument(): object {
    const cards = this.getAgentCards();
    if (cards.length === 1) {
      return cards[0];
    }
    return {
      name: "多租户智能体网关",
      description: "此端点托管多个智能体，请通过 supportedInterfaces[].tenant 区分",
      version: "1.0.0",
      tenants: cards.map((c) => ({
        name: c.name,
        description: c.description,
        tenant: c.supportedInterfaces[0]?.tenant,
        skills: c.skills?.map((s) => ({ id: s.id, name: s.name })),
      })),
    };
  }

  /**
   * 处理 A2A 方法调用（自动按 tenant 路由）
   */
  async handleMethod(method: string, params: any, tenant?: string): Promise<unknown> {
    const { handler } = this.route(tenant);
    const result = await handler.handleMethod(method, params);
    return result;
  }
}
