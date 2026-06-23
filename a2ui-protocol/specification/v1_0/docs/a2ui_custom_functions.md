# 定义自定义函数

A2UI 函数在目录内定义。定义自己的目录时，你可以包含特定于你的应用或设计系统的自定义函数。

本指南演示如何在目录中定义字符串 `trim` 函数和硬件查询函数（`getScreenResolution`）。

## 1. 定义目录

创建一个 JSON Schema 文件（例如 `my_catalog.json`），定义你的函数参数。

使用 `functions` 属性定义函数模式映射。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/custom_catalog.json",
  "title": "自定义函数目录",
  "description": "扩展目录，添加字符串修剪和屏幕分辨率函数。",
  "functions": {
    "trim": {
      "type": "object",
      "description": "移除字符串开头和结尾的空白（或其他字符）。",
      "returnType": "string",
      "properties": {
        "call": {"const": "trim"},
        "args": {
          "type": "object",
          "properties": {
            "value": {
              "$ref": "common_types.json#/$defs/DynamicString",
              "description": "要修剪的字符串。"
            },
            "chars": {
              "$ref": "common_types.json#/$defs/DynamicString",
              "description": "可选。要移除的字符集。默认为空白。"
            }
          },
          "required": ["value"],
          "unevaluatedProperties": false
        }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    },
    "getScreenResolution": {
      "type": "object",
      "description": "查询硬件以获取屏幕分辨率。",
      "returnType": "array",
      "properties": {
        "call": {"const": "getScreenResolution"},
        "args": {
          "type": "object",
          "properties": {
            "screenIndex": {
              "$ref": "common_types.json#/$defs/DynamicNumber",
              "description": "可选。要查询的屏幕索引。默认为 0（主屏幕）。"
            }
          },
          "unevaluatedProperties": false
        }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    }
  }
}
```

## 2. 使函数可用

`FunctionCall` 定义引用[目录无关引用](a2ui_protocol.md#the-basic-catalog)。在你的目录中，你只需定义 `anyFunction` 引用：

```json
{
  "$defs": {
    "anyFunction": {
      "oneOf": [{"$ref": "#/functions/trim"}, {"$ref": "#/functions/getScreenResolution"}]
    }
  }
}
```

如果你想合并 [`catalogs/basic/catalog.json`] 中定义的函数，也可以添加：

```json
{
  "$defs": {
    "anyFunction": {
      "oneOf": [
        {"$ref": "#/functions/trim"},
        {"$ref": "#/functions/getScreenResolution"},
        {"$ref": "catalogs/basic/catalog.json#/$defs/anyFunction"}
      ]
    }
  }
}
```

## 验证工作原理

当 `FunctionCall` 被验证时：

1. **鉴别器查找：** 验证器查看对象的 `call` 属性。
2. **模式匹配：**
   - 如果 `call` 是 "length"，它匹配 `Functions` → `length` 并根据长度规则验证 `args` 中的命名参数。
   - 如果 `call` 是 "trim"，它匹配 `CustomFunctions` → `trim` 并根据你的自定义规则验证。
   - 如果 `call` 是 "unknownFunc"，验证立即失败（严格模式）。

这种严格默认的方法确保拼写错误被早期捕获，而模块化结构使添加具有完整类型安全性的新功能变得容易。
