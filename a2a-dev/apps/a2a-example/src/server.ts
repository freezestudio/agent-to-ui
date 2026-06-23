/**
 * A2A v1.0 示例服务器
 *
 * 演示：
 * - 智能体卡片发布 (Agent Card)
 * - JSON-RPC 端点
 * - 任务管理
 * - 流式传输
 *
 * 使用 Node.js 原生 HTTP 服务器，无外部框架依赖
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { AgentCard } from "@a2a-dev/core";
import { HelloWorldAgentExecutor, A2ARequestHandler, InMemoryTaskStore } from "@a2a-dev/server";

// ==================== 配置 ====================
const PORT = 9999;
const HOST = "127.0.0.1";

// ==================== 智能体卡片 ====================
// A2A v1.0 规范 4.4.1
const agentCard: AgentCard = {
  name: "示例 Echo 智能体",
  description: "一个简单的 A2A 示例智能体，返回 echo 响应",
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
    pushNotifications: false,
    extendedAgentCard: true,
  },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],
  skills: [
    {
      id: "echo",
      name: "Echo 技能",
      description: "返回用户消息的 echo 响应",
      tags: ["echo", "example"],
      examples: ["你好", "今天天气怎么样"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
    },
  ],
};

// 扩展智能体卡片（仅对已验证用户提供）
const extendedAgentCard: AgentCard = {
  ...agentCard,
  name: "示例 Echo 智能体 - 扩展版",
  version: "1.0.1",
  skills: [
    ...(agentCard.skills ?? []),
    {
      id: "super-echo",
      name: "超级 Echo",
      description: "一个更高级的 echo 实现，仅限已验证用户",
      tags: ["echo", "super", "extended"],
      examples: ["你好！", "世界！"],
    },
  ],
};

// ==================== 初始化组件 ====================
const taskStore = new InMemoryTaskStore();
const executor = new HelloWorldAgentExecutor();
const handler = new A2ARequestHandler(executor, taskStore, agentCard, extendedAgentCard);

// ==================== 日志工具 ====================
const LOG_PREFIX = "[A2A-Server]";
function log(method: string, url: string, status: number, detail?: string) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  const msg = detail ? ` — ${detail}` : "";
  console.log(`${ts} ${LOG_PREFIX} ${method} ${url} → ${status}${msg}`);
}

// ==================== HTTP 服务器 ====================
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const startTime = Date.now();

  // 捕获响应结束以记录日志
  const originalEnd = res.end.bind(res);
  res.end = function (data?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    const a2aMethod = (req as any)._a2aMethod || req.method;
    log(req.method || "?", req.url || "/", res.statusCode, `${a2aMethod} (${duration}ms)`);
    return originalEnd(data, encoding, cb);
  } as any;

  // 添加 A2A 版本头
  res.setHeader("A2A-Version", "1.0");

  try {
    // ---- 路由 ----

    // GET /.well-known/agent-card.json - 智能体发现
    if (req.method === "GET" && req.url === "/.well-known/agent-card.json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(agentCard, null, 2));
      return;
    }

    // POST /a2a - JSON-RPC 端点
    if (req.method === "POST" && req.url === "/a2a") {
      const body = await readBody(req);
      const jsonRpcRequest = JSON.parse(body);

      const { method, params, id } = jsonRpcRequest;

      // 记录 A2A 方法名用于日志
      (req as any)._a2aMethod = method;

      // 验证 A2A 版本
      const a2aVersion = req.headers["a2a-version"] as string;
      if (a2aVersion && a2aVersion !== "1.0" && a2aVersion !== "0.3") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32009,
              message: `不支持的协议版本: ${a2aVersion}`,
            },
          }),
        );
        return;
      }

      // 处理流式消息 - SSE
      if (method === "SendStreamingMessage") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });

        const result = await handler.handleMethod(method, params);

        if (result && typeof result === "object" && "stream" in result) {
          const stream = (result as any).stream as AsyncGenerator<unknown>;

          for await (const event of stream) {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }
        }

        res.end();
        return;
      }

      // 处理普通 JSON-RPC 请求
      const result = await handler.handleMethod(method, params);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result,
        }),
      );
      return;
    }
  } catch (error: any) {
    // 根据 A2A 错误类型返回相应的 HTTP 状态码（规范 §5.4）
    const httpStatus = error.httpStatus ?? 500;
    const jsonRpcCode = error.code ?? -32603;

    res.writeHead(httpStatus, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: jsonRpcCode,
          message: error.message ?? "内部错误",
          details:
            error.details ??
            (error.a2aErrorType
              ? [
                  {
                    "@type": "type.googleapis.com/google.rpc.ErrorInfo",
                    reason: error.a2aErrorType,
                    domain: "a2a-protocol.org",
                  },
                ]
              : undefined),
        },
      }),
    );
    return;
  }

  // 未找到路由
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "未找到" }));
});

// ==================== 启动 ====================
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 A2A 示例服务器已启动`);
  console.log(`   地址: http://${HOST}:${PORT}`);
  console.log(`   智能体卡片: http://${HOST}:${PORT}/.well-known/agent-card.json`);
  console.log(`   JSON-RPC: http://${HOST}:${PORT}/a2a`);
  console.log(`   A2A 协议版本: 1.0\n`);
  console.log(`按 Ctrl+C 停止服务器\n`);
});

// ==================== 工具函数 ====================
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
