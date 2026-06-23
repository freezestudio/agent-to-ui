# 数据绑定

数据绑定使用 JSON Pointer 路径（[RFC 6901](https://tools.ietf.org/html/rfc6901)）将 UI 组件连接到应用状态。它使 A2UI 能够高效地为大量数据定义布局，并在不从头重新生成的情况下显示更新后的内容。

## 结构与状态

A2UI 分离以下两层：

1. **UI 结构**（组件）：界面看起来是什么样
2. **应用状态**（数据模型）：它显示什么数据

这实现了：

- 响应式更新。
- 数据驱动的 UI。
- 可重用模板。
- 双向绑定。

## 数据模型

每个表面都有一个保存状态的 JSON 对象：

```json
{
  "user": {"name": "Alice", "email": "alice@example.com"},
  "cart": {
    "items": [{"name": "小部件", "price": 9.99, "quantity": 2}],
    "total": 19.98
  }
}
```

## JSON Pointer 路径

**语法：**

- `/user/name` - 对象属性
- `/cart/items/0` - 数组索引（从零开始）
- `/cart/items/0/price` - 嵌套路径

**示例：**

```json
{"user": {"name": "Alice"}, "items": ["苹果", "香蕉"]}
```

- `/user/name` → `"Alice"`
- `/items/0` → `"苹果"`

## 字面值与路径值

=== "v0.8"

    **字面值（固定）：**
    ```json
    {
      "id": "title",
      "component": {
        "Text": {
          "text": { "literalString": "欢迎" }
        }
      }
    }
    ```

    **数据绑定（响应式）：**
    ```json
    {
      "id": "username",
      "component": {
        "Text": {
          "text": { "path": "/user/name" }
        }
      }
    }
    ```

=== "v0.9 及更高版本"

    **字面值（固定）：**
    ```json
    {
      "id": "title",
      "component": "Text",
      "text": "欢迎"
    }
    ```

    **数据绑定（响应式）：**
    ```json
    {
      "id": "username",
      "component": "Text",
      "text": { "path": "/user/name" }
    }
    ```

当 `/user/name` 从 "Alice" 变为 "Bob" 时，文本**自动更新**为 "Bob"。

## 响应式更新

绑定到数据路径的组件在数据更改时自动更新：

=== "v0.8"

    ```json
    {
      "id": "status",
      "component": {
        "Text": {
          "text": {"path": "/order/status"}
        }
      }
    }
    ```

=== "v0.9 及更高版本"

    ```json
    {
      "id": "status",
      "component": "Text",
      "text": {"path": "/order/status"}
    }
    ```

- **初始：** `/order/status` = "处理中..." → 显示 "处理中..."
- **更新：** 发送数据模型更新，`status: "已发货"` → 显示 "已发货"

无需更新组件——只需更新数据。

## 动态列表

使用模板渲染数组：

=== "v0.8"

    ```json
    {
      "id": "product-list",
      "component": {
        "Column": {
          "children": {
            "template": {
              "dataBinding": "/products",
              "componentId": "product-card"
            }
          }
        }
      }
    }
    ```

=== "v0.9 及更高版本"

    ```json
    {
      "id": "product-list",
      "component": "Column",
      "children": {
        "path": "/products",
        "componentId": "product-card"
      }
    }
    ```

**数据：**

```json
{
  "products": [
    {"name": "小部件", "price": 9.99},
    {"name": "小工具", "price": 19.99}
  ]
}
```

**结果：** 渲染两个卡片，每个产品一个。

### 作用域路径

在模板内部，路径被限定到数组项：

=== "v0.8"

    ```json
    {
      "id": "product-name",
      "component": {
        "Text": {
          "text": {"path": "/name"}
        }
      }
    }
    ```

    - 对于 `/products/0`，`/name` 解析为 `/products/0/name` → "小部件"
    - 对于 `/products/1`，`/name` 解析为 `/products/1/name` → "小工具"

=== "v0.9 及更高版本"

    ```json
    {
      "id": "product-name",
      "component": "Text",
      "text": {"path": "name"}
    }
    ```

    - 对于 `/products/0`，`name` 解析为 `/products/0/name` → "小部件"
    - 对于 `/products/1`，`name` 解析为 `/products/1/name` → "小工具"

添加/移除项目会自动更新渲染的组件。

## 输入绑定

交互式组件双向更新数据模型：

=== "v0.8"

    | 组件               | 示例                                           | 用户操作        | 数据更新                       |
    | ----------------- | ---------------------------------------------- | -------------- | ------------------------------ |
    | **TextField**     | `{"text": {"path": "/form/name"}}`             | 输入"Alice"    | `/form/name` = `"Alice"`       |
    | **CheckBox**      | `{"value": {"path": "/form/agreed"}}`          | 勾选复选框     | `/form/agreed` = `true`        |
    | **MultipleChoice**| `{"selections": {"path": "/form/country"}}`    | 选择"加拿大"   | `/form/country` = `["ca"]`     |

=== "v0.9 及更高版本"

    | 组件              | 示例                                           | 用户操作        | 数据更新                       |
    | ----------------- | ---------------------------------------------- | -------------- | ------------------------------ |
    | **TextField**     | `{"value": {"path": "/form/name"}}`            | 输入"Alice"    | `/form/name` = `"Alice"`       |
    | **CheckBox**      | `{"value": {"path": "/form/agreed"}}`          | 勾选复选框     | `/form/agreed` = `true`        |
    | **ChoicePicker**  | `{"value": {"path": "/form/country"}}`         | 选择"加拿大"   | `/form/country` = `["ca"]`     |

## 最佳实践

- **使用粒度更新**：只更新更改的路径。

=== "v0.8"

    ```json
    {
      "dataModelUpdate": {
        "path": "/user",
        "contents": [{"key": "name", "valueString": "Alice"}]
      }
    }
    ```

=== "v0.9 及更高版本"

    ```json
    {
      "version": "v0.9.1",
      "updateDataModel": {
        "surfaceId": "user_profile",
        "path": "/user/name",
        "value": "Alice"
      }
    }
    ```

- **按领域组织**：分组相关数据。

    ```json
    {"user": {...}, "cart": {...}, "ui": {...}}
    ```

- **预先计算显示值**：在发送前在代理端格式化数据（货币、日期）。

    ```json
    {"price": "$19.99"} // 而不是: {"price": 19.99}
    ```
