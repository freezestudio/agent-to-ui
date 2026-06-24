/**
 * A2UI v1.0 通用类型定义
 *
 * 根据规范 `common_types.json` 定义的协议基础类型。
 * 这些类型构成了所有 A2UI 消息和组件的基础数据类型系统。
 *
 * @packageDocumentation
 */

// ============================================================================
// 基础标识符类型
// ============================================================================

/**
 * 组件唯一标识符（ComponentId）
 *
 * 用于在 surface 内部唯一标识一个组件实例，
 * 在父容器的 children 引用中作为 ID 引用。
 */
export type ComponentId = string;

/**
 * 函数调用唯一标识符（CallId）
 *
 * 服务端发起的函数调用实例的唯一 ID。
 * 客户端在返回 functionResponse 时必须原样带回。
 */
export type CallId = string;

// ============================================================================
// 数据绑定系统（Data Binding）
// ============================================================================

/**
 * 数据绑定（DataBinding）
 *
 * 通过 JSON Pointer 路径引用数据模型中的值。
 * 例如: { "path": "/booking/date" } 引用 dataModel 中 booking.date 的值。
 *
 * @see https://tools.ietf.org/html/rfc6901 JSON Pointer 规范
 */
export interface DataBinding {
  /** JSON Pointer 路径，如 "/user/name" 或 "/booking/guests" */
  path: string;
}

// ============================================================================
// 函数调用系统（Function Calls）
// ============================================================================

/**
 * 函数调用（FunctionCall）
 *
 * 描述一次对客户端函数的调用。可以在以下场景使用：
 * - DynamicValue 代替字面量（动态计算值）
 * - CheckRule.condition（校验条件）
 * - Action.functionCall（本地函数执行）
 *
 * @example
 * ```json
 * { "call": "required", "args": { "value": "test" } }
 * { "call": "formatDate", "args": { "value": { "path": "/createdAt" }, "format": "yyyy-MM-dd" } }
 * ```
 */
export interface FunctionCall {
  /** 要调用的函数名称（如 "required"、"email"、"formatDate"） */
  call: string;
  /** 传递给函数的参数键值对 */
  args?: Record<string, unknown>;
}

// ============================================================================
// 动态值类型系统（Dynamic Values）
// ============================================================================

/**
 * 动态值（DynamicValue）
 *
 * 协议的通用值类型，可以是：
 * - 字面量（string / number / boolean / array）
 * - 数据绑定 { path: string }
 * - 函数调用 { call: string, args?: Record<string, unknown> }
 */
export type DynamicValue = string | number | boolean | unknown[] | DataBinding | FunctionCall;

/**
 * 动态字符串（DynamicString）
 *
 * 用于组件中值为字符串的属性。
 * 渲染器需要解析 DataBinding 和 FunctionCall 以获取最终值。
 */
export type DynamicString = string | DataBinding | FunctionCall;

/**
 * 动态数值（DynamicNumber）
 *
 * 用于组件中值为数值的属性（如 Slider.value）。
 */
export type DynamicNumber = number | DataBinding | FunctionCall;

/**
 * 动态布尔值（DynamicBoolean）
 *
 * 用于组件中值为布尔值的属性（如 CheckBox.value）。
 * 也用于 CheckRule.condition。
 */
export type DynamicBoolean = boolean | DataBinding | FunctionCall;

/**
 * 动态字符串数组（DynamicStringList）
 *
 * 用于组件中值为字符串数组的属性（如 ChoicePicker.value）。
 */
export type DynamicStringList = string[] | DataBinding | FunctionCall;

// ============================================================================
// 无障碍支持（Accessibility）
// ============================================================================

/**
 * 无障碍属性（AccessibilityAttributes）
 *
 * 增强组件对辅助技术（如屏幕阅读器）的可访问性。
 * 所有组件均可通过 ComponentCommon 添加此属性。
 */
