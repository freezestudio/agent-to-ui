# 编写自定义组件

学习如何使用 `rizzcharts` 示例在 A2UI 中定义、实现和注册自定义组件。本指南侧重于围绕你的 Angular 代码编写组件。

## 概述

编写新组件包括四个主要步骤：

1.  **定义目录模式**：在 JSON Schema 中指定组件的属性和类型。
2.  **定义组件（客户端）**：使用你的框架（例如 Angular）实现 UI。
3.  **注册到渲染器（客户端）**：将组件添加到你的客户端目录中。
4.  **从代理调用**：指示代理通过 `send_a2ui_json_to_client` 使用该组件。

---

## 1. 定义目录模式

目录模式定义了目录的 API。它列出了可用组件及其属性，代理使用这些来构建 UI 负载。

**此模式充当客户端和服务器（代理）之间的契约。** 双方必须同意此模式才能渲染工作。客户端声明它支持哪些目录，服务器选择一个兼容的。有关此握手如何工作的详细信息，请参见 [A2UI 目录协商](../concepts/catalogs.md#a2ui-catalog-negotiation)。

在 [`rizzcharts`](../../samples/community/agent/adk/rizzcharts/python/README.md) 示例中，目录模式定义在 [`rizzcharts_catalog_definition.json`](../../samples/community/agent/adk/rizzcharts/catalog_schemas/0.9/rizzcharts_catalog_definition.json) 中。

以下是 `Chart` 组件的模式：

```json
"Chart": {
  "type": "object",
  "description": "一个交互式图表，使用对象的层次列表作为其数据。",
  "properties": {
    "type": {
      "type": "string",
      "description": "要渲染的图表类型。",
      "enum": [
        "doughnut",
        "pie"
      ]
    },
    "title": { ... },
    "chartData": { ... }
  },
  "required": ["type", "chartData"]
}
```

---

## 2. 实现组件（客户端）

使用你的客户端框架实现组件。对于 Angular，你的组件应扩展 `@a2ui/angular` 提供的 `DynamicComponent`。

在 [`orchestrator`](../../samples/community/client/angular/projects/orchestrator/README.md) 示例中，`Chart` 组件定义在 [`chart.ts`](../../samples/community/client/angular/projects/orchestrator/src/a2ui-catalog/chart.ts) 中。

```typescript
import {DynamicComponent} from '@a2ui/angular';
import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'a2ui-chart',
  template: `
    <div>
      <h2>{{ resolvedTitle() }}</h2>
      <canvas baseChart [data]="currentData()" [type]="chartType()"></canvas>
    </div>
  `,
})
export class Chart extends DynamicComponent<Types.CustomNode> {
  readonly type = input.required<string>();
  readonly title = input<Primitives.StringValue | null>();
  // ... 数据解析逻辑
}
```

实现组件时牢记这些关键点：

- **扩展 `DynamicComponent`**：这使你能够访问 `resolvePrimitive` 以进行数据绑定解析。
- **使用 Angular Inputs**：将模式中的属性映射到 Angular inputs。

---

## 3. 注册到渲染器（客户端）

组件实现后，将其注册到客户端目录中。这将组件名称（代理使用）映射到实现类。

在 [`orchestrator`](../../samples/community/client/angular/projects/orchestrator/README.md) 示例中，这是在 [`catalog.ts`](../../samples/community/client/angular/projects/orchestrator/src/a2ui-catalog/catalog.ts) 中完成的。

```typescript
import {Catalog, DEFAULT_CATALOG} from '@a2ui/angular';
import {inputBinding} from '@angular/core';

export const RIZZ_CHARTS_CATALOG = {
  ...DEFAULT_CATALOG,
  Chart: {
    type: () => import('./chart').then(r => r.Chart),
    bindings: ({properties}) => [
      inputBinding('type', () => ('type' in properties && properties['type']) || undefined),
      inputBinding('title', () => ('title' in properties && properties['title']) || undefined),
      inputBinding('chartData', () => ('chartData' in properties && properties['chartData']) || undefined),
    ],
  },
} as Catalog;
```

注册的关键点：

- **懒加载**：使用 `import()` 懒加载组件代码。
- **输入绑定**：使用 `inputBinding` 将模式中的属性映射到 Angular inputs。

---

## 4. 从代理调用

要使用自定义组件，你使用 A2UI SDK 中理解你的目录的工具初始化代理。SDK 处理解析目录并向模型提供示例。

以下是流程的连接方式：

### 4.1 会话准备（执行器）

执行层（例如 `RizzchartsAgentExecutor`）拦截传入消息以检测 A2UI 是否启用以及客户端支持哪些目录。它解析目录并将其保存到会话状态。

### 4.2 代理工具设置

代理使用 [SendA2uiToClientToolset](../../agent_sdks/python/a2ui_agent/src/a2ui/adk/send_a2ui_to_client_toolset.py) 为代理提供一个可用于向客户端发送 A2UI 的工具。

### 4.3 工具执行

LLM 调用工具由 A2A 代理执行器使用 [A2uiEventConverter](../../agent_sdks/python/a2ui_agent/src/a2ui/adk/a2a/event_converter.py) 拦截。这自动将工具调用转换为带有 A2UI 负载的 A2A Datapart。
