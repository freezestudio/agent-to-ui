/**
 * @a2a-dev/a2ui-renderer — A2UI v1.0 框架无关渲染器核心
 *
 * 本包提供 A2UI 协议的客户端渲染引擎。
 * 包含消息解析、状态管理、数据绑定和函数调用系统。
 * 框架无关——任何 UI 框架（Angular/React/Vue）都可基于此包构建渲染器。
 *
 * @packageDocumentation
 */

// 事件系统
export { EventSource } from "./common/events.js";
export type { EventHandler } from "./common/events.js";

// 状态管理
export { DataModel } from "./state/data-model.js";
export type { DataModelChange } from "./state/data-model.js";
export { ComponentModel } from "./state/component-model.js";
export { SurfaceComponentsModel } from "./state/surface-components-model.js";
export { SurfaceModel } from "./state/surface-model.js";
export { SurfaceGroupModel } from "./state/surface-group-model.js";

// 处理引擎
export { MessageProcessor } from "./processing/message-processor.js";
export { FunctionInvoker } from "./processing/function-invoker.js";
export type { FunctionImpl } from "./processing/function-invoker.js";

// 目录类型
export type { ComponentApi, CatalogEntry } from "./catalog/types.js";