export interface AccessibilityAttributes {
  /** 简短标签（1-3 个词），如"提交"、"用户 ID" */
  label?: DynamicString;
  /** 详细描述，如"静音此对话的通知" */
  description?: DynamicString;
}

// ============================================================================
// 组件公共属性（ComponentCommon）
// ============================================================================

/**
 * 组件公共基础属性（ComponentCommon）
 *
 * 所有 A2UI 组件的必选基础。每个组件必须至少包含 id，
 * 可选的 accessibility 用于无障碍支持。
 */
export interface ComponentCommon {
  /** 组件在当前 surface 内的唯一标识符 */
  id: ComponentId;
  /** 可选的 Web 无障碍属性 */
  accessibility?: AccessibilityAttributes;
}

// ============================================================================
// 子组件列表（ChildList）
// ============================================================================

/**
 * 子组件列表（ChildList）
 *
 * 容器组件（Row、Column、List）使用此类型定义子组件。
 * 两种模式：
 * - **静态列表**: ["id1", "id2", "id3"] — 固定子组件引用
 * - **动态模板**: { componentId: "item-template", path: "/items" } — 从数据模型生成
 *
 * @example
 * ```json
 * // 静态子组件
 * { "children": ["header", "body", "footer"] }
 *
 * // 动态模板列表
 * { "children": { "componentId": "item", "path": "/listItems" } }
 * ```
 */
export type ChildList =
  | ComponentId[]
  | {
      /** 模板组件的 ID（渲染器为列表中的每一项复制此组件） */
      componentId: ComponentId;
      /** 数据模型中数组数据的 JSON Pointer 路径 */
      path: string;
    };

// ============================================================================
// 校验规则系统（Validation / Checks）
// ============================================================================

/**
 * 校验规则（CheckRule）
 *
 * 定义一条客户端校验规则。组件（如 TextField、Button）通过
 * Checkable 接口继承此功能。condition 使用函数调用来判断
 * 输入是否合法，message 在不合法时显示错误提示。
 *
 * @example
 * ```json
 * {
 *   "condition": { "call": "required", "args": { "value": { "path": "/email" } } },
 *   "message": "邮箱不能为空"
 * }
 * ```
 */
export interface CheckRule {
  /** 校验条件（函数调用，返回 boolean） */
  condition: DynamicBoolean;
  /** 校验失败时的错误消息 */
  message: string;
}

/**
 * 可校验组件接口（Checkable）
 *
 * 支持客户端校验的组件（Button、TextField、CheckBox 等）继承此接口。
 * 通过 checks 数组定义多条校验规则。
 */
export interface Checkable {
  /** 校验规则列表 */
  checks?: CheckRule[];
}

// ============================================================================
// 交互处理器（Action）
// ============================================================================

/**
 * 事件触发（ActionEvent）
 *
 * 当用户与组件交互时，向服务器发送一个事件。
 * 通过 event.name 区分不同的操作类型。
 */
export interface ActionEvent {
  event: {
    /** 事件名称，服务器根据此名称路由到对应处理逻辑 */
    name: string;
    /** 可选的上下文数据（值可以是字面量、数据绑定或函数调用） */
    context?: Record<string, DynamicValue>;
    /** 如果为 true，客户端期望服务器返回 actionResponse */
    wantResponse?: boolean;
    /** 可选的 JSON Pointer 路径，响应值将保存到此位置 */
    responsePath?: string;
  };
}

/**
 * 本地函数调用（ActionFunctionCall）
 *
 * 不向服务器发送事件，而是直接调用客户端注册的本地函数。
 * 适用于 openUrl 等不需要服务器参与的操作。
 */
export interface ActionFunctionCall {
  /** 要调用的本地函数 */
  functionCall: FunctionCall;
}

/**
 * 交互处理器（Action）
 *
 * 定义组件交互时的行为。可以是：
 * - event: 向服务器发送事件
 * - functionCall: 调用客户端本地函数
 */
export type Action = ActionEvent | ActionFunctionCall;
