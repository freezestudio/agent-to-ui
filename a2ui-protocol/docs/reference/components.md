# 组件画廊

此页面展示所有 A2UI 组件及其示例和使用模式。

---

## 布局组件

### Row

水平布局容器。子元素从左到右排列。

=== "v0.8"

    **属性：** `children`（`explicitList` 或 `template`）、`distribution`、`alignment`

    ```json
    {
      "id": "toolbar",
      "component": {
        "Row": {
          "children": { "explicitList": ["btn1", "btn2", "btn3"] },
          "distribution": "spaceBetween",
          "alignment": "center"
        }
      }
    }
    ```

=== "v0.9"

    **属性：** `children`（数组或 template）、`justify`、`align`

    ```json
    {
      "id": "toolbar",
      "component": "Row",
      "children": ["btn1", "btn2", "btn3"],
      "justify": "spaceBetween",
      "align": "center"
    }
    ```

### Column

垂直布局容器。子元素从上到下排列。

=== "v0.8"

    **属性：** `children`（`explicitList` 或 `template`）、`distribution`、`alignment`

    ```json
    {
      "id": "content",
      "component": {
        "Column": {
          "children": { "explicitList": ["header", "body", "footer"] },
          "distribution": "start",
          "alignment": "stretch"
        }
      }
    }
    ```

=== "v0.9"

    **属性：** `children`（数组或 template）、`justify`、`align`

    ```json
    {
      "id": "content",
      "component": "Column",
      "children": ["header", "body", "footer"],
      "justify": "start",
      "align": "stretch"
    }
    ```

### List

可滚动的项目列表。支持静态子元素和动态模板。

---

## 显示组件

### Text

显示带有样式提示的文本内容。

### Image

从 URL 显示图像。

### Icon

从目录中定义的基本集合中显示图标。

### Divider

可视分隔线。

---

## 交互式组件

### Button

可点击的按钮，触发操作。

### TextField

文本输入字段，带有可选的验证。

### CheckBox

布尔切换。

### Slider

数字范围输入。

### DateTimeInput

日期和/或时间选择器。

### MultipleChoice（v0.8）/ ChoicePicker（v0.9）

从列表中选择一个或多个选项。

---

## 容器组件

### Card

带有抬升/边框和内边距的容器。

### Modal

由入口点组件触发的覆盖对话框。

### Tabs

用于将内容组织到可切换面板中的标签页界面。

---

## 公共属性

所有组件共享：

- `id`（必需）：表面内的唯一标识符。
- `accessibility`：无障碍属性（标签、角色）。
- `weight`：在 Row 或 Column 内部时的 flex-grow 值。

## 版本差异摘要

组件名称和属性在版本间大致相同。结构差异包括：

| 方面             | v0.8                               | v0.9                             |
| ------------------ | ---------------------------------- | -------------------------------- |
| 组件包装          | `"component": { "Text": { ... } }` | `"component": "Text", ...props`  |
| 字符串值          | `{ "literalString": "你好" }`     | `"你好"`                        |
| 子元素            | `{ "explicitList": ["a", "b"] }`   | `["a", "b"]`                     |
| 数据绑定          | `{ "path": "/data" }`              | `{ "path": "/data" }`（相同）    |
| 文本/图像样式     | `usageHint`                        | `variant`                        |
| 按钮样式          | `primary: true`                    | `variant: "primary"`             |
| 操作格式          | `{ "name": "..." }`                | `{ "event": { "name": "..." } }` |
| 选择组件          | `MultipleChoice`                   | `ChoicePicker`                   |
| 布局对齐          | `distribution`、`alignment`        | `justify`、`align`               |
| TextField 值      | `text`                             | `value`                          |

## 实时示例

要查看所有组件的实际运行：

```bash
cd samples/client/angular
yarn start gallery
```

## 进一步阅读

- **[定义自己的目录](../guides/defining-your-own-catalog.md)**：构建你自己的组件
- **[主题化指南](../guides/theming.md)**：样式化组件以匹配你的品牌
