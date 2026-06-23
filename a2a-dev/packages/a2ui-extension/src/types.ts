/**
 * A2UI 能力类型定义
 */

/** 客户端能力声明 */
export interface A2uiClientCapabilities {
  [version: string]: {
    supportedCatalogIds: string[];
    inlineCatalogs?: Array<{
      id: string;
      components: Record<string, unknown>;
    }>;
  };
}
