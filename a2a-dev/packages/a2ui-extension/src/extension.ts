/**
 * A2UI A2A 扩展声明工具
 *
 * 提供创建 A2UI 扩展声明的工厂函数和常量。
 * 扩展 URI 遵循 A2UI 规范：https://a2ui.org/a2a-extension/a2ui/v1.0
 *
 * @packageDocumentation
 */

import type { AgentExtension } from "@a2a-dev/core";

/** A2UI 扩展的规范 URI */
export const A2UI_EXTENSION_URI = "https://a2ui.org/a2a-extension/a2ui/v1.0";

/** A2UI 数据的 MIME 类型 */
export const A2UI_MIME_TYPE = "application/a2ui+json";

/**
 * A2UI 扩展创建选项
 */
export interface A2UIExtensionOptions {
  /** 支持的目录 ID 列表 */
  supportedCatalogs?: string[];
}

/**
 * 创建 A2UI 扩展声明
 *
 * 用于 AgentCard 的 capabilities.extensions 列表中。
 * 声明智能体支持 A2UI 协议。
 *
 * @param options 扩展选项
 * @returns AgentExtension 对象
 *
 * @example
 * ```ts
 * import { createA2UIExtension } from "@a2a-dev/a2ui-extension";
 *
 * const agentCard: AgentCard = {
 *   capabilities: {
 *     extensions: [createA2UIExtension()],
 *   },
 * };
 * ```
 */
export function createA2UIExtension(options?: A2UIExtensionOptions): AgentExtension {
  return {
    uri: A2UI_EXTENSION_URI,
    description: "A2UI 协议 v1.0 — 代理驱动的声明式 UI（Agent to User Interface）",
    required: false,
    params: {
      supportedCatalogs: options?.supportedCatalogs ?? [
        "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
      ],
    },
  };
}
