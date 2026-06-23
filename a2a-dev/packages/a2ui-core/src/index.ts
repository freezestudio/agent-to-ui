/**
 * @a2a-dev/a2ui-core — A2UI v1.0 协议核心类型与 Zod 模式
 *
 * 本包提供 A2UI v1.0 协议所需的全部 TypeScript 类型定义、
 * Zod v4 运行时验证模式，以及常量定义。
 *
 * @packageDocumentation
 */

// ============================================================================
// 协议版本
// ============================================================================
export { SPEC_VERSION } from "./schema/common-types.js";

// ============================================================================
// 通用类型（types）
// ============================================================================
export type {
  ComponentId, CallId,
  DataBinding, FunctionCall,
  DynamicValue, DynamicString, DynamicNumber, DynamicBoolean, DynamicStringList,
  AccessibilityAttributes,
  ComponentCommon,
  ChildList,
  CheckRule, Checkable,
  ActionEvent, ActionFunctionCall, Action,
} from "./types/common.js";

// ============================================================================
// 消息类型（types）
// ============================================================================
export type {
  CreateSurfaceMessage, UpdateComponentsMessage, UpdateDataModelMessage,
  DeleteSurfaceMessage, ActionResponseMessage, CallFunctionMessage,
  A2uiMessage, ComponentDefinition,
  A2uiClientAction, A2uiClientFunctionResponse, A2uiClientError, A2uiClientMessage,
} from "./types/messages.js";

// ============================================================================
// 组件类型（types）
// ============================================================================
export type {
  TextProps, ImageProps, IconProps, VideoProps, AudioPlayerProps,
  RowProps, ColumnProps, ListProps, CardProps, TabsProps, DividerProps, ModalProps,
  ButtonProps, TextFieldProps, CheckBoxProps, ChoicePickerProps, SliderProps, DateTimeInputProps,
  AnyComponentProps, ComponentName,
} from "./types/components.js";
export { COMPONENT_NAMES } from "./types/components.js";

// ============================================================================
// 目录类型（types）
// ============================================================================
export type { ComponentApi, Catalog, FunctionImpl } from "./types/catalog.js";

// ============================================================================
// Zod 模式（schema）
// ============================================================================
export {
  // 通用类型模式
  ComponentIdSchema, DataBindingSchema, FunctionCallSchema,
  DynamicStringSchema, DynamicNumberSchema, DynamicBooleanSchema, DynamicStringListSchema,
  ComponentCommonSchema, ChildListSchema, CheckRuleSchema,
  ActionEventSchema, ActionFunctionCallSchema, ActionSchema,
} from "./schema/common-types.js";

export {
  // 信封消息模式
  A2uiMessageSchema,
  CreateSurfaceSchema, UpdateComponentsSchema, UpdateDataModelSchema,
  DeleteSurfaceSchema, ActionResponseSchema, CallFunctionSchema,
} from "./schema/server-to-client.js";

export {
  // 客户端消息模式
  A2uiClientActionSchema, A2uiClientFunctionResponseSchema,
  A2uiClientErrorSchema, A2uiClientMessageSchema,
} from "./schema/client-to-server.js";

export {
  // 组件模式
  AnyComponentSchema,
  TextSchema, ImageSchema, IconSchema, VideoSchema, AudioPlayerSchema,
  RowSchema, ColumnSchema, ListSchema, CardSchema, TabsSchema, DividerSchema, ModalSchema,
  ButtonSchema, TextFieldSchema, CheckBoxSchema, ChoicePickerSchema, SliderSchema, DateTimeInputSchema,
} from "./schema/catalog/components.js";

export {
  // 函数模式
  AnyFunctionSchema,
  RequiredFnSchema, RegexFnSchema, LengthFnSchema, NumericFnSchema, EmailFnSchema,
  FormatStringFnSchema, FormatNumberFnSchema, FormatCurrencyFnSchema, FormatDateFnSchema,
  PluralizeFnSchema,
  OpenUrlFnSchema,
  AndFnSchema, OrFnSchema, NotFnSchema,
  IndexFnSchema,
} from "./schema/catalog/functions.js";
