# 3. 智能体技能与智能体卡片

在 A2A 智能体执行任何操作之前，它需要定义它能做什么（其技能）以及其他智能体或客户端如何了解这些能力（其智能体卡片）。

我们将使用位于 [`a2a-samples/samples/python/agents/helloworld/`](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/helloworld) 的 `helloworld` 示例。

## 智能体技能

**智能体技能（Agent Skill）**描述了智能体可以执行的特定能力或功能。它是一个构建块，告诉客户端智能体适合哪些类型的任务。

`AgentSkill` 的属性（在 `a2a.types` 中定义）：

- `id`：技能的唯一标识符。
- `name`：人类可读的名称。
- `description`：技能作用的更详细解释。
- `tags`：用于分类和发现的关键词。
- `examples`：示例提示或用例。
- `input_modes` / `output_modes`：输入和输出的支持媒体类型（例如，"text/plain"、"application/json"）。
- `security_requirements`：此技能所需的安全方案。

在 `__main__.py` 中，您可以看到如何为 Helloworld 智能体定义技能：

```python { .no-copy }
--8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/__main__.py:AgentSkill"
```

这个技能非常简单：它被命名为"Returns hello world"，主要处理文本。

## 智能体卡片

**智能体卡片（Agent Card）**是一个 JSON 文档，A2A 服务器使其可用，通常位于 `.well-known/agent-card.json` 端点。它就像是智能体的数字名片。

`AgentCard` 的关键属性（在 `a2a.types` 中定义）：

- `name`、`description`、`version`：基本身份信息。
- `supported_interfaces`：A2A 服务可达的端点和协议的有序列表。
- `capabilities`：支持的 A2A 功能，如 `streaming` 或 `extended_agent_card`。
- `default_input_modes` / `default_output_modes`：智能体的默认媒体类型。
- `skills`：智能体提供的 `AgentSkill` 对象列表。

`helloworld` 示例这样定义其智能体卡片：

```python { .no-copy }
--8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/helloworld/__main__.py:AgentCard"
```

这张卡片告诉我们，智能体名为"Hello World Agent"，可以在 `http://127.0.0.1:9999/` 运行，支持文本交互，并具有 `hello_world` 技能。
