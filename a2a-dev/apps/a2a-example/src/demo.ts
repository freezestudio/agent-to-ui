/**
 * A2A v1.0 综合演示服务器
 *
 * P0 功能演示：
 * 1. 多轮对话（input-required）— 订票智能体
 * 2. 取消任务
 * 3. 推送通知 Webhook
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { AgentCard } from "@a2a-dev/core";
import {
  MultiTurnBookingAgentExecutor,
  A2ARequestHandler,
  InMemoryTaskStore,
  PushNotificationService,
} from "@a2a-dev/server";

const PORT = parseInt(process.env.PORT || "9998", 10);
const HOST = process.env.HOST || "127.0.0.1";

// ==================== 智能体卡片 ====================
const agentCard: AgentCard = {
  name: "订票助手智能体",
  description: "支持多轮对话的订票助手，演示 A2A input-required 状态和推送通知",
  version: "1.0.0",
  supportedInterfaces: [
    {
      url: `http://${HOST}:${PORT}/a2a`,
      protocolBinding: "JSONRPC",
      protocolVersion: "1.0",
    },
  ],
  capabilities: {
    streaming: true,
    pushNotifications: true,
    extendedAgentCard: false,
  },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "booking",
      name: "行程预订",
      description: "多轮对话式行程预订，自动询问目的地和出发时间",
      tags: ["booking", "multi-turn"],
      examples: ["帮我订票", "预订明天去北京的行程"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
  ],
};

// ==================== 初始化 ====================
const taskStore = new InMemoryTaskStore();
const executor = new MultiTurnBookingAgentExecutor();
const pushService = new PushNotificationService();
const handler = new A2ARequestHandler(executor, taskStore, agentCard);

// ==================== 日志 ====================
function log(method: string, url: string, status: number, detail?: string) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`${ts} [A2A-Server] ${method} ${url} → ${status}${detail ? ` — ${detail}` : ""}`);
}

// ==================== HTTP 服务器 ====================
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const startTime = Date.now();

  // 日志拦截
  const originalEnd = res.end.bind(res);
  res.end = function (data?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    const a2aMethod = (req as any)._a2aMethod || req.method;
    log(req.method || "?", req.url || "/", res.statusCode, `${a2aMethod} (${duration}ms)`);
    return originalEnd(data, encoding, cb);
  } as any;

  res.setHeader("A2A-Version", "1.0");

  try {
    // ---- 智能体发现 ----
    if (req.method === "GET" && req.url === "/.well-known/agent-card.json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(agentCard, null, 2));
      return;
    }

    // ---- 简易 Webhook 接收端点（用于演示推送通知）----
    if (req.method === "POST" && req.url === "/webhook") {
      const body = await readBody(req);
      const payload = JSON.parse(body);
      console.log(`  [Webhook] 收到推送通知:`);
      if (payload.statusUpdate) {
        console.log(`    状态更新: ${payload.statusUpdate.status?.state}`);
      }
      if (payload.artifactUpdate) {
        console.log(`    制品更新: ${payload.artifactUpdate.artifact?.name}`);
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "received" }));
      return;
    }

    // ---- JSON-RPC 端点 ----
    if (req.method === "POST" && req.url === "/a2a") {
      const body = await readBody(req);
      const jsonRpcRequest = JSON.parse(body);
      const { method, params, id } = jsonRpcRequest;
      (req as any)._a2aMethod = method;

      // 版本协商
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

      // ---- 流式消息 ----
      if (method === "SendStreamingMessage") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        const result = await handler.handleMethod(method, params);
        if (result && typeof result === "object" && "stream" in result) {
          for await (const event of (result as any).stream as AsyncGenerator<unknown>) {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        }
        res.end();
        return;
      }

      // ---- 普通 JSON-RPC 请求 ----
      const result = await handler.handleMethod(method, params);

      // 如果任务达到终端状态，触发推送通知
      if (result && typeof result === "object" && "task" in result) {
        const task = (result as any).task;
        const terminalStates = [
          "TASK_STATE_COMPLETED",
          "TASK_STATE_FAILED",
          "TASK_STATE_CANCELED",
          "TASK_STATE_REJECTED",
        ];
        if (terminalStates.includes(task.status?.state)) {
          await pushService.notify(task.id, { task });
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id, result }));
      return;
    }
  } catch (error: any) {
    const httpStatus = error.httpStatus ?? 500;
    res.writeHead(httpStatus, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: error.code ?? -32603,
          message: error.message ?? "内部错误",
          details: error.details,
        },
      }),
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "未找到" }));
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ 端口 ${PORT} 已被占用，请先关闭占用进程或设置 PORT 环境变量切换到其他端口`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 A2A v1.0 综合演示服务器`);
  console.log(`   ${HOST}:${PORT}`);
  console.log(`   ┌─ /.well-known/agent-card.json  (智能体发现)`);
  console.log(`   ├─ /a2a                           (JSON-RPC 端点)`);
  console.log(`   └─ /webhook                       (推送通知接收端)`);
  console.log(`\n📌 多轮对话演示：curl -X POST ... -d '{"method":"SendMessage",...}'`);
  console.log(`   → 第1轮: "帮我订票"`);
  console.log(`   → 第2轮: "北京"`);
  console.log(`   → 第3轮: "明天"\n`);
  console.log(`📌 推送通知演示：带上 pushNotificationConfig 发送消息`);
  console.log(`   → 服务器自动 POST 到 /webhook\n`);
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
