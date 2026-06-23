/**
 * A2UI v1.0 消息类型定义
 *
 * 根据规范 `server_to_client.json` 和 `client_to_server.json` 定义。
 * 所有消息使用 version: "1.0" 作为版本标识。
 *
 * @packageDocumentation
 */

// ============================================================================
// 服务端→客户端 信封消息
// ============================================================================

/**
 * createSurface — 创建 UI 表面
 *
 * 在发送任何 updateComponents/updateDataModel 之前必须先创建表面。
 * surfaceId 在渲染器的整个生命周期内必须全局唯一。
 *
 * v1.0 新增：
 * - surfaceProperties：替代旧版 theme，灵活的表面属性
 * - components + dataModel：单消息 UI 实例化
 */
export interface CreateSurfaceMessage {
  /** 表面唯一标识符（全局唯一） */
  surfaceId: string;
  /** 目录标识符（推荐使用域名前缀，如 "https://example.com/catalogs/basic"） */
  catalogId: string;
  /** 表面属性（如 iconUrl、agentDisplayName），验证于 catalog 的 surfaceProperties schema */
  surfaceProperties?: Record<string, unknown>;
  /** 是否在每次 A2A 消息中同步完整数据模型给服务器 */
  sendDataModel?: boolean;
  /** 初始组件列表（v1.0 单消息 UI 实例化） */
  components?: ComponentDefinition[];
  /** 初始根数据模型（v1.0 单消息 UI 实例化） */
  dataModel?: Record<string, unknown>;
}

/**
 * 组件定义
 *
 * 消息中内联的组件描述。所有组件属性通过索引签名传递。
 */
export type ComponentDefinition = {
  /** 组件在 surface 内的唯一标识符 */
  id: string;
  /** 组件类型名（如 "Text"、"Button"），对应 catalog 中的组件定义 */
  component: string;
  /** 组件其余属性（取决于具体组件类型） */
  [key: string]: unknown;
};

/**
 * updateComponents — 更新 UI 组件
 *
 * 可以向已有 surface 多次发送此消息以增量更新组件树。
 * 组件列表中必须有一个 id 为 "root" 的组件作为组件树的根。
 */
export interface UpdateComponentsMessage {
  /** 要更新的表面 ID */
  surfaceId: string;
  /** 组件定义列表（至少一个组件） */
  components: ComponentDefinition[];
}

/**
 * updateDataModel — 更新数据模型
 *
 * 使用 JSON Pointer 路径更新数据模型中的特定值。
 * 可以多次发送以增量更新。
 */
export interface UpdateDataModelMessage {
  /** 要更新的表面 ID */
  surfaceId: string;
  /** JSON Pointer 路径（如 "/user/name"），省略或 "/" 表示根 */
  path?: string;
  /** 要设置的值。如果省略，表示删除路径上的键 */
  value?: unknown;
}

/**
 * deleteSurface — 删除 UI 表面
 *
 * 删除表面及其所有关联的组件和数据。
 */
export interface DeleteSurfaceMessage {
  /** 要删除的表面 ID */
  surfaceId: string;
}

/**
 * actionResponse — 服务端响应客户端 action（v1.0 新增）
 *
 * 当客户端的 action 设置了 wantResponse: true 时，
 * 服务端使用此消息返回处理结果。
 */
export interface ActionResponseMessage {
  /** 对应的客户端 action 的 actionId */
  actionId: string;
  /** 响应体（value 或 error，二选一） */
  actionResponse: {
    /** 成功返回值 */
    value?: unknown;
    /** 错误信息 */
    error?: { code: string; message: string };
  };
}

/**
 * callFunction — 服务端调用客户端函数（v1.0 新增）
 *
 * 服务端通过此消息调用客户端的注册函数。
 * 如果 wantResponse 为 true，客户端需要通过 functionResponse 返回结果。
 */
export interface CallFunctionMessage {
  /** 函数调用实例的唯一 ID */
  functionCallId: string;
  /** 是否期望客户端返回结果 */
  wantResponse?: boolean;
  /** 要调用的函数描述 */
  callFunction: {
    /** 函数名称 */
    call: string;
    /** 函数参数 */
    args?: Record<string, unknown>;
  };
}

/**
 * A2UI 消息信封（服务端→客户端）
 *
 * 每条消息恰好包含 version 字段和以下一个消息字段：
 * createSurface | updateComponents | updateDataModel | deleteSurface | actionResponse | callFunction
 */
export type A2uiMessage =
  | { version: string; createSurface: CreateSurfaceMessage }
  | { version: string; updateComponents: UpdateComponentsMessage }
  | { version: string; updateDataModel: UpdateDataModelMessage }
  | { version: string; deleteSurface: DeleteSurfaceMessage }
  | { version: string; actionResponse: ActionResponseMessage }
  | { version: string; callFunction: CallFunctionMessage };

// ============================================================================
// 客户端→服务端 消息
// ============================================================================

/**
 * 客户端 action（用户交互事件）
 *
 * 当用户与 UI 组件交互时，客户端向服务器发送此消息。
 * 包含事件名称、来源组件、时间戳和上下文数据。
 */
export interface A2uiClientAction {
  version: string;
  action: {
    /** 组件 action.event.name 的值 */
    name: string;
    /** 事件来源的表面 ID */
    surfaceId: string;
    /** 触发事件的组件 ID */
    sourceComponentId: string;
    /** ISO 8601 时间戳 */
    timestamp: string;
    /** 上下文数据（已解析数据绑定后的值） */
    context: Record<string, unknown>;
    /** 是否期望服务器返回 actionResponse */
    wantResponse?: boolean;
    /** 仅 wantResponse=true 时需要，用于匹配对应的 actionResponse */
    actionId?: string;
  };
}

/**
 * 客户端函数响应
 *
 * 响应服务端 callFunction 消息的结果。
 */
export interface A2uiClientFunctionResponse {
  version: string;
  functionResponse: {
    /** 原始的 functionCallId（原样返回） */
    functionCallId: string;
    /** 原始的函数名（原样返回，用于日志） */
    call: string;
    /** 函数的返回值 */
    value: unknown;
  };
}

/**
 * 客户端错误报告
 *
 * 报告客户端侧的验证失败或运行时错误。
 */
export interface A2uiClientError {
  version: string;
  error: {
    /** 错误代码（如 "VALIDATION_FAILED"） */
    code: string;
    /** 错误描述 */
    message: string;
    /** 出错的表面 ID */
    surfaceId?: string;
    /** JSON Pointer 指向出错的字段 */
    path?: string;
    /** 函数调用 ID（如果是函数调用失败） */
    functionCallId?: string;
  };
}

/** 客户端→服务端 消息联合类型 */
export type A2uiClientMessage = A2uiClientAction | A2uiClientFunctionResponse | A2uiClientError;
