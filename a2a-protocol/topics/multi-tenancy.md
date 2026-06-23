# 多租户和多智能体路由

单个 A2A 端点可以服务多个智能体或租户。A2A 协议不规定特定的路由实现——运营者可以自由选择最适合其基础设施的方法。本文档描述了协议支持的路由机制，以及在智能体卡片中公布了路由标识符时客户端必须遵循的规则。

## 概述

一种常见的部署模式是将多个智能体置于单个主机或反向代理之后。从外部看，这些智能体在同一个域下可达，但需要区分每个单独的智能体，以便将请求传递到正确的后端。

有三种互补的方法可用：

### 1. 基于 URL 的路由（子路径）

每个智能体被分配一个不同的 URL 前缀。每个智能体的智能体卡片在其 `supportedInterfaces` 中公布自己的 `url`，因此客户端自动将请求发送到正确的路径。

"计费"智能体的智能体卡片：

```json
{
  "name": "计费智能体",
  "supportedInterfaces": [
    {
      "url": "https://agents.example.com/billing",
      "protocolBinding": "HTTP+JSON",
      "protocolVersion": "1.0"
    }
  ]
}
```

"支持"智能体的智能体卡片：

```json
{
  "name": "支持智能体",
  "supportedInterfaces": [
    {
      "url": "https://agents.example.com/support",
      "protocolBinding": "HTTP+JSON",
      "protocolVersion": "1.0"
    }
  ]
}
```

网关或反向代理将 `/billing/*` 和 `/support/*` 路由到相应的后端。这是最简单的方法，不需要客户端在读取智能体卡片之外的特殊意识。

### 2. 基于身份验证头的路由

当多个智能体共享相同的 URL 时，网关可以使用请求中已存在的身份验证凭据来确定路由到哪个智能体。身份验证要求在智能体卡片的 `securitySchemes` 和 `security` 字段中声明，使此方法对客户端完全可发现。

示例：

- 一个 Bearer 令牌，其声明（如 audience 或 scope）标识目标智能体。
- 一个 API 密钥，在网关的配置中映射到特定智能体。

网关检查凭证并将请求转发到相应的后端，而不对 A2A 协议消息本身进行任何更改。

### 3. 使用 `tenant` 字段的基于主体的路由

每个 A2A 请求消息都包含一个可选的 `tenant` 字段。这是一个**不透明字符串**，其值完全由服务器运营者定义；协议不对其施加任何格式或语义。网关或智能体实现可以检查此字段并将请求转发到相应的后端。

客户端应对特定智能体使用的 `tenant` 值在 `supportedInterfaces` 内的 `AgentInterface` 条目中公布：

```json
{
  "name": "计费智能体",
  "supportedInterfaces": [
    {
      "url": "https://agents.example.com/a2a",
      "protocolBinding": "HTTP+JSON",
      "protocolVersion": "1.0",
      "tenant": "billing"
    }
  ]
}
```

**客户端要求：** 客户端**必须**始终将所选 `AgentInterface` 条目中的 `tenant` 值回显到每个请求消息中。如果 `AgentInterface` 没有设置 `tenant`，则该字段**必须**从请求中省略。有关规范性规则，请参见规范的[第 8.3.2 节](../specification.md#832-client-protocol-selection)。

服务器可以使用 `tenant` 字段表示适合其部署的任何路由键——智能体标识符、工作区 slug、组织 ID 或任何其他不透明鉴别器。

## 组合方法

这三种方法并非互斥。例如，部署可以使用基于 URL 的路由来区分主要产品线，并依靠 `tenant` 字段来区分每个产品线内的单个客户。适当的组合取决于运营者的架构和正在使用的网关的能力。

## 发现多个智能体

当多个智能体部署在共享域后面时，每个智能体**应该**在适当位置发布自己的智能体卡片（参见[智能体发现](./agent-discovery.md)）。客户端独立检索每个智能体的卡片，并使用其中包含的 `supportedInterfaces` 信息（包括任何 `tenant` 值）与正确的智能体通信。
