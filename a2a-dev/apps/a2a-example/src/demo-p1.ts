/**
 * A2A v1.0 综合演示服务器（P1 功能）
 *
 * 演示：
 * 1. 多租户路由 — 单端点服务"订票"和"天气"两个智能体
 * 2. 扩展激活 — 时间戳扩展 + 日志扩展
 * 3. P0 功能：多轮对话、取消任务、推送通知
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { AgentCard } from "@a2a-dev/core";
import {
  HelloWorldAgentExecutor,
  MultiTurnBookingAgentExecutor,
  SimpleEventQueue,
  PushNotificationService,
  MultiTenantRouter,
  ExtensionRegistry,
  timestampExtension,
  loggingExtension,
} from "@a2a-dev/server";

const PORT = parseInt(process.env.PORT || "9999", 10);
const HOST = process.env.HOST || "127.0.0.1";

// ==================== 天气智能体执行器 ====================
class WeatherAgentExecutor {
  async execute(ctx: any, eq: any) {
    const city = ctx.message.parts[0]?.text ?? "未知";
    eq.push({
      taskId: ctx.task?.id ?? "pending",
      status: { state: "TASK_STATE_WORKING" },
    });
    eq.push({
      taskId: ctx.task?.id ?? "pending",
      artifact: {
        artifactId: crypto.randomUUID(),
        name: "weather-report",
        parts: [{ text: `☀️ ${city} 今日天气：晴，25～30°C，微风` }],
        lastChunk: true,
      },
    });
    eq.push({
      taskId: ctx.task?.id ?? "pending",
      status: { state: "TASK_STATE_COMPLETED", timestamp: new Date().toISOString() },
    });
    eq.complete();
  }
  async cancel(_ctx: any, _eq: any) {}
}

// ==================== 智能体卡片 ====================
const bookingCard: AgentCard = {
  name: "订票助手",
  description: "多轮对话式行程预订（租户: booking）",
  version: "1.0.0",
  supportedInterfaces: [
    {
      url: `http://${HOST}:${PORT}/a2a`,
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      tenant: "booking",
    },
  ],
  capabilities: { streaming: true, pushNotifications: true, extendedAgentCard: false },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "booking",
      name: "行程预订",
      description: "多轮对话式行程预订",
      tags: ["booking", "multi-turn"],
      examples: ["帮我订票"],
    },
  ],
};

const weatherCard: AgentCard = {
  name: "天气查询",
  description: "查询天气预报（租户: weather）",
  version: "1.0.0",
  supportedInterfaces: [
    {
      url: `http://${HOST}:${PORT}/a2a`,
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
      tenant: "weather",
    },
  ],
  capabilities: { streaming: true, pushNotifications: false, extendedAgentCard: false },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "weather",
      name: "天气查询",
      description: "查询指定城市的天气",
      tags: ["weather"],
      examples: ["北京天气"],
    },
  ],
};

const defaultCard: AgentCard = {
  name: "默认助手",
  description: "默认回退智能体",
  version: "1.0.0",
  supportedInterfaces: [
    {
      url: `http://${HOST}:${PORT}/a2a`,
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
    },
  ],
  capabilities: { streaming: true, pushNotifications: false, extendedAgentCard: false },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "echo",
      name: "Echo",
      description: "返回收到的消息",
      tags: ["echo"],
      examples: ["你好"],
    },
  ],
};

// ==================== 扩展注册中心 ====================
const extRegistry = new ExtensionRegistry();
extRegistry.register(timestampExtension);
extRegistry.register(loggingExtension);

// ==================== 多租户路由器 ====================
const pushService = new PushNotificationService();
const router = new MultiTenantRouter(pushService);

router.register({
  id: "booking",
  agentCard: bookingCard,
  executor: new MultiTurnBookingAgentExecutor(),
});
router.register({ id: "weather", agentCard: weatherCard, executor: new WeatherAgentExecutor() });
router.register({ id: "default", agentCard: defaultCard, executor: new HelloWorldAgentExecutor() });

// ==================== 日志 ====================
function log(method: string, url: string, status: number, detail?: string) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`${ts} [A2A-Server] ${method} ${url} → ${status}${detail ? ` — ${detail}` : ""}`);
}

// ==================== HTTP 服务器 ====================
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const startTime = Date.now();
  const originalEnd = res.end.bind(res);
  res.end = function (this: any, data?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    const a2aMethod = (req as any)._a2aMethod || req.method;
    log(req.method || "?", req.url || "/", res.statusCode, `${a2aMethod} (${duration}ms)`);
    return originalEnd.call(this, data, encoding, cb);
  } as any;
  res.setHeader("A2A-Version", "1.0");

  try {
    // 智能体发现
    if (req.method === "GET" && req.url?.startsWith("/.well-known/agent-card.json")) {
      const tenant = new URL(req.url, `http://${HOST}`).searchParams.get("tenant");
      if (tenant) {
        const { agentCard } = router.route(tenant);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(agentCard, null, 2));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(router.createDiscoveryDocument(), null, 2));
      }
      return;
    }

    // Webhook
    if (req.method === "POST" && req.url === "/webhook") {
      const body = await readBody(req);
      console.log(`  [Webhook] 收到通知: ${body.slice(0, 100)}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "received" }));
      return;
    }

    // JSON-RPC
    if (req.method === "POST" && req.url === "/a2a") {
      const body = await readBody(req);
      const jsonRpc = JSON.parse(body);
      const { method, params, id } = jsonRpc;
      (req as any)._a2aMethod = method;

      const a2aVersion = req.headers["a2a-version"] as string;
      if (a2aVersion && a2aVersion !== "1.0" && a2aVersion !== "0.3") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32009, message: `不支持的协议版本: ${a2aVersion}` },
          }),
        );
        return;
      }

      // 扩展激活
      const extHeader = req.headers["a2a-extensions"] as string | undefined;
      const extCtx = extRegistry.parseExtensions(extHeader);

      // 多租户路由
      const tenant = params?.tenant || params?.message?.tenant;
      const { handler, agentCard } = router.route(tenant);
      console.log(`  [Tenant] 路由到 "${agentCard.name}"${tenant ? ` (tenant=${tenant})` : ""}`);

      // 扩展前处理
      if (extCtx.activatedExtensions.size > 0 && params?.message) {
        params.message = extRegistry.applyBeforeProcessMessage(params.message, extCtx);
      }

      if (method === "SendStreamingMessage") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        const result = await handler.handleMethod(method, params ?? {});
        if (result && typeof result === "object" && "stream" in result) {
          for await (const event of (result as any).stream as AsyncGenerator<unknown>) {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        }
        res.end();
        return;
      }

      const result = await handler.handleMethod(method, params ?? {});
      extRegistry.applyAfterProcessMessage({ task: (result as any)?.task }, extCtx);

      if (result && typeof result === "object" && "task" in (result as any)) {
        const task = (result as any).task;
        const terminalStates = [
          "TASK_STATE_COMPLETED",
          "TASK_STATE_FAILED",
          "TASK_STATE_CANCELED",
          "TASK_STATE_REJECTED",
        ];
        if (terminalStates.includes(task?.status?.state)) {
          await pushService.notify(task.id, { task });
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result,
          ...(extCtx.activatedExtensions.size > 0
            ? { activatedExtensions: Array.from(extCtx.activatedExtensions) }
            : {}),
        }),
      );
      return;
    }
  } catch (error: any) {
    res.writeHead(error.httpStatus ?? 500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: error.code ?? -32603, message: error.message },
      }),
    );
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "未找到" }));
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ 端口 ${PORT} 已被占用，请设置 PORT 环境变量切换到其他端口`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 A2A v1.0 综合演示服务器（P1 多租户 + 扩展）`);
  console.log(`   ${HOST}:${PORT}`);
  console.log(`\n📌 多租户路由（规范 §8.3.2）：`);
  console.log(`   ── 订票:   tenant=booking  → 多轮对话订票`);
  console.log(`   ── 天气:   tenant=weather  → 天气查询`);
  console.log(`   ── 默认:   无 tenant       → HelloWorld echo`);
  console.log(`   ── 发现:   GET /.well-known/agent-card.json?tenant=booking`);
  console.log(`\n📌 扩展激活（规范 §4.6.3）：`);
  console.log(`   ── 头: A2A-Extensions: https://a2a-dev.local/ext/timestamp/v1`);
  console.log(`\n📌 推送通知 Webhook: POST /webhook\n`);
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
