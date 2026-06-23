# 4. 智能体执行器

A2A 智能体如何处理请求和生成响应/事件的核心逻辑由**智能体执行器（Agent Executor）**处理。A2A Python SDK 提供了一个抽象基类 `a2a.server.agent_execution.AgentExecutor`，您可以实现它。

## `AgentExecutor` 接口

`AgentExecutor` 类定义了两个主要方法：

- `async def execute(self, context: RequestContext, event_queue: EventQueue)`：处理期望响应或事件流的传入请求。它处理用户的输入（通过 `context` 可用），并使用 `event_queue` 发送回 `Message`、`Task`、`TaskStatusUpdateEvent` 或 `TaskArtifactUpdateEvent` 对象。
- `async def cancel(self, context: RequestContext, event_queue: EventQueue)`：处理取消正在进行的任务的请求。

`RequestContext` 提供有关传入请求的信息，例如用户的消息和任何现有任务详情。`EventQueue` 由执行器用于将事件发送回客户端。

## Helloworld 智能体执行器

让我们看看 `agent_executor.py`。它定义了 `HelloWorldAgentExecutor`。

1. **智能体（`HelloWorldAgent`）**：
    这是一个简单的辅助类，封装了实际的"业务逻辑"。

    ```python { .no-copy }
    --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/agent_executor.py:HelloWorldAgent"
    ```

    它有一个简单的 `invoke` 方法，返回字符串 "Hello, World!"。

2. **执行器（`HelloWorldAgentExecutor`）**：
    这个类实现了 `AgentExecutor` 接口。

    - **`__init__`**：

        ```python { .no-copy }
        --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/agent_executor.py:HelloWorldAgentExecutor_init"
        ```

        它实例化了 `HelloWorldAgent`。

    - **`execute`**：

        ```python { .no-copy }
        --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/agent_executor.py:HelloWorldAgentExecutor_execute"
        ```

        当 `Send Message` 或 `Send Streaming Message` 请求进入时（在此简化的执行器中两者都由 `execute` 处理），会发生以下步骤：

        **第 1 步。** `A2A 实例`（服务器）从上下文中检索当前任务。如果上下文中没有任务，则创建一个新任务并将其添加到 `EventQueue`。

        **第 2 步。** 它入队一个 `TaskStatusUpdateEvent`，状态为 `TASK_STATE_WORKING`，以指示智能体已开始处理。

        **第 3 步。** 它调用 `self.agent.invoke()` 执行实际的业务逻辑（简单地返回 "Hello, World!"）。

        **第 4 步。** 它入队一个 `TaskArtifactUpdateEvent`，包含来自智能体的结果文本。

        **第 5 步。** 最后，它入队一个 `TaskStatusUpdateEvent`，状态为 `TASK_STATE_COMPLETED`，以结束任务。

`AgentExecutor` 充当 A2A 协议（由请求处理器和服务器应用程序管理）与您智能体的特定逻辑之间的桥梁。它接收有关请求的上下文，并使用事件队列将结果或更新通信回去。
