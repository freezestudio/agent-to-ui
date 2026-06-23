# A2A 中的扩展

Agent2Agent（A2A）协议为智能体间通信提供了坚实的基础。然而，特定领域或高级用例通常需要超出通用方法的额外结构、自定义数据或新的交互模式。扩展是 A2A 向基础协议分层添加新功能的有力机制。

扩展允许使用新数据、需求、RPC 方法和状态机扩展 A2A 协议。智能体在其智能体卡片中声明对特定扩展的支持，客户端可以在向智能体发出的请求中选择加入扩展提供的行为。扩展通过 URI 标识，并由其自己的规范定义。任何人都可以定义、发布和实现扩展。

扩展的灵活性允许在不碎片化核心标准的情况下定制 A2A，促进创新和特定领域的优化。

## 扩展的范围

可能使用扩展的方式故意保持广泛，以便能够将 A2A 扩展到已知用例之外。
然而，一些可预见的应用包括：

- **纯数据扩展**：在智能体卡片中暴露不会影响请求-响应流程的新结构化信息。例如，扩展可以添加关于智能体 GDPR 合规性的结构化数据。
- ** Profile 扩展**：在核心请求-响应消息上叠加额外的结构和状态更改要求。这种类型有效地充当核心 A2A 协议的 profile，缩小允许值的空间（例如，要求所有消息使用遵循特定模式的 `DataParts`）。这还可以包括通过使用元数据来增强任务状态机中的现有状态。例如，扩展可以定义当 `TaskStatus.state` 为 'working' 且 `TaskStatus.message.metadata["generating-image"]` 为 true 时的 'generating-image' 子状态。
- **方法扩展（扩展技能）**：添加超出协议定义的核心集合的全新 RPC 方法。扩展技能指的是智能体通过实现定义新 RPC 方法的扩展而获得或暴露的能力或功能。例如，一个 `task-history` 扩展可能添加一个 `tasks/search` RPC 方法来检索先前任务的列表，有效地为智能体提供一个新的扩展技能。
- **状态机扩展**：向任务状态机添加新状态或转换。

## 示例扩展列表

