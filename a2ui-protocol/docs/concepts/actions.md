# 处理用户操作

本指南解释 A2UI 如何处理用户交互。组件使用 `action` 属性触发本地**函数**（在渲染器上执行）或**事件**（发送到代理）。此外，**数据模型同步**确保代理始终可以访问完整的 UI 状态，实现无缝的多模态交互（如语音命令）。这种设计在保持安全、受限制环境的同时，实现了高度响应的界面。

## 操作架构

操作允许 UI 组件触发在 `common_types.json` 的 [`Action`](../../specification/v0_9/json/common_types.json#L271-L313) 模式中定义的行为。操作可以触发：

1.  **事件**：发送到代理处理（在代理上执行，如点击"提交"）。
2.  **函数**：完全在渲染器上执行，使用 [`FunctionCall`](../../specification/v0_9/json/common_types.json#L200-L242)（在渲染器上执行，如打开 URL）。

### 1. 函数（本地）

函数在渲染器上立即执行，无需网络往返。代理不会被告知本地函数调用。它们使用 `functionCall` 关键字。

```json
{
  "id": "help-btn",
  "component": "Button",
  "child": "help-text",
  "action": {
    "functionCall": {
      "call": "openUrl",
      "args": {"url": "https://a2ui.org/help"}
    }
  }
}
```

函数的常见用途包括：

- **导航**：打开 URL 或切换标签页。
- **验证**：在提交前检查输入（参见下面的验证）。

### 2. 事件（代理）

事件将数据发送到代理进行处理。它们使用 `event` 关键字。

像 `Button` 这样的组件暴露了 `action` 属性。以下是事件的配置方式：

```json
{
  "id": "submit-btn",
  "component": "Button",
  "child": "btn-text",
  "action": {
    "event": {
      "name": "submit_reservation",
      "context": {
        "time": {"path": "/reservationTime"},
        "size": {"path": "/partySize"}
      }
    }
  }
}
```

- **`name`**：代理用于分支判断的稳定标识符。
- **`context`**：键值对的映射。值可以是字面值，也可以使用 `path` 从数据模型的当前状态中提取。

> **注意：上下文与数据模型**：虽然数据模型代表表面的整个状态树，但操作中的 context 实际上是精心挑选的**"视图"**或该状态的子集。这简化了代理的工作，只提供特定事件所需的值，而不需要代理导航可能庞大复杂的数据模型。

### 基本目录函数验证

基本目录定义了一组有限的可以在渲染器上执行的检查。交互式组件可以定义一个 `checks` 列表（使用 `common_types.json` 中的 [`Checkable`](../../specification/v0_9/json/common_types.json#L258-L270) 模式）。对于 `Button`，如果任何检查失败，按钮将在渲染器上**自动禁用**。

- **用户体验焦点**：验证检查旨在管理 **UI 状态（用户体验）**，在无效交互发生之前阻止它们。它们不能替代**数据完整性**检查，后者仍需在代理上执行。

这使得 UI 可以在用户尝试提交之前强制执行要求（如字段不能为空）。

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "checks": [
    {
      "condition": {
        "call": "required",
        "args": {"value": {"path": "/partySize"}}
      },
      "message": "请填写用餐人数"
    }
  ],
  "action": {"event": {"name": "submit_booking"}}
}
```

## 本地状态更新与"写入"契约

在事件被分发之前，渲染器已经在本地管理 UI 的状态。A2UI 为所有输入组件（如 `TextField`、`CheckBox` 或 `Slider`）定义了**读/写契约**。

1.  **读取（模型 → 视图）**：组件渲染时，从数据模型中绑定的 `path` 读取其值。
2.  **写入（视图 → 模型）**：用户一交互（如输入字符或点击复选框），渲染器**立即**将新值写入本地数据模型。

这意味着本地模型始终是 UI 当前状态的**唯一真实来源**。这种"视图到模型"的同步完全发生在渲染器上。数据模型仅在事件发生时（如按钮点击）才发送给代理。

> **重要提示：同步更新**：本地模型更新是**同步的**。这保证了在事件解析其 `context` 路径或打包 `DataModelSync` 负载之前，数据模型已经完全更新。输入和点击之间没有竞态条件；"写入"总是先提交。

这种本地优先的方法带来了显著的**性能优势**。由于同步是即时且本地的，开发者不需要实现网络去抖动或担心用户在 `TextField` 中输入时的延迟抖动。网络完全免受"UI 噪音"（如单个按键）的影响，直到用户准备分发正式的事件。

### 表单提交模式

这种分离实现了健壮的表单提交模式：

- **绑定**：`TextField` 绑定到 `/reservationTime`。
- **交互**：用户输入"7:00 PM"。本地模型中 `/reservationTime` 处的值立即更新。
- **提交**：用户点击"预订"按钮。按钮的事件从本地模型解析 `path: "/reservationTime"` 并将当前值发送给代理。

## 用户交互流程

当用户与组件交互时（例如，点击按钮）：

1.  **解析**：渲染器将 `context` 中的所有 `path` 引用解析到本地**数据模型**。
2.  **构建**：渲染器构建一个符合 [`client_to_server.json`](../../specification/v0_9/json/client_to_server.json) 的 `action` 负载。
3.  **分发**：负载通过选定的传输层（如 A2A、WebSocket）发送。

### 示例：操作负载（v0.9）

如果用户点击上述按钮，数据模型包含 `{"reservationTime": "7:00 PM", "partySize": 4}`，渲染器发送使用 `action` 键的消息：

```json
{
  "version": "v0.9",
  "action": {
    "name": "submit_reservation",
    "surfaceId": "booking-surface",
    "sourceComponentId": "submit-btn",
    "timestamp": "2026-02-25T10:40:00Z",
    "context": {
      "time": "7:00 PM",
      "size": 4
    }
  }
}
```

> **关于版本控制的说明（v0.8 vs v0.9）**：在 v0.8 中，顶层负载键是 `userAction`（例如 `{"userAction": {...}}`）。v0.9 转向了上面所示的更简单的 `action` 键。标准协议解析器期望的键与负载中声明的版本相对应。

## 代理处理

代理（或编排器）接收此事件并对其做出响应。在代理系统中，代理通常将事件转换为 LLM 的隐藏用户查询。

**示例代理处理（Python）：**

```python
if action_name == "submit_reservation":
    time = context.get("time")
    size = context.get("size")
    # 将其提供给 LLM
    query = f"用户提交了 {size} 人在 {time} 的预订。"
    response = await llm.generate(query)
```

## 渲染器到代理的错误报告

除了用户触发的事件外，渲染器还可以使用 [`client_to_server.json`](../../specification/v0_9/json/client_to_server.json) 中定义的 `error` 负载向代理报告系统级错误。

### 验证失败

如果代理发送的 A2UI JSON 违反了目录模式或协议规则，渲染器会发送 `VALIDATION_FAILED` 错误。这是代理系统的关键反馈循环：

```json
{
  "version": "v0.9",
  "error": {
    "code": "VALIDATION_FAILED",
    "surfaceId": "booking-surface",
    "path": "/components/0/children",
    "message": "期望字符串数组，得到 null。"
  }
}
```

代理可以捕获此错误，道歉（或在内部自我修正），并重新发送修正后的 UI。

## 数据模型同步（v0.9）

A2UI v0.9 引入了一个强大的"无状态"同步功能。这允许渲染器在发送给代理的每条消息的元数据中自动包含表面的**整个数据模型**。

### 启用同步

同步由代理在表面初始化时请求。通过在 `createSurface` 消息中设置 `sendDataModel: true`，代理指示渲染器启动同步循环。

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "booking-surface",
    "catalogId": "https://a2ui.org/catalogs/v1/basic.json",
    "sendDataModel": true
  }
}
```

### 同步在传输中

启用同步后，渲染器不将数据模型作为单独的消息发送。而是将其作为**元数据**附加到外发的传输信封（如 A2A 消息）中。

在 A2A（代理到代理）绑定中，数据模型被放置在信封的 `metadata` 字段内的 `a2uiClientDataModel` 对象中。

**包含同步的 A2A 信封示例：**

```json
{
  "parts": [{"text": "提交预订"}],
  "metadata": {
    "a2uiClientDataModel": {
      "version": "v0.9",
      "surfaces": {
        "booking-surface": {
          "reservationTime": "7:00 PM",
          "partySize": 4,
          "notes": "偏好靠窗座位"
        }
      }
    }
  }
}
```

### 为什么要使用数据模型同步？

- **简化连接**：无需手动将每个输入字段映射到按钮的 `context` 属性。代理只需检查元数据即可查看所有字段的当前状态。
- **无状态代理**：代理无需为每个用户会话维护本地状态；每次交互都接收完整的当前上下文。
- **口头快捷方式**：允许用户通过语音或文本触发事件（如"好的，提交"），即使不点击特定按钮。由于代理在收到文本消息的同时也接收到了更新的数据模型，它可以立即处理请求。

## 渲染器元数据和能力

在代理可以安全地发送 UI 之前，渲染器必须声明它支持哪些组件目录。这通过 `a2uiClientCapabilities` 对象处理。

### 声明能力

渲染器在发送给代理的消息的**元数据**中包含一个 `a2uiClientCapabilities` 对象（例如，在 A2A `Message` 的 `metadata` 字段中）。

```json
{
  "v0.9": {
    "supportedCatalogIds": [
      "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
      "https://my-company.com/catalogs/v1/custom.json"
    ],
    "inlineCatalogs": []
  }
}
```

- **`supportedCatalogIds`**：渲染器可以渲染的目录 URI 数组。
- **`inlineCatalogs`**：（可选）用于开发或专用环境，允许内联发送完整的目录模式。

没有这个握手过程，代理无法确定渲染器能够处理发送的特定组件。

## 传输和编码

A2UI 与传输层无关，但最常用的是通过 **A2A（代理到代理）** 或 WebSocket。理解负载如何包装对于实现至关重要。

### A2A 编码

在标准的 A2A 绑定中，A2UI 消息被编码为 A2A **DataPart**。为了将其标识为 A2UI 负载，part 必须有特定的元数据包装：

- **mimeType**：`application/a2ui+json`

`DataPart` 的 `data` 字段包含 A2UI 消息的**列表**。这允许在单个网络数据包中发送多个更新（例如，`createSurface` 后跟 `updateComponents`）。

> **A2A 版本说明**：`data` 字段中使用**列表**是在 **A2A v1.0** 中引入的。早期版本的 A2A 协议期望 `data` 字段包含单个 JSON 对象。

```json
{
  "kind": "data",
  "metadata": {
    "mimeType": "application/a2ui+json"
  },
  "data": [
    {
      "version": "v0.9",
      "action": { ... }
    }
  ]
}
```

## 安全考虑

A2UI 的设计核心原则是安全的沙箱通信。由于协议依赖通过网络传递用户状态和交互触发器，它在数据可见性和执行方面强制实行严格的边界。

### 沙箱执行

A2UI 的核心卖点是通过限制来保障安全。通过禁止代理执行任意代码（如注入原始 JavaScript），A2UI 确保代理只能触发预先注册的行为。`functionCall` 机制充当了一种安全的沙箱方式，让代理与渲染器环境交互，而不会将用户暴露于恶意脚本。

### 数据模型隔离和编排器路由

当启用 `sendDataModel: true` 时，渲染器会将表面的整个数据模型包含在传出消息中。开发者必须理解此数据的可见性：

- **点对点可见性**：只有接收传输信封的后端（创建该表面的代理或中间编排器）可以读取此负载。
- **编排器的责任**：在多代理架构中，中央编排器通常将用户意图路由到专门的子代理。编排器必须强制**数据隔离**。它负责解析 `a2uiClientDataModel`，识别 `surfaceId`，并确保数据模型仅传递给拥有该表面的特定子代理。一个代理表面的数据绝不能泄露到另一个代理。

## 编排和路由

在多代理系统中，中央**编排器**通常管理用户和多个专门子代理之间的交互。一个关键挑战是确保来自渲染器的 `action` 消息路由回生成 UI 表面的特定子代理。

### 表面所有权模式

为了处理这个问题，编排器必须维护 `surfaceId` 到其所属子代理的映射。这通常存储在**会话状态**中。

#### 1. 映射所有权

当子代理发出 `createSurface` 消息时，编排器拦截它并记录所有权。

```python
# 简化的编排器逻辑：记录所有权
def on_surface_created(surface_id, agent_name, session):
    # 将映射存储在编排器的会话状态中
    session.state.update({f"owner_of_{surface_id}": agent_name})
```

#### 2. 路由事件

当渲染器将 `action` 发送回编排器时，编排器查找 `surfaceId` 并将请求转移到正确的子代理。

```python
# 简化的编排器逻辑：路由事件
async def handle_incoming_action(payload, session):
    action = payload.get("action")
    surface_id = action.get("surfaceId")

    # 查找拥有该表面的代理
    target_agent = session.state.get(f"owner_of_{surface_id}")

    if target_agent:
        # 以编程方式将请求路由到子代理
        return transfer_to(target_agent)
```

这种模式确保即使在复杂的多代理环境中，每个功能区域的双向通信循环也能保持完整和有状态。

### 通过元数据剥离防止数据泄露

在多代理环境中，`a2uiClientDataModel` 可能包含由不同代理拥有的多个表面的状态。为防止敏感数据泄露，编排器必须**剥离**数据模型元数据，只包含由正在调用的特定子代理拥有的表面。

这最好在出站元数据拦截器中实现：

```python
# 简化的编排器拦截器：剥离数据模型
async def intercept(self, request_payload, target_agent, session):
    message = request_payload["params"]["message"]
    data_model = message.get("metadata", {}).get("a2uiClientDataModel")

    if data_model:
        # 过滤表面，只保留目标代理拥有的表面
        filtered_surfaces = {
            surface_id: state for surface_id, state in data_model["surfaces"].items()
            if session.state.get(f"owner_of_{surface_id}") == target_agent.name
        }

        # 用剥离后的数据模型替换
        message["metadata"]["a2uiClientDataModel"]["surfaces"] = filtered_surfaces

    return request_payload
```

通过剥离元数据，编排器确保子代理只收到它们有权查看的数据模型部分。

> **安全风险：状态抓取**：如果编排器未能剥离 `a2uiClientDataModel`，恶意或受损的子代理可能"抓取"其他活动表面的状态。例如，如果编排器泄露了整个多表面数据模型，天气子代理可能读取银行表面的敏感数据。在多代理系统中，剥离是强制性的安全要求。

---

## 综合示例

### 1. 按钮提交（显式上下文）

此示例显示了一个显式收集需要发送的数据的按钮。

**组件定义：**

```json
{
  "id": "submit-button",
  "component": "Button",
  "child": "submit-text",
  "action": {
    "event": {
      "name": "submit_booking",
      "context": {
        "partySize": {"path": "/partySize"},
        "reservationTime": {"path": "/reservationTime"}
      }
    }
  }
}
```

**生成的操作负载：**
代理接收一个 `action` 对象，其中 `partySize` 和 `reservationTime` 直接位于 `context` 字段中。

### 2. 口头提交（数据模型同步）

在此场景中，用户不点击按钮。而是说"好的，提交表单。"

**初始化：**
代理创建了带有 `sendDataModel: true` 的表面：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "booking-surface",
    "catalogId": "...",
    "sendDataModel": true
  }
}
```

**渲染器传输：**
渲染器发送一条包含用户文本和数据模型的 A2A 消息，数据模型放在元数据中：

```json
{
  "parts": [{"text": "好的，提交表单"}],
  "metadata": {
    "a2uiClientDataModel": {
      "version": "v0.9",
      "surfaces": {
        "booking-surface": {
          "partySize": 4,
          "reservationTime": "7:00 PM"
        }
      }
    }
  }
}
```

**代理处理：**
代理看到用户的意图（"提交"）并查看 `metadata` 中的 `partySize` 和 `reservationTime` 的当前值，从而无需进一步澄清即可完成任务。
