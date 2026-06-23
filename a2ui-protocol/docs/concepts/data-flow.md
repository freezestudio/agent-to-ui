# 数据流

消息如何从代理流向 UI。

## 架构

```
代理 (LLM) → A2UI 生成器 → 传输层 (SSE/WS/A2A)
                                      ↓
客户端 (流读取器) → 消息解析器 → 渲染器 → 原生 UI
```

![端到端数据流](../assets/end-to-end-data-flow.png)

## 消息格式

A2UI 定义了一系列描述 UI 的 JSON 消息。在流式传输时，这些消息通常格式化为 **JSON Lines (JSONL)**，每行是一个完整的 JSON 对象。

=== "v0.8"

    ```jsonl
    {
      "surfaceUpdate": {
        "surfaceId": "main",
        "components": [...]
      }
    }
    {
      "dataModelUpdate": {
        "surfaceId": "main",
        "contents": [
          {
            "key": "user",
            "valueMap": [
              { "key": "name", "valueString": "Alice" }
            ]
          }
        ]
      }
    }
    {
      "beginRendering": {
        "surfaceId": "main",
        "root": "root-component"
      }
    }
    ```

=== "v0.9"

    ```jsonl
    {
      "version": "v0.9",
      "createSurface": {
        "surfaceId": "main",
        "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
      }
    }
    {
      "version": "v0.9",
      "updateComponents": {
        "surfaceId": "main",
        "components": [...]
      }
    }
    {
      "version": "v0.9",
      "updateDataModel": {
        "surfaceId": "main",
        "path": "/user",
        "value": { "name": "Alice" }
      }
    }
    ```

**为什么采用这种格式？**

一系列自包含的 JSON 对象对流式传输友好，LLM 易于增量生成，并且具有容错性。

## 生命周期示例：餐厅预订

**用户：**"预订明天晚上7点，两位"

=== "v0.8"

    **1. 代理定义 UI 结构：**

    ```json
    {
      "surfaceUpdate": {
        "surfaceId": "booking",
        "components": [
          {
            "id": "root",
            "component": {
              "Column": {
                "children": {
                  "explicitList": ["header", "guests-field", "submit-btn"]
                }
              }
            }
          },
          {
            "id": "header",
            "component": {
              "Text": {
                "text": { "literalString": "确认预订" },
                "usageHint": "h1"
              }
            }
          },
          {
            "id": "guests-field",
            "component": {
              "TextField": {
                "label": { "literalString": "用餐人数" },
                "text": { "path": "/reservation/guests" }
              }
            }
          },
          {
            "id": "submit-btn",
            "component": {
              "Button": {
                "child": "submit-text",
                "action": {
                  "name": "confirm",
                  "context": [
                    { "key": "details", "value": { "path": "/reservation" } }
                  ]
                }
              }
            }
          }
        ]
      }
    }
    ```

    **2. 代理填充数据：**

    ```json
    {
      "dataModelUpdate": {
        "surfaceId": "booking",
        "path": "/reservation",
        "contents": [
          { "key": "datetime", "valueString": "2025-12-16T19:00:00Z" },
          { "key": "guests", "valueString": "2" }
        ]
      }
    }
    ```

    **3. 代理指示渲染：**

    ```json
    {
      "beginRendering": {
        "surfaceId": "booking",
        "root": "root"
      }
    }
    ```

    **4. 用户将人数改为"3"** → 客户端自动更新 `/reservation/guests`

    **5. 用户点击"确认"** → 客户端发送操作：

    ```json
    {
      "userAction": {
        "name": "confirm",
        "surfaceId": "booking",
        "context": {
          "details": {
            "datetime": "2025-12-16T19:00:00Z",
            "guests": "3"
          }
        }
      }
    }
    ```

    **6. 代理响应** → 更新 UI 或发送：

    ```json
    { "deleteSurface": { "surfaceId": "booking" } }
    ```

=== "v0.9"

    **1. 代理创建表面：**

    ```json
    {
      "version": "v0.9",
      "createSurface": {
        "surfaceId": "booking",
        "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
      }
    }
    ```

    **2. 代理定义 UI 结构：**

    ```json
    {
      "version": "v0.9",
      "updateComponents": {
        "surfaceId": "booking",
        "components": [
          {
            "id": "root",
            "component": "Column",
            "children": ["header", "guests-field", "submit-btn"]
          },
          {
            "id": "header",
            "component": "Text",
            "text": "确认预订",
            "variant": "h1"
          },
          {
            "id": "guests-field",
            "component": "TextField",
            "label": "用餐人数",
            "value": { "path": "/reservation/guests" }
          },
          {
            "id": "submit-btn",
            "component": "Button",
            "child": "submit-text",
            "variant": "primary",
            "action": {
              "event": {
                "name": "confirm",
                "context": {
                  "details": { "path": "/reservation" }
                }
              }
            }
          }
        ]
      }
    }
    ```

    **3. 代理填充数据：**

    ```json
    {
      "version": "v0.9",
      "updateDataModel": {
        "surfaceId": "booking",
        "path": "/reservation",
        "value": {
          "datetime": "2025-12-16T19:00:00Z",
          "guests": "2"
        }
      }
    }
    ```

    **4. 用户将人数改为"3"** → 客户端自动更新 `/reservation/guests`

    **5. 用户点击"确认"** → 客户端发送操作：

    ```json
    {
      "version": "v0.9",
      "action": {
        "name": "confirm",
        "surfaceId": "booking",
        "context": {
          "details": {
            "datetime": "2025-12-16T19:00:00Z",
            "guests": "3"
          }
        }
      }
    }
    ```

    **6. 代理响应** → 更新 UI 或发送：

    ```json
    {
      "version": "v0.9",
      "deleteSurface": { "surfaceId": "booking" }
    }
    ```

## 传输选项

A2UI 与传输层无关——任何能够传递 JSON 消息的机制都可以：

- **[A2A 协议](https://a2a-protocol.org/)**：标准化的代理间通信，也可用于代理到 UI 的交付
- **[AG-UI](https://ag-ui.com/)**：双向、实时代理-UI 协议
- **REST / HTTP**：简单的请求-响应或服务器推送事件（SSE）用于单向流式传输
- **WebSocket**：持久的双向连接，适合实时更新和用户操作
- **任何其他传输**：gRPC、消息队列、自定义协议——只要能承载 JSON 即可

参见[传输层](transports.md)了解实现细节。

## 渐进式渲染

代理可以边生成响应边将内容分块流式传输到客户端，而不是等待整个响应生成完成后再显示给用户。

用户可以看到 UI 实时构建，而不是盯着一旋转加载图标。

## 错误处理

系统的错误处理方式如下：

- **格式错误的消息**：跳过并继续，或将错误发送回代理进行修正。
- **网络中断**：显示错误状态，重新连接，代理重新发送或恢复。

## 性能优化

- **批处理**：将更新缓冲 16ms，然后批量渲染。
- **差异比较**：比较新旧组件，只更新更改的属性。
- **粒度更新**：更新 `/user/name` 而非整个 `/` 模型。
