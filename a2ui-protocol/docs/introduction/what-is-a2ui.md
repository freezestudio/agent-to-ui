# 什么是 A2UI？

**A2UI（Agent to UI，代理到用户界面）是一种用于代理驱动界面的声明式 UI 协议。** AI 代理可以生成丰富的交互式用户界面，这些界面在各平台（Web、移动端、桌面端）上原生渲染，而无需执行任意代码。

## 问题

**纯文本的代理交互效率低下：**

```
用户："帮我预订明天晚上7点两个人"
代理："好的，请问哪一天？"
用户："明天"
代理："什么时间？"
...
```

**更好的方式：** 代理生成一个包含日期选择器、时间选择器和提交按钮的表单。用户与 UI 交互，而不是文本。

## 挑战

在多代理系统中，代理通常远程运行（不同服务器、不同组织）。它们无法直接操作你的 UI——它们必须发送消息。

**传统方法：** 在 iframe 中发送 HTML/JavaScript。

- 体积庞大，视觉上不协调。
- 安全性复杂。
- 与应用样式不匹配。

**需求：** 传递像数据一样安全、像代码一样富有表现力的 UI。

## 解决方案

A2UI：描述 UI 的 JSON 消息，具有以下特性：

- LLM 可以将其生成为结构化输出。
- 可通过任何传输层（A2A、AG-UI、SSE、WebSocket）传输。
- 客户端使用自己的原生组件进行渲染。

**结果：** 客户端控制安全性和样式，代理生成的 UI 具有原生感。

### 示例

=== "v0.8（旧版）"

    ```jsonl
    {
      "surfaceUpdate": {
        "surfaceId": "booking",
        "components": [
          {
            "id": "title",
            "component": {
              "Text": {
                "text": { "literalString": "预订餐桌" },
                "usageHint": "h1"
              }
            }
          },
          {
            "id": "datetime",
            "component": {
              "DateTimeInput": {
                "value": { "path": "/booking/date" },
                "enableDate": true
              }
            }
          },
          {
            "id": "submit-text",
            "component": {
              "Text": {
                "text": { "literalString": "确认" }
              }
            }
          },
          {
            "id": "submit-btn",
            "component": {
              "Button": {
                "child": "submit-text",
                "action": { "name": "confirm_booking" }
              }
            }
          }
        ]
      }
    }
    {
      "dataModelUpdate": {
        "surfaceId": "booking",
        "contents": [
          {
            "key": "booking",
            "valueMap": [
              { "key": "date", "valueString": "2025-12-16T19:00:00Z" }
            ]
          }
        ]
      }
    }
    {
      "beginRendering": {
        "surfaceId": "booking",
        "root": "title"
      }
    }
    ```

=== "v0.9（稳定版）"

    ```jsonl
    {
      "version": "v0.9.1",
      "createSurface": {
        "surfaceId": "booking",
        "catalogId": "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json"
      }
    }
    {
      "version": "v0.9.1",
      "updateComponents": {
        "surfaceId": "booking",
        "components": [
          {
            "id": "title",
            "component": "Text",
            "text": "预订餐桌",
            "variant": "h1"
          },
          {
            "id": "datetime",
            "component": "DateTimeInput",
            "value": { "path": "/booking/date" },
            "enableDate": true
          },
          {
            "id": "submit-text",
            "component": "Text",
            "text": "确认"
          },
          {
            "id": "submit-btn",
            "component": "Button",
            "child": "submit-text",
            "variant": "primary",
            "action": {
              "event": { "name": "confirm_booking" }
            }
          }
        ]
      }
    }
    {
      "version": "v0.9.1",
      "updateDataModel": {
        "surfaceId": "booking",
        "path": "/booking",
        "value": {
          "date": "2025-12-16T19:00:00Z"
        }
      }
    }
    ```

    v0.9 的关键区别：`createSurface` 替代了 `beginRendering`，组件使用更扁平的结构（`"component": "Text"` 而非嵌套对象），所有消息都包含 `version` 字段。

客户端将这些消息渲染为原生组件（Angular、Flutter、React 等）。

## 核心价值

**1. 安全性：** 声明式数据，而非代码。代理从客户端受信任的目录请求组件。无代码执行风险。

**2. 原生体验：** 无需 iframe。客户端使用自己的 UI 框架渲染。继承应用样式、无障碍支持和性能。

**3. 可移植性：** 一个代理响应可随处运行。相同的 JSON 可在 Web（Lit/Angular/React）、移动端（Flutter/SwiftUI/Jetpack Compose）和桌面端渲染。

## 设计原则

**1. LLM 友好：** 扁平的组件列表，使用 ID 引用。易于增量生成、修正错误和流式传输。

**2. 框架无关：** 代理发送抽象的组件树。客户端映射到原生部件（Web/移动端/桌面端）。

**3. 关注点分离：** 三层架构——UI 结构、应用状态、客户端渲染。支持数据绑定、响应式更新、清晰的架构。

## A2UI 不是什么

- 不是框架（它是一个协议）。
- 不是 HTML 的替代品（用于代理生成的 UI，而非静态网站）。
- 不是完整的样式系统（客户端控制样式，仅提供有限的服务端样式支持）。
- 不限于 Web（适用于移动端和桌面端）。

## 关键概念

A2UI 依赖以下关键概念：

- **Surface（表面）**：组件的画布（对话框、侧边栏、主视图）。
- **Component（组件）**：UI 元素（Button、TextField、Card 等）。
- **Data Model（数据模型）**：应用状态，组件绑定到该状态。
- **Catalog（目录）**：可用的组件类型集合。
- **Message（消息）**：JSON 对象（`surfaceUpdate`、`dataModelUpdate`、`beginRendering` 等）。

有关类似项目的比较，请参见 [代理 UI 生态系统](agent-ui-ecosystem.md)。
