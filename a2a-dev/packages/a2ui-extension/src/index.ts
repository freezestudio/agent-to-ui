/**
 * @a2a-dev/a2ui-extension — A2UI A2A 扩展辅助工具
 *
 * 提供在 A2A 协议框架中使用 A2UI 的辅助工具：
 * - createA2UIExtension()：创建 AgentCard 扩展声明
 * - extractA2uiFromTask()：从 A2A Task 中提取 A2UI 消息
 * - A2UI_EXTENSION_URI/A2UI_MIME_TYPE：协议常量
 *
 * @packageDocumentation
 */

export { A2UI_EXTENSION_URI, A2UI_MIME_TYPE, createA2UIExtension } from "./extension.js";
export type { A2UIExtensionOptions } from "./extension.js";
export { extractA2uiFromTask } from "./extract.js";
export type { A2uiClientCapabilities } from "./types.js";
