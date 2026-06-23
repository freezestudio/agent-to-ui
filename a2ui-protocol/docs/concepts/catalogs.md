# A2UI 目录

## 概述

本指南定义了 A2UI 目录架构，并提供了实现的路线图。它解释了目录模式的结构，概述了使用预构建的"基本目录"与定义自己应用特定目录的策略，并详细说明了目录协商、版本控制和运行时验证的技术协议。

## 目录模式

目录模式是一个 [JSON Schema 文件](../../specification/v0_9/json/client_capabilities.json#L62C5-L95C6)，概述了代理可用于定义 A2UI 表面的组件、函数和主题。所有从代理发送的 A2UI JSON 都会根据选定的目录进行验证。

[目录 JSON Schema](../../specification/v0_9/json/client_capabilities.json#L62C5-L95C6) 如下：

```json
{
  "Catalog": {
    "type": "object",
    "description": "组件和函数定义的集合。",
    "properties": {
      "catalogId": {
        "type": "string",
        "description": "此目录的唯一标识符。"
      },
      "components": {
        "type": "object",
        "description": "此目录支持的 UI 组件定义。",
        "additionalProperties": {
          "$ref": "https://json-schema.org/draft/2020-12/schema"
        }
      },
      "functions": {
        "type": "array",
        "description": "此目录支持的函数定义。",
        "items": {
          "$ref": "#/$defs/FunctionDefinition"
        }
      },
      "theme": {
        "title": "A2UI 主题",
        "description": "定义 A2UI 主题属性目录的模式。",
        "type": "object",
        "additionalProperties": {
          "$ref": "https://json-schema.org/draft/2020-12/schema"
        }
      }
    },
    "required": ["catalogId"],
    "additionalProperties": false
  }
}
```

## 目录策略

每个 A2UI 表面都由一个目录驱动。目录只是一个 JSON Schema 文件，告诉代理哪些组件、函数和主题可供其使用。

无论你是构建简单的原型还是复杂的生产应用，要求都是一样的：你必须提供一个目录定义，代理用它来表达 UI。

### 基本目录

为帮助开发者快速上手，A2UI 团队维护了[基本目录](../../specification/v0_9/catalogs/basic/catalog.json)。

这是一个预定义的目录文件，包含一组基本的通用组件（按钮、输入框、卡片）和函数。它不是一种特殊的"类型"目录，只是我们已编写完毕且有开源渲染器可用的一个目录版本。

基本目录允许你在无需从头编写自己的模式的情况下启动应用或验证 A2UI 概念。它故意保持精简，以便不同的渲染器易于实现。

由于 A2UI 的设计目的是让 LLM 在设计时或运行时生成 UI，我们认为可移植性并不要求跨多个客户端使用标准化目录；LLM 可以为每个单独的前端解释目录。

[查看 A2UI v0.9 基本目录](../../specification/v0_9/catalogs/basic/catalog.json)

### 定义自己的目录

虽然基本目录对初学者有用，但大多数生产应用会定义自己的目录来反映其特定设计系统。

通过定义自己的目录，你可以限制代理只使用应用中存在的组件和视觉语言，而不是通用的输入框或按钮。这个目录可以完全从头构建，也可以从基本目录导入定义以节省时间（例如，使用基本文本定义，同时定义自己独特的 Card 组件）。

为简单起见，我们建议构建直接反映客户端设计系统的目录，而不是试图通过适配器将基本目录映射到它。由于 A2UI 是为 GenUI 设计的，我们期望 LLM 可以为不同的客户端解释不同的目录。

[查看一个 Rizzcharts 目录示例](../../samples/community/agent/adk/rizzcharts/catalog_schemas/0.9/rizzcharts_catalog_definition.json)

### 建议

| 用例                               | 建议                                                                 | 工作量                         |
| :---------------------------------- | :------------------------------------------------------------------- | :----------------------------- |
| 为成熟的前端添加 A2UI               | 定义一个镜像你现有设计系统的目录。                                    | 中等                           |
| 为新应用添加 A2UI                   | 从基本目录开始，随着应用演进而发展为自有目录                         | 低（假设渲染器已存在）          |

## 构建目录

目录是一个符合[目录模式](../../specification/v0_9/json/client_capabilities.json#L62C5-L95C6)的 JSON Schema 文件，定义了代理在构建表面时可以使用的组件、主题和函数。

### 示例：最小目录

这是一个定义单个组件的简单目录。

```json
{
  "$id": "https://github.com/.../hello_world/v1/catalog.json",
  "components": {
    "HelloWorldBanner": {
      "type": "object",
      "description": "一个简单的横幅问候语。",
      "properties": {
        "message": {
          "type": "string",
          "description": "横幅文本。"
        },
        "backgroundColor": {
          "type": "string",
          "default": "#f0f0f0"
        }
      },
      "required": ["message"]
    }
  }
}
```

当代理使用该目录时，它生成严格符合该结构的负载：

```json
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "hello-world-surface",
      "catalogId": "https://github.com/.../hello_world/v1/catalog.json"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "hello-world-surface",
      "components": [
        {
          "id": "root",
          "component": "HelloWorldBanner",
          "message": "你好，世界！欢迎使用你的第一个目录。",
          "backgroundColor": "#4CAF50"
        }
      ]
    }
  }
]
```

### 目录链接

A2UI 目录必须是独立的（不引用外部文件），以简化 LLM 推理和依赖管理。

虽然最终目录必须是独立的，但你在本地开发期间仍可以使用 JSON Schema 的 `$ref` 引用外部文档来模块化地编写目录。

为了自动化这些外部文件引用的打包和注册，这个目录注册过程称为**"链接"**，并由一个跨平台的 Node.js 脚本（**`register-catalogs.js`**）统一处理。

这个链接脚本原生封装在 **Xcode 构建阶段**（用于 iOS/macOS 客户端构建）和 **Gradle 任务**（用于 Android 客户端构建）中，以便在应用构建阶段无缝编译、聚合和链接静态和动态模式。

### 组合和导入

你不必从头定义所有内容。你可以定义一个使用基本或其他目录中现有组件的目录，并重复使用现有的渲染逻辑。

#### 示例：扩展基本目录

此目录导入基本目录中的所有元素，并添加一个新的 `SuggestionChips` 组件。

```json
{
  "$id": "https://github.com/.../hello_world_with_all_basic/v1/catalog.json",
  "components": {
    "allOf": [
      {"$ref": "basic_catalog_definition.json#/components"},
      {
        "SuggestionChips": {
          "type": "object",
          "description": "建议提示列表",
          "properties": {
            "suggestions": {
              "type": "array",
              "description": "建议的提示。"
            }
          },
          "required": ["suggestions"]
        }
      }
    ]
  }
}
```

**确保在编译期间使用你平台的 Xcode 构建阶段或 Gradle 任务（运行 `register-catalogs.js`）链接和解析外部引用。**

#### 示例：挑选组件

此目录只从基本目录导入 `Text` 来构建一个简单的弹出表面。

```json
{
  "$id": "https://github.com/.../hello_world_with_some_basic/v1/catalog.json",
  "components": {
    "allOf": [
      {"$ref": "catalogs/basic/catalog.json#/components/Text"},
      {
        "Popup": {
          "type": "object",
          "description": "显示图标和文本的模态覆盖层。",
          "properties": {
            "text": {"$ref": "common_types.json#/$defs/ComponentId"}
          },
          "required": ["text"]
        }
      }
    ]
  }
}
```

**确保在编译期间使用你平台的 Xcode 构建阶段或 Gradle 任务（运行 `register-catalogs.js`）链接和解析外部引用。**

### 实现渲染器

客户端渲染器通过将模式定义映射到实际代码来实现目录。

hello world 目录的 TypeScript 渲染器示例：

```typescript
import {Catalog, DEFAULT_CATALOG} from '@a2ui/angular';
import {inputBinding} from '@angular/core';

export const RIZZ_CHARTS_CATALOG = {
  ...DEFAULT_CATALOG, // 包含基本目录
  HelloWorldBanner: {
    type: () => import('./hello_world_banner').then(r => r.HelloWorldBanner),
    bindings: ({properties}) => [
      inputBinding(
        'message',
        () => ('message' in properties && properties['message']) || undefined,
      ),
    ],
  },
} as Catalog;
```

以及 hello_world_banner 的实现：

```typescript
import {DynamicComponent} from '@a2ui/angular';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'hello-world-banner',
  imports: [],
  template: `
    <div>
      <h2>Hello World 横幅</h2>
      <p>{{ message }}</p>
    </div>
  `,
})
export class HelloWorldBanner extends DynamicComponent {
  @Input() message?: string;
}
```

你可以在[编排器演示](../../samples/community/client/angular/projects/orchestrator/src/a2ui-catalog/catalog.ts)中看到客户端渲染器的工作示例。

## A2UI 目录协商

由于客户端和代理可以支持多个目录，它们必须通过目录协商握手来就使用哪个目录达成一致。

### 第 1 步：代理声明其支持的目录（可选）

代理可以选择性地声明它能够使用的目录（例如，在 A2A Agent Card 中）。这是信息性的，帮助客户端了解代理是否支持其特定功能，但客户端不必使用它。

代理 AgentCard 声明支持基本目录和 rizzcharts 目录的示例：

```json
{
  "name": "电商仪表盘代理",
  "description": "此代理可视化电商数据...",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://a2ui.org/a2a-extension/a2ui/v0.8",
        "description": "使用 A2UI JSON 格式提供代理驱动的 UI。",
        "params": {
          "supportedCatalogIds": [
            "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
            "https://github.com/.../rizzcharts_catalog_definition.json"
          ]
        }
      }
    ]
  }
}
```

### 第 2 步：客户端声明其支持的目录（必需）

客户端在每条消息的元数据中按偏好顺序向代理发送 supportedCatalogIds 列表。这告诉代理客户端当前准备渲染什么。

包含 supportedCatalogIds 在元数据中的 A2A 消息示例：

```json
{
  "parts": [
    {
      "text": "我的航班当前状态如何？"
    }
  ],
  "metadata": {
    "a2uiClientCapabilities": {
      "supportedCatalogIds": [
        "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
        "https://github.com/.../rizzcharts_catalog_definition.json"
      ]
    }
  }
}
```

### 第 3 步：代理选择

当代理创建新表面时，它从客户端的 `supportedCatalogIds` 列表中选择最佳匹配。此选择在该表面的生命周期内保持固定。如果找不到兼容的目录，代理将不会发送 UI。

代理定义表面中使用的 catalog_id 的 A2UI 消息示例：

```json
{
  "createSurface": {
    "surfaceId": "salesDashboard",
    "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
  }
}
```

## 目录命名和版本控制

A2UI 组件目录需要版本控制，因为目录定义通常在编译时构建，因此代理生成的内容与客户端可以渲染的内容之间的任何不匹配都可能影响 UI。

### CatalogId 命名约定

`catalogId` 是一个唯一的文本标识符，用于客户端和代理之间的协商。

- **格式：** 虽然 `catalogId` 技术上是一个字符串，但 A2UI 约定使用 **URI**（例如 `https://example.com/catalogs/mysurface/v1/catalog.json`）。
- **目的：** 我们使用 URI 使 ID 全局唯一，并方便人类开发者在浏览器中检查。
- **无运行时获取：** 此 URI 并不意味着代理或客户端在运行时下载目录。**目录定义必须事先（在编译/部署时）为代理和客户端所知。** URI 仅用作稳定的标识符。

### 版本控制指南

为支持在不破坏旧客户端或代理的情况下持续演进，A2UI 根据更改是否**可以安全忽略**来分类目录更新。

虽然标准 JSON 解析器会忽略未知字段，但在服务器驱动的 UI 中，删除一个组件可能会丢弃其整个视图树。为了兼顾安全性和灵活性，更新分为**破坏性**和**非破坏性**两类，依靠**优雅降级**来吸收版本滞后。

- **破坏性更改（需要主版本号更新）**
  任何以旧客户端无法安全忽略的方式改变结构的更改，都要增加 `catalogId` URI 中的**主**版本号（例如，`v1` 到 `v2`）。
    - **添加容器组件：** 例如，添加 `Grid` 或 `Accordion` 组件。如果旧客户端忽略了一个容器，它将丢弃其所有子组件，破坏 UI 树。
    - **移除容器组件：** 例如，移除 `Grid` 或 `Accordion` 组件。如果旧代理使用了该容器，它将被客户端忽略，并且客户端将丢弃其所有子组件，破坏 UI 树。
    - **更改字段类型：** 例如，将属性从 `string` 改为 `object`。这会在旧客户端上导致 JSON Schema 验证失败。
    - **添加必需属性：** 没有默认值，因为旧代理不知道要发送它。

- **非破坏性更改（允许在主版本号下进行）**
  可以安全忽略或优雅降级而不破坏布局或数据模型的更改可以保留在当前版本。
    - **添加叶子组件（非容器）：** 例如，添加 `Badge` 或 `Tooltip`。如果被忽略，布局保持完整。
    - **添加可选属性：** 例如，向 Card 添加 `subtitle`。
    - **移除属性：** 如果代理停止发送，客户端可以安全忽略。
    - **添加新函数或样式：** 通常可以在不改变组件语义含义的情况下忽略。
    - **元数据更改：** 更新 `description` 字段或修复文档中的拼写错误不需要版本更新，对运行时没有影响。

### 优雅降级

**非破坏性更改依赖于优雅降级。** 如果代理在旧客户端上使用新组件/属性，客户端**必须**优雅地处理（例如，忽略它或渲染文本回退或"不支持"占位符），而不是崩溃。客户端也可以将验证错误报告回代理，允许代理自我修正并自动降级 UI。

#### 优雅降级示例

以下是实际中如何处理目录版本不匹配：

- **旧的 iOS 客户端使用的目录版本比代理旧**
    - 代理发送旧 iOS 客户端不知道的新组件 `Badge`。客户端为它渲染通用的文本框占位符或安全的文本描述，保持界面其余部分的功能正常。
    - 代理在旧客户端不认识的 `Button` 上发送新属性 `badge`。客户端安全地忽略它并渲染标准按钮。
    - 代理不再发送在较新目录版本中移除的 `Facepile` 组件。这对客户端没有影响。

- **Web 客户端在代理之前推出了新的目录版本**
    - Web 客户端支持新的 `Badge` 组件，但代理还不知道它。
    - Web 客户端移除了 `Button` 上的 `badge` 属性，因此如果代理发送它，客户端会忽略它。
    - Web 客户端为 `Button` 添加了代理不知道的新样式。同样，这不会造成问题，因为代理不会使用它们。

### 使用 CatalogId 进行版本控制

我们建议将版本号包含在 catalogId 中。这允许在迁移期间使用 A2UI 目录协商同时支持多个版本，确保零停机。

**推荐模式：**

| 更改类型    | URI 示例                         | 描述                                                   |
| :----------- | :------------------------------- | :------------------------------------------------------------ |
| **当前**     | .../rizzcharts/v1/catalog.json   | 版本 1.x。支持 1.x 分支中的所有增量更新。 |
| **破坏性**   | .../rizzcharts/v2/catalog.json   | 引入破坏性结构更改的新模式。 |

### 处理迁移

要升级目录而不破坏活动代理，请使用 A2UI 目录协商：

1. **客户端更新：** 客户端更新其 `supportedCatalogIds` 列表，同时包含旧版本和新版本（例如 `[".../v2/...", ".../v1/..."]`）。
2. **代理更新：** 代理使用 v2 模式重新构建。当它们看到客户端支持 v2 时，优先使用 v2。
3. **旧版支持：** 尚未重新构建的旧代理将继续匹配客户端列表中的 v1，确保它们保持功能正常。

## A2UI 模式验证和回退

为确保稳定的用户体验，A2UI 采用两阶段验证策略。这种"纵深防御"方法尽可能早地捕获错误，同时确保客户端在面对意外负载时保持健壮。

### 两阶段验证

1. **代理端（发送前）：** 在传输任何 UI 负载之前，代理运行时根据目录定义验证生成的 JSON。
    - 目的：在源头捕获幻觉属性或结构错误。
    - 结果：如果验证失败，代理可以尝试修复或重新生成 A2UI JSON，或者执行优雅降级，例如在对话应用中回退到文本。
2. **客户端：** 收到负载后，客户端库根据其本地目录定义验证 JSON。
    - 目的：安全性和稳定性。确保在用户设备上执行的代码严格符合预期契约，防止版本不匹配或代理输出被篡改。
    - 结果：此处的失败通过"error"客户端消息报告回代理。

### 优雅降级

即使负载通过了模式验证，渲染器也可能遇到运行时问题（例如，缺少资源、组件实现尚未加载或平台特定限制）。

客户端在遇到这些错误时不应崩溃。相反，它们应采用优雅降级：

- **未知组件：** 如果某个组件在模式中被识别但渲染器中未实现，渲染一个"安全"的回退（例如，带有组件调试名称的通用卡片）或完全跳过渲染该特定节点。
- **文本回退：** 如果整个表面渲染失败，显示原始文本描述（如果可用）或通用错误消息：*"无法显示此界面。"*

### 客户端到服务器的错误报告

当客户端检测到验证错误或运行时故障时，它可以向代理报告。这允许代理系统为开发者记录失败，或调整其未来行为。

客户端使用标准 A2UI 客户端到服务器事件模式发送 `VALIDATION_FAILED` 事件。

客户端报告缺少必需字段的示例：

```json
{
  "version": "v0.9",
  "error": {
    "code": "VALIDATION_FAILED",
    "surfaceId": "flight-status-card-123",
    "path": "/components/FlightCard/flightNumber",
    "message": "组件 'FlightCard' 中缺少必需属性 'flightNumber'。"
  }
}
```

## 内联目录

支持客户端在运行时发送内联目录，但不建议在生产中使用。有关更多详细信息，请参见[此处](../../specification/v0_9/docs/a2ui_protocol.md#client-capabilities--metadata)。
