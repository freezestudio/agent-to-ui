# 代理开发指南

构建生成 A2UI 界面的 AI 代理。本指南涵盖从 LLM 生成和流式传输 UI 消息。

## 快速概述

构建 A2UI 代理：

1. **理解用户意图** → 决定显示什么 UI
2. **生成 A2UI JSON** → 使用 LLM 结构化输出或提示
3. **验证和流式传输** → 检查模式，发送到客户端
4. **处理操作** → 响应用户交互

## 从一个简单的代理开始

本指南使用 ADK 构建一个简单的代理，从文本开始，然后升级到 A2UI。

参见 [ADK 快速入门](https://google.github.io/adk-docs/get-started/python/) 中的逐步说明。

```bash
pip install google-adk
adk create my_agent
```

> **提示**：如果你使用 `uv` 并在示例目录（或已依赖 `google-adk` 的项目）中工作，你可以使用 `uv run adk` 而不是全局安装：
>
> ```bash
> uv run adk create my_agent
> ```

然后编辑 `my_agent/agent.py` 文件，创建一个非常简单的餐厅推荐代理。

```python
import json
from google.adk.agents.llm_agent import Agent
from google.adk.tools.tool_context import ToolContext

def get_restaurants(tool_context: ToolContext) -> str:
    """调用此工具获取餐厅列表。"""
    return json.dumps([
        {
            "name": "西安名吃",
            "detail": "辣味浓郁的拉面。",
            "imageUrl": "http://localhost:10002/static/shrimpchowmein.jpeg",
            "rating": "★★★★☆",
            "infoLink": "[更多信息](https://www.xianfoods.com/)",
            "address": "81 St Marks Pl, New York, NY 10003"
        },
        {
            "name": "汉唐",
            "detail": "正宗川菜。",
            "imageUrl": "http://localhost:10002/static/mapotofu.jpeg",
            "rating": "★★★★☆",
            "infoLink": "[更多信息](https://www.handynasty.net/)",
            "address": "90 3rd Ave, New York, NY 10003"
        },
        {
            "name": "RedFarm",
            "detail": "现代中餐，从农场到餐桌。",
            "imageUrl": "http://localhost:10002/static/beefbroccoli.jpeg",
            "rating": "★★★★☆",
            "infoLink": "[更多信息](https://www.redfarmnyc.com/)",
            "address": "529 Hudson St, New York, NY 10014"
        },
    ])

AGENT_INSTRUCTION="""
你是一个有用的餐厅查找助手。你的目标是使用丰富的 UI 帮助用户查找和预订餐厅。

为此，你必须遵循以下逻辑：

1.  **查找餐厅时：**
    a. 你必须调用 `get_restaurants` 工具。从用户的查询中提取菜系、位置和特定数量（`count`）的餐厅（例如，对于"前 5 家中餐馆"，count 为 5）。
    b. 收到数据后，你必须精确地按照指示生成最终的 a2ui UI JSON，根据餐厅数量使用 `prompt_builder.py` 中适当的 UI 示例。"""

root_agent = Agent(
    model='gemini-2.5-flash',
    name="restaurant_agent",
    description="查找餐厅并帮助预订桌位的代理。",
    instruction=AGENT_INSTRUCTION,
    tools=[get_restaurants],
)
```

不要忘记设置 `GOOGLE_API_KEY` 环境变量来运行此示例。

```bash
echo 'GOOGLE_API_KEY="你的_API_密钥"' > .env
```

你可以使用 ADK Web 界面测试此代理：

```bash
adk web
```

从列表中选择 `my_agent`，询问关于纽约餐厅的问题。你应该在 UI 中看到餐厅列表显示为纯文本。

## 生成 A2UI 消息

让 LLM 生成 A2UI 消息需要一些提示工程。SDK 提供了 `A2uiSchemaManager` 来帮助你生成系统提示，其中包括 A2UI 模式和组件目录中的示例。

首先，确保已安装 `a2ui-agent-sdk`（包含在示例中）。

在你的代理文件（例如 `agent.py`）中，导入必要的类：

```python
from a2ui.schema.constants import VERSION_0_8, VERSION_0_9
from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog.provider import BasicCatalog
```

然后，你可以使用 `A2uiSchemaManager` 生成系统提示。这确保模式和示例被正确格式化且是最新的。

```python
# 定义代理的角色
ROLE_DESCRIPTION = (
    "你是一个有用的餐厅查找助手。你的最终输出必须是 a2ui UI JSON 响应。"
)

# 定义何时使用何种 UI 模板的规则
UI_DESCRIPTION = """
-   如果查询是获取餐厅列表，请使用已从 `get_restaurants` 工具接收到的餐厅数据来填充 `dataModelUpdate.contents`（v0.8）或 `updateDataModel.value`（v0.9+）对象（例如，用于 "items" 键）。
-   如果餐厅数量为 5 个或更少，你必须使用 `SINGLE_COLUMN_LIST_EXAMPLE` 模板。
-   如果餐厅数量超过 5 个，你必须使用 `TWO_COLUMN_LIST_EXAMPLE` 模板。
-   如果查询是预订餐厅（例如，"USER_WANTS_TO_BOOK..."），你必须使用 `BOOKING_FORM_EXAMPLE` 模板。
-   如果查询是预订提交（例如，"User submitted a booking..."），你必须使用 `CONFIRMATION_EXAMPLE` 模板。
"""

# 使用基本目录初始化模式管理器
schema_manager = A2uiSchemaManager(
    version=VERSION_0_8, # 对新协议使用 VERSION_0_9
    catalogs=[
        BasicCatalog.get_config(
            version=VERSION_0_8, examples_path="examples/0.8"
        )
    ],
)

# 生成完整的系统提示
A2UI_AND_AGENT_INSTRUCTION = schema_manager.generate_system_prompt(
    role_description=ROLE_DESCRIPTION,
    ui_description=UI_DESCRIPTION,
    include_schema=True,
    include_examples=True,
    validate_examples=True,
)

root_agent = Agent(
    model='gemini-2.5-flash',
    name="restaurant_agent",
    description="查找餐厅并帮助预订桌位的代理。",
    instruction=A2UI_AND_AGENT_INSTRUCTION,
    tools=[get_restaurants],
)
```

## 理解输出

你的代理将不再严格输出文本。相反，它将输出文本和一个 A2UI 消息的 **JSON 列表**。

我们导入的 `A2UI_SCHEMA` 是一个标准的 JSON 模式，定义了有效的操作，如：

- `render`（显示 UI）
- `update`（更改现有 UI 中的数据）

由于输出是结构化的 JSON，你可以在将其发送到客户端之前进行解析和验证。

```python
# 1. 解析 JSON
# 警告：将输出解析为 JSON 是一个脆弱的实现，仅用于文档目的。
# LLM 经常在 JSON 输出周围放置 Markdown 围栏，并可能犯其他错误。
# 依赖框架为你解析 JSON。
parsed_json_data = json.loads(json_string_cleaned)

# 2. 根据 A2UI_SCHEMA 验证
# 这确保 LLM 生成了有效的 A2UI 命令
jsonschema.validate(
    instance=parsed_json_data, schema=self.a2ui_schema_object
)
```

通过根据 `A2UI_SCHEMA` 验证输出，你确保客户端永远不会收到格式错误的 UI 指令。

TODO：继续本指南，提供如何在没有 A2A 扩展的情况下解析、验证和将输出发送到客户端渲染器的示例。
