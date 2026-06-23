# 6. 与服务器交互

Helloworld A2A 服务器正在运行，让我们向其发送一些请求。

## Helloworld 测试客户端

`test_client.py` 脚本演示如何：

1. 从服务器获取智能体卡片。
2. 使用 `create_client` 创建客户端。
3. 发送 `Send Message` 和 `Send Streaming Message` 请求。

打开一个**新终端窗口**，激活您的虚拟环境，并导航到 `a2a-samples` 目录。

激活虚拟环境（确保在创建它的相同目录中执行）：

=== "Mac/Linux"

    ```sh
    source .venv/bin/activate
    ```

=== "Windows"

    ```powershell
    .venv\Scripts\activate
    ```

运行测试客户端：

```bash
# 从 a2a-samples 目录
python samples/python/agents/helloworld/test_client.py
```

## 理解客户端代码

让我们看看 `test_client.py` 的关键部分：

1. **获取智能体卡片**：

    ```python { .no-copy }
    --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/test_client.py:A2ACardResolver"
    ```

    `A2ACardResolver` 类是一个便利类。当调用 `get_agent_card()` 时，它会从服务器的 `/.well-known/agent-card.json` 端点（基于提供的基础 URL）获取 `AgentCard`，然后用于初始化客户端。

2. **初始化客户端并发送非流式消息**：

    ```python { .no-copy }
    --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/test_client.py:message_send"
    ```

    - `create_client` 函数基于 `AgentCard` 和 `ClientConfig` 提供的信息创建 `Client`。
    - 我们使用 `new_text_message` 辅助函数构建一个 `Message`（传递 `role=Role.ROLE_USER`），然后将其包装在 `SendMessageRequest` 中。
    - 客户端的 `send_message` 方法返回一个异步迭代器，产生来自智能体的单个最终 `Task` 或 `Message` 响应。在此示例中，它是一个 `Task`。

3. **初始化客户端并发送流式消息**：

    ```python { .no-copy }
    --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/test_client.py:message_stream"
    ```

    - 通过 `create_client` 创建了一个单独的流式客户端，在其 `ClientConfig` 中设置了 `streaming=True`。
    - 我们再次调用 `send_message`，现在它会流式传输事件：循环的每次迭代打印一个离散的数据块，随着它在网络上到达。
    - 循环后调用 `await streaming_client.close()` 以释放底层 HTTP 连接。

## 预期输出

当您运行 `test_client.py` 时，您将看到以下输出：

- 公共智能体卡片，以格式化摘要显示。
- 非流式响应：protobuf 文本格式的单个 `task`，包含已完成的状态、生成的包含"Hello, World!"的制品以及历史记录中智能体的中间状态消息。
- 流式响应：四个数据块——初始 `task`、WORKING 的 `status_update`、包含结果的 `artifact_update` 和 COMPLETED 的最终 `status_update`。
- 扩展智能体卡片，以格式化摘要显示（包含额外的 `super_hello_world` 技能）。

输出中的 `id` 字段每次运行时都会变化。

```console { .no-copy }
                     AgentCard（智能体卡片）
--- 通用信息 ---
名称        : Hello World Agent
描述        : 只是一个 hello world 智能体
版本        : 0.0.1

--- 接口 ---
  [0] http://127.0.0.1:9999  (JSONRPC)

--- 能力 ---
流式传输           : True
推送通知  : False
扩展智能体卡片 : True

--- I/O 模式 ---
输入  : text/plain
输出 : text/plain

--- 技能 ---
----------------------------------------------------
  ID          : hello_world
  名称        : Returns hello world
  描述        : just returns hello world
  标签        : hello world
  示例     : hi
  示例     : hello world

--- 非流式调用 ---

非流式客户端已初始化。
响应：
// 非流式响应
task {
  id: "xxxxxxxx"
  context_id: "yyyyyyyy"
  status {
    state: TASK_STATE_COMPLETED
  }
  artifacts {
    artifact_id: "zzzzzzzz"
    name: "result"
    parts {
      text: "Hello, World!"
    }
  }
  history {
    message_id: "vvvvvvvv"
    context_id: "yyyyyyyy"
    task_id: "xxxxxxxx"
    role: ROLE_USER
    parts {
      text: "Say hello."
    }
  }
  history {
    message_id: "wwwwwwww"
    role: ROLE_AGENT
    parts {
      text: "Processing request..."
    }
  }
}

// 流式响应
task {
  id: "xxxxxxxx-s"
  context_id: "yyyyyyyy-s"
  status {
    state: TASK_STATE_SUBMITTED
  }
  history {
    message_id: "vvvvvvvv"
    context_id: "yyyyyyyy-s"
    task_id: "xxxxxxxx-s"
    role: ROLE_USER
    parts {
      text: "Say hello."
    }
  }
}

响应块：
status_update {
  task_id: "xxxxxxxx-s"
  context_id: "yyyyyyyy-s"
  status {
    state: TASK_STATE_WORKING
    message {
      message_id: "zzzzzzzz-s"
      role: ROLE_AGENT
      parts {
        text: "Processing request..."
      }
    }
  }
}

响应块：
artifact_update {
  task_id: "xxxxxxxx-s"
  context_id: "yyyyyyyy-s"
  artifact {
    artifact_id: "wwwwwwww-s"
    name: "result"
    parts {
      text: "Hello, World!"
    }
  }
}

响应块：
status_update {
  task_id: "xxxxxxxx-s"
  context_id: "yyyyyyyy-s"
  status {
    state: TASK_STATE_COMPLETED
  }
}
                     AgentCard（智能体卡片）
--- 通用信息 ---
名称        : Hello World Agent - Extended Edition
描述        : 面向经过身份验证的用户的全功能 hello world 智能体。
版本        : 0.0.2

--- 接口 ---
  [0] http://127.0.0.1:9999  (JSONRPC)

--- 能力 ---
流式传输           : True
推送通知  : False
扩展智能体卡片 : True

--- I/O 模式 ---
输入  : text/plain
输出 : text/plain

--- 技能 ---
----------------------------------------------------
  ID          : hello_world
  名称        : Returns hello world
  描述        : just returns hello world
  标签        : hello world
  示例     : hi
  示例     : hello world
----------------------------------------------------
  ID          : super_hello_world
  名称        : Returns a SUPER Hello World
  描述        : 一个更热情的问候，仅限经过身份验证的用户。
  标签        : hello world, super, extended
  示例     : super hi
  示例     : give me a super hello
```

（实际的 ID 如 `xxxxxxxx`、`yyyyyyyy`、`zzzzzzzz`、`wwwwwwww` 和 `vvvvvvvv` 每次运行都会是不同的 UUID。）

这确认了您的服务器正在使用更新的 SDK 结构正确处理基本的 A2A 交互。

您现在可以通过在运行 `__main__.py` 的终端窗口中按 Ctrl+C 来关闭服务器。
