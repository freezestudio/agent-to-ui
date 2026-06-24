/**
 * A2UI 演示 A2A HTTP 服务器
 *
 * 基于 Node.js 原生 HTTP 模块，无外部框架依赖。
 * 提供：
 * - GET /.well-known/agent-card.json — 智能体发现
 * - POST /a2a — JSON-RPC 端点
 *
 * @packageDocumentation
 */

import pino from "pino";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { A2ARequestHandler, InMemoryTaskStore } from "@a2a-dev/server";
import { agentCard } from "./agent-card.js";
import { A2UIDemoAgent } from "./a2ui-agent.js";

const logger = pino({ name: "a2ui-server" });

const PORT = 10002;
const HOST = "127.0.0.1";

// ==================== 初始化 ====================

const taskStore = new InMemoryTaskStore();
const executor = new A2UIDemoAgent();
const handler = new A2ARequestHandler(executor, taskStore, agentCard);

// ==================== HTTP 服务器 ====================

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("A2A-Version", "1.0");

  try {
    // ---- 路由: 智能体发现 ----
    if (req.method === "GET" && req.url === "/.well-known/agent-card.json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(agentCard, null, 2));
      logger.info("GET /.well-known/agent-card.json → 200");
      return;
    }

    // ---- 路由: JSON-RPC ----
    if (req.method === "POST" && req.url === "/a2a") {
      const body = await readBody(req);
      const { method, params, id } = JSON.parse(body);

      logger.info({ method, id }, "收到 JSON-RPC 请求");

      // 处理流式消息
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

      // 普通 JSON-RPC
      const result = await handler.handleMethod(method, params);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id, result }));
      logger.info({ method, id }, "JSON-RPC 响应完成");
      return;
    }

    // ---- 404 ----
    res.writeHead(404);
    res.end(JSON.stringify({ error: "未找到" }));
    logger.warn({ method: req.method, url: req.url }, "404 未找到");
  } catch (error: any) {
    const httpStatus = error.httpStatus ?? 500;
    logger.error({ error: error.message, code: error.code }, "请求处理失败");
    res.writeHead(httpStatus, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: error.code ?? -32603, message: error.message },
      }),
    );
  }
});

// ==================== 启动 ====================

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 A2UI 示例服务器已启动`);
  console.log(`   地址: http://${HOST}:${PORT}`);
  console.log(`   智能体卡片: http://${HOST}:${PORT}/.well-known/agent-card.json`);
  console.log(`   JSON-RPC: http://${HOST}:${PORT}/a2a`);
  console.log(`   场景: hello / login / booking / dashboard / media\n`);
  logger.info({ port: PORT, host: HOST }, "服务器启动");
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
