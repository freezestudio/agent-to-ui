# 7. 流式传输与多轮交互（LangGraph 示例）

Hello World 示例演示了 A2A 的基本机制。对于更高级的功能，如健壮的流式传输、任务状态管理和由 LLM 驱动的多轮对话，我们将转向位于 [`a2a-samples/samples/python/agents/langgraph/`](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/langgraph) 的 LangGraph 示例。

此示例展示了一个"货币智能体"，它使用 Gemini 模型通过 LangChain 和 LangGraph 回答货币转换问题。

## 设置 LangGraph 示例

1. 如果您还没有 [Gemini API 密钥](https://ai.google.dev/gemini-api/docs/api-key)，请先创建一个。

2. **环境变量：**

    在 `a2a-samples/samples/python/agents/langgraph/` 目录中创建一个 `.env` 文件：

    ```bash
    echo "GOOGLE_API_KEY=YOUR_API_KEY_HERE" > .env
    ```

    将 `YOUR_API_KEY_HERE` 替换为您的实际 Gemini API 密钥。

3. **安装依赖（如果尚未安装）：**

    `langgraph` 示例有自己的 `pyproject.toml`，其中包括 `langchain-google-genai` 和 `langgraph` 等依赖。当您从 `a2a-samples` 根目录使用 `pip install -e .[dev]` 安装 SDK 时，这应该也已经安装了工作区示例的依赖，包括 `langgraph-example`。如果您遇到导入错误，请确保从根目录成功安装了主 SDK。

## 运行 LangGraph 服务器

在终端中导航到 `a2a-samples/samples/python/agents/langgraph/app` 目录，并确保您的虚拟环境（来自 SDK 根目录）已激活。

启动 LangGraph 智能体服务器：

```bash
python __main__.py
```

这将启动服务器，通常在 `http://localhost:10000`。

## 与 LangGraph 智能体交互

打开一个**新终端窗口**，激活您的虚拟环境，并导航到 `a2a-samples/samples/python/agents/langgraph/app`。

运行其测试客户端：

```bash
python test_client.py
```

现在，您可以通过在运行 `__main__.py` 的终端窗口中按 Ctrl+C 来关闭服务器。

## 演示的关键特性

`langgraph` 示例展示了一些重要的 A2A 概念：

1. **LLM 集成**：

    - `agent.py` 定义了 `CurrencyAgent`。它使用 `ChatGoogleGenerativeAI` 和 LangGraph 的 `create_react_agent` 来处理用户查询。
    - 这演示了真正的 LLM 如何驱动智能体的逻辑。

2. **任务状态管理**：

    - `samples/langgraph/__main__.py` 使用 `InMemoryTaskStore` 初始化 `DefaultRequestHandler`。

        ```python { .no-copy }
        --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/langgraph/app/__main__.py:DefaultRequestHandler"
        ```

    - `CurrencyAgentExecutor`（在 `samples/langgraph/agent_executor.py` 中），当它的 `execute` 方法被 `DefaultRequestHandler` 调用时，与包含当前任务（如果有）的 `RequestContext` 交互。
    - 对于 `Send Message`，`DefaultRequestHandler` 使用 `TaskStore` 在交互之间持久化和检索任务状态。如果智能体的执行流程涉及多个步骤或导致持久化任务，`Send Message` 的响应将是一个完整的 `Task` 对象。
    - `test_client.py` 的 `run_single_turn_test` 演示了获取 `Task` 对象返回，然后使用 `get_task` 查询它。

3. **使用 `TaskStatusUpdateEvent` 和 `TaskArtifactUpdateEvent` 进行流式传输**：

    - `CurrencyAgentExecutor` 中的 `execute` 方法负责处理非流式和流式请求，由 `DefaultRequestHandler` 编排。
    - 当 LangGraph 智能体处理请求时（可能涉及调用像 `get_exchange_rate` 这样的工具），`CurrencyAgentExecutor` 将不同类型的事件入队到 `EventQueue`：
        - `TaskStatusUpdateEvent`：用于中间更新（例如，"正在查找汇率……"、"正在处理汇率……"）。
        - `TaskArtifactUpdateEvent`：当最终答案准备好时，作为制品入队。`lastChunk` 标志为 `True`。
        - 发送最终的 `TaskStatusUpdateEvent`，状态为 `TaskState.completed`，以表示任务结束，关闭流。
    - `test_client.py` 的 `run_streaming_test` 函数将在从服务器接收这些单独的事件块时打印它们。

4. **多轮对话（`TaskState.input_required`）**：

    - `CurrencyAgent` 可以在查询不明确时要求澄清（例如，用户问"100 美元是多少？"）。
    - 发生这种情况时，`CurrencyAgentExecutor` 会入队一个 `TaskStatusUpdateEvent`，其中 `status.state` 为 `TaskState.input_required`，并且 `status.message` 包含智能体的问题（例如，"您想兑换成哪种货币？"）。此事件后流关闭。
    - `test_client.py` 的 `run_multi_turn_test` 函数演示了这一点：
        - 它发送一个初始的模糊查询。
        - 智能体（通过 `DefaultRequestHandler` 处理入队事件）响应一个状态为 `input_required` 的 `Task`。
        - 然后客户端发送第二条消息，包含来自第一轮 `Task` 响应的 `taskId` 和 `contextId`，以提供缺失的信息（"以英镑计"）。这继续了同一个任务。

## 探索代码

花些时间查看这些文件：

- `__main__.py`：使用 `A2AStarletteApplication` 和 `DefaultRequestHandler` 的服务器设置。注意 `AgentCard` 定义包括 `capabilities.streaming=True`。
- `agent.py`：带有 LangGraph、LLM 模型和工具定义的 `CurrencyAgent`。
- `agent_executor.py`：实现 `execute`（和 `cancel`）方法的 `CurrencyAgentExecutor`。它使用 `RequestContext` 来理解正在进行的任务，并使用 `EventQueue` 发送回各种事件（`TaskStatusUpdateEvent`、`TaskArtifactUpdateEvent`、如果没有任务存在，则通过第一个事件隐式创建新 `Task` 对象）。
- `test_client.py`：演示各种交互模式，包括检索任务 ID 并将其用于多轮对话。

此示例提供了 A2A 如何促进智能体之间复杂、有状态和异步交互的更丰富的说明。