| 扩展 | 描述 |
| :-------- | :------------ |
| [安全通行证扩展](https://github.com/a2aproject/a2a-samples/tree/main/extensions/secure-passport) | 添加可信的、上下文相关的层，用于即时个性化和减少开销（v1）。 |
| [Hello World 或时间戳扩展](https://github.com/a2aproject/a2a-samples/tree/main/extensions/timestamp) | 一个简单的扩展，演示如何通过向 `Message` 和 `Artifact` 对象的 `metadata` 字段添加时间戳来增强基础 A2A 类型（v1）。 |
| [可追溯性扩展](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/extensions/traceability) | 探索可追溯性扩展的 Python 实现和基本用法（v1）。 |
| [智能体网关协议（AGP）扩展](https://github.com/a2aproject/a2a-samples/tree/main/extensions/agp) | 一个核心协议层或路由扩展，引入自主小队（ASq）并根据声明的能力路由意图负载，增强可扩展性（v1）。 |

## 扩展治理

A2A 组织使用正式的治理框架来规定扩展的提议、开发、推进和维护方式。官方扩展使用 `https://a2a-protocol.org/extensions/` URI 前缀，并托管在 `a2aproject` 组织下，使用 `ext-` 仓库前缀（实验性扩展使用 `experimental-ext-`）。

有关完整的治理流程——包括层级、生命周期、SDK 支持和法律要求——请参见[扩展和协议绑定治理](extension-and-binding-governance.md)页面。

## 限制

扩展不允许对协议进行某些更改，主要是为了防止破坏核心类型验证：

- **更改核心数据结构的定义**：例如，向协议定义的数据结构添加新字段或移除必填字段。扩展应将自定义属性放在核心数据结构上的 `metadata` 映射中。
- **向枚举类型添加新值**：扩展应使用现有的枚举值，并在 `metadata` 字段中注释额外的语义含义。

## 扩展声明

智能体在其智能体卡片中通过在其 `AgentCapabilities` 对象中包含 `AgentExtension` 对象来声明对扩展的支持。

{{ proto_to_table("AgentExtension") }}

以下是带有扩展的智能体卡片示例：

```json
{
  "name": "魔法 8 球",
  "description": "一个可以预测你未来的智能体……也许吧。",
  "version": "0.1.0",
  "url": "https://example.com/agents/eightball",
  "capabilities": {
    "streaming": true,
    "extensions": [
      {
        "uri": "https://example.com/ext/konami-code/v1",
        "description": "提供解锁新命运的秘籍",
        "required": false,
        "params": {
          "hints": [
            "当你的模拟市民急需额外现金时",
            "你可能否认，但我们见过那些奶牛的证据。"
          ]
        }
      }
    ]
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "fortune",
      "name": "算命师",
      "description": "从神秘的魔法 8 球寻求建议",
      "tags": ["神秘", "不可信"],
      "examples": ["查找关于气候变化的同行评审文章"]
    }
  ]
}
```

## 必需的扩展

虽然扩展通常提供可选功能，但某些智能体可能有更严格的要求。当智能体卡片将扩展声明为 `required: true` 时，它向客户端表示扩展的某些方面会影响请求的构建或处理方式，并且客户端必须遵守。智能体不应将纯数据扩展标记为必需。如果客户端没有请求激活必需的扩展，或未能遵循其协议，智能体应以适当的错误拒绝传入请求。

## 扩展规范

扩展的详细行为和结构由其**规范**定义。虽然未强制要求确切的格式，但它应至少包含：

- 标识扩展的特定 URI。
- `AgentExtension` 对象的 `params` 字段中指定的对象的模式和含义。
- 客户端和智能体之间通信的任何额外数据结构的模式。
- 实现扩展所需的新请求-响应流程、额外端点或任何其他逻辑的详细信息。

## 扩展依赖

扩展可能依赖于其他扩展。这可以是必需的依赖（扩展无法在没有被依赖项的情况下运行）或可选的依赖（如果存在另一个扩展则启用额外功能）。扩展规范应记录这些依赖。客户端有责任激活扩展及其所有列出在扩展规范中的必需依赖。

## 扩展激活

扩展默认处于非活动状态，为不了解扩展的客户端提供基线体验。客户端和智能体进行协商以确定哪些扩展对特定请求处于活动状态。

1. **客户端请求**：客户端通过在发送给智能体的 HTTP 请求中包含 `A2A-Extensions` 头来请求扩展激活。值是一个逗号分隔的扩展 URI 列表，表示客户端打算激活的扩展。
2. **智能体处理**：智能体负责识别请求中支持的扩展并执行激活。智能体不支持的任何请求的扩展可以被忽略。
3. **响应**：一旦智能体识别了所有已激活的扩展，响应**应该**包含 `A2A-Extensions` 头，列出为该请求成功激活的所有扩展。

![A2A 扩展流程示意图](https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Screenshot_2025-09-04_at_13.03.31.original.png){ width="70%" style="margin:20px auto;display:block;" }

**显示扩展激活的示例请求：**

```http
POST /agents/eightball HTTP/1.1
Host: example.com
Content-Type: application/json
A2A-Extensions: https://example.com/ext/konami-code/v1
Content-Length: 519
{
  "jsonrpc": "2.0",
  "method": "SendMessage",
  "id": "1",
  "params": {
    "message": {
      "messageId": "1",
      "role": "ROLE_USER",
      "parts": [{"text": "哦魔法 8 球，今天会下雨吗？"}]
    },
    "metadata": {
      "https://example.com/ext/konami-code/v1/code": "motherlode"
    }
  }
}
```

**对应的响应，回显已激活的扩展：**

```http
HTTP/1.1 200 OK
Content-Type: application/json
A2A-Extensions: https://example.com/ext/konami-code/v1
Content-Length: 338
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "message": {
      "messageId": "2",
      "role": "ROLE_AGENT",
      "parts": [{"text": "答对了！"}]
    }
  }
}
```

## 实现考虑

虽然 A2A 协议定义了扩展的功能，但本节提供了关于其实施的指导——编写、版本化和分发扩展实现的最佳实践。

- **版本化**：扩展规范会演变。拥有清晰的版本化策略至关重要，以确保客户端和智能体可以协商兼容的实现。
    - **建议**：使用扩展的 URI 作为主要版本标识符，最好包含版本号（例如，`https://example.com/ext/my-extension/v1`）。
    - **重大变更**：当对扩展的逻辑、数据结构或必需参数引入重大变更时，**必须**使用新的 URI。
    - **处理不匹配**：如果客户端请求的版本不受智能体支持，智能体**应该**忽略该扩展的激活请求；它**不得**回退到不同的版本。
- **可发现性和发布**：
    - **规范托管**：扩展规范文档**应该**托管在扩展的 URI。
    - **永久标识符**：鼓励作者使用永久标识符服务（如 `w3id.org`）作为其扩展 URI，以防止链接失效。
    - **社区注册中心**：A2A [扩展治理](#extension-governance) 框架定义了在 `a2aproject` 组织下托管的官方和实验性扩展的分层系统，包括提议和推进扩展的生命周期。
- **打包和可重用性（A2A SDK 和库）**：
    为促进采用，扩展逻辑应打包到可重用的库中，可以集成到现有的 A2A 客户端和服务器应用程序中。
    - 扩展实现应作为其语言生态系统的标准包分发（例如，Python 的 PyPI 包、TypeScript/JavaScript 的 npm 包）。
    - 目标是提供简化的集成体验。设计良好的扩展包应允许开发者以最少的代码将其添加到服务器，例如：

        ```python
        --8<-- "https://raw.githubusercontent.com/a2aproject/a2a-samples/refs/heads/main/samples/python/agents/adk_expense_reimbursement/__main__.py"
        ```

        此示例展示了 A2A SDK 或库（如 Python 中的 `a2a.server`）如何促进 A2A 智能体和扩展的实现。

- **安全**：扩展修改了 A2A 协议的核心行为，因此引入了新的安全考虑：

    - **输入验证**：扩展引入的任何新数据字段、参数或方法**必须**进行严格验证。将来自外部方的所有扩展相关数据视为不受信任的输入。
    - **必需扩展的范围**：在智能体卡片中将扩展标记为 `required: true` 时要谨慎。这会为所有客户端创建一个硬依赖，应仅用于对智能体核心功能和安全至关重要的扩展（例如，消息签名扩展）。
    - **身份验证和授权**：如果扩展添加了新方法，实现**必须**确保这些方法受到与核心 A2A 方法相同的身份验证和授权检查。扩展**不得**提供绕过智能体主要安全控制的方式。

有关更多信息，请参见 [A2A 扩展：赋能自定义智能体功能](https://developers.googleblog.com/en/a2a-extensions-empowering-custom-agent-functionality/) 博客文章。
