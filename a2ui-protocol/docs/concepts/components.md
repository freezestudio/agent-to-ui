# 组件和结构

A2UI 使用**邻接表模型**来表示组件层次。组件是一个扁平的列表，通过 ID 引用关联，而不是嵌套的 JSON 树。

## 为什么使用扁平列表？

**传统的嵌套方法：**

- LLM 必须一次性生成完美的嵌套结构
- 难以更新深层嵌套的组件
- 难以增量流式传输

**A2UI 邻接表：**

- 扁平结构，LLM 易于生成。
- 可以增量发送组件。
- 可以通过 ID 更新任何组件。
- 结构和数据清晰分离。

## 邻接表模型

=== "v0.8"

    ```json
    {
      "surfaceUpdate": {
        "components": [
          {
            "id": "root",
            "component": {
              "Column": {
                "children": { "explicitList": ["greeting", "buttons"] }
              }
            }
          },
          {
            "id": "greeting",
            "component": {
              "Text": { "text": { "literalString": "你好" } }
            }
          },
          {
            "id": "buttons",
            "component": {
              "Row": {
                "children": { "explicitList": ["cancel-btn", "ok-btn"] }
              }
            }
          },
          {
            "id": "cancel-btn",
            "component": {
              "Button": {
                "child": "cancel-text",
                "action": { "name": "cancel" }
              }
            }
          },
          {
            "id": "cancel-text",
            "component": {
              "Text": { "text": { "literalString": "取消" } }
            }
          },
          {
            "id": "ok-btn",
            "component": {
              "Button": {
                "child": "ok-text",
                "action": { "name": "ok" }
              }
            }
          },
          {
            "id": "ok-text",
            "component": {
              "Text": { "text": { "literalString": "确定" } }
            }
          }
        ]
      }
    }
    ```

=== "v0.9 及更高版本"

    ```json
    {
      "version": "v0.9.1",
      "updateComponents": {
        "surfaceId": "main",
        "components": [
          {
            "id": "root",
            "component": "Column",
            "children": ["greeting", "buttons"]
          },
          {
            "id": "greeting",
            "component": "Text",
            "text": "你好"
          },
          {
            "id": "buttons",
            "component": "Row",
            "children": ["cancel-btn", "ok-btn"]
          },
          {
            "id": "cancel-btn",
            "component": "Button",
            "child": "cancel-text",
            "action": { "event": { "name": "cancel" } }
          },
          {
            "id": "cancel-text",
            "component": "Text",
            "text": "取消"
          },
          {
            "id": "ok-btn",
            "component": "Button",
            "child": "ok-text",
            "action": { "event": { "name": "ok" } }
          },
          {
            "id": "ok-text",
            "component": "Text",
            "text": "确定"
          }
        ]
      }
    }
    ```

    v0.9 及更高版本使用更扁平的组件格式：`"component": "Text"` 替代嵌套的 `{"Text": {...}}`，子元素使用简单的数组替代 `{"explicitList": [...]}`。

组件通过 ID 引用子元素，而非通过嵌套。

## 组件基础

每个组件包含：

1. **ID**：唯一标识符（如 `"welcome"`）
2. **类型**：组件类型（`Text`、`Button`、`Card`）
3. **属性**：特定于该类型的配置

=== "v0.8"

    ```json
    {
      "id": "welcome",
      "component": {
        "Text": {
          "text": { "literalString": "你好" },
          "usageHint": "h1"
        }
      }
    }
    ```

=== "v0.9 及更高版本"

    ```json
    {
      "id": "welcome",
      "component": "Text",
      "text": "你好",
      "variant": "h1"
    }
    ```

## 基本目录

为帮助开发者快速上手，A2UI 团队维护了[基本目录](../specification/v0_9_1/catalogs/basic/catalog.json)。

这是一个预定义的目录文件，包含一组通用的基本组件（按钮、输入框、卡片）。它并不是一种特殊"类型"的目录，只是一个已有开源渲染器可用的目录版本。

有关完整的组件展示和示例，请参见[组件参考](../reference/components.md)。

## 静态与动态子元素

=== "v0.8"

    **静态（`explicitList`）** - 固定的子元素 ID 列表：

    ```json
    {
      "children": {
        "explicitList": ["back-btn", "title", "menu-btn"]
      }
    }
    ```

    **动态（`template`）** - 根据数据数组生成子元素：

    ```json
    {
      "children": {
        "template": {
          "dataBinding": "/items",
          "componentId": "item-template"
        }
      }
    }
    ```

    对于 `/items` 中的每个项目，渲染 `item-template`。详见[数据绑定](data-binding.md)。

=== "v0.9 及更高版本"

    **静态** - 固定的子元素 ID 列表：

    ```json
    {
      "children": ["back-btn", "title", "menu-btn"]
    }
    ```

    **动态** - 根据数据数组生成子元素：

    ```json
    {
      "children": {
        "path": "/items",
        "componentId": "item-template"
      }
    }
    ```

    对于 `/items` 中的每个项目，渲染 `item-template`。详见[数据绑定](data-binding.md)。

## 获取值

组件通过两种方式获取值：

=== "v0.8"

    - **字面值** - 固定值：`{"text": {"literalString": "欢迎"}}`
    - **数据绑定** - 来自数据模型：`{"text": {"path": "/user/name"}}`

=== "v0.9 及更高版本"

    - **字面值** - 固定值：`{"text": "欢迎"}`
    - **数据绑定** - 来自数据模型：`{"text": {"path": "/user/name"}}`

LLM 可以生成包含字面值的组件，也可以将它们绑定到数据路径以实现动态内容。

## 组合表面

组件组合成**表面**（部件）：

=== "v0.8"

    1. LLM 通过 `surfaceUpdate` 生成组件定义
    2. LLM 通过 `dataModelUpdate` 填充数据
    3. LLM 通过 `beginRendering` 指示渲染
    4. 客户端将所有组件渲染为原生部件

=== "v0.9 及更高版本"

    1. LLM 通过 `createSurface` 创建表面（指定目录；v1.0 中还可以包含初始数据模型和组件）
    2. LLM 通过 `updateComponents` 生成组件定义
    3. LLM 通过 `updateDataModel` 填充数据
    4. 客户端将所有组件渲染为原生部件

表面是一个完整的、内聚的 UI（表单、仪表盘、聊天等）。

## 增量更新

增量更新支持以下操作：

- **添加** - 发送包含新 ID 的新组件定义
- **更新** - 使用现有 ID 和新属性发送组件定义
- **移除** - 更新父级的 `children` 列表以排除已移除的 ID

扁平结构使所有更新都是简单的基于 ID 的操作。

## 定义自己的目录

虽然基本目录对初学者很有用，但大多数生产应用会定义自己的目录来反映其特定设计系统。

通过定义自己的目录，你可以限制代理只使用应用中存在的组件和视觉语言，而不是通用的输入框或按钮。

参见[定义自己的目录指南](../guides/defining-your-own-catalog.md)了解实现细节。

## 最佳实践

1. **描述性 ID**：使用 `"user-profile-card"` 而非 `"c1"`
2. **浅层次**：避免深层嵌套
3. **结构与内容分离**：使用数据绑定，而非字面值
4. **模板复用**：通过动态子元素实现一个模板多个实例
