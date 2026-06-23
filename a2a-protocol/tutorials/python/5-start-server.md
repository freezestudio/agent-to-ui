# 5. 启动服务器

现在我们有了智能体卡片和智能体执行器，可以设置并启动 A2A 服务器了。

要设置 A2A 服务器，Python SDK 提供了路由工厂和辅助函数（`create_agent_card_routes`、`create_jsonrpc_routes`、`create_rest_routes`）。使用路由工厂为 A2A 服务器的服务创建路由。这些路由可以原生附加到流行的框架，如 [Starlette](https://www.starlette.io/) 和 [FastAPI](https://fastapi.tiangolo.com/)，它们为您提供对身份验证、日志记录和其他功能的更好控制。

在本教程中，我们将使用 Starlette 配合 [Uvicorn](https://www.uvicorn.org/)。

## Helloworld 中的服务器设置

让我们再看看 `__main__.py`，了解服务器如何初始化并启动。

```python { .no-copy }
--8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/__main__.py"
```

让我们分解一下：

1. **`DefaultRequestHandler`**：

    - SDK 提供了 `DefaultRequestHandler`。此处理器接收您的 `AgentExecutor` 实现（`HelloWorldAgentExecutor`）、一个 `TaskStore`（`InMemoryTaskStore`）以及公共和扩展的 `AgentCard` 对象。
    - 它将传入的 A2A RPC 调用路由到执行器上的适当方法（如 `execute` 或 `cancel`）。
    - `TaskStore` 由 `DefaultRequestHandler` 用于管理任务的生命周期，特别是对于有状态交互、流式传输和重新订阅。即使您的智能体执行器很简单，处理器也需要任务存储。
    - `agent_card` 被传递给处理器，以便在处理传入请求时验证智能体声明的能力。例如，它在处理这些请求类型之前检查是否支持流式传输或推送通知。
    - `extended_agent_card` 被传递，以便处理器可以通过 `GetExtendedAgentCard` RPC 方法向经过身份验证的客户端提供它。

2. **`create_agent_card_routes` 和 `create_jsonrpc_routes`**：

    - `create_agent_card_routes(public_agent_card)` 返回 Starlette 路由，在 `/.well-known/agent-card.json` 端点暴露智能体卡片以进行公共发现。
    - `create_jsonrpc_routes(request_handler, '/')` 返回 Starlette 路由，通过委托给 `request_handler` 来处理所有传入的 A2A JSON-RPC 方法调用。
    - 这些路由列表被合并并传递给标准的 `Starlette` 应用。

3. **`uvicorn.run(app, ...)`**：
    - 构建的 `Starlette` 应用使用 `uvicorn.run()` 运行，使您的智能体可以通过 HTTP 访问。
    - `host='127.0.0.1'` 使服务器只能从您的本地机器访问。
    - `port=9999` 指定要监听的端口。这与 `AgentCard` 的 `supported_interfaces` 中定义的端点相匹配。

## 运行 Helloworld 服务器

在终端中导航到 `a2a-samples` 目录（如果您还没有在那里），并确保您的虚拟环境已激活。

要运行 Helloworld 服务器：

```bash
# 从 a2a-samples 目录
python samples/python/agents/helloworld/__main__.py
```

您应该看到类似以下的输出，表示服务器正在运行：

```console { .no-copy }
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:9999 (Press CTRL+C to quit)
```

您的 A2A Helloworld 智能体现已启动并正在监听请求！在下一步中，我们将与其交互。
