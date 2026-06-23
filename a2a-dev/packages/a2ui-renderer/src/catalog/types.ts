/**
 * A2UI 目录类型定义
 *
 * 目录（Catalog）定义了 surface 可用的组件类型和函数。
 * 渲染器通过目录名查找对应的框架特定组件实现。
 *
 * @packageDocumentation
 */

/**
 * 组件 API 描述
 */
export interface ComponentApi {
  /** 组件类型名称（如 "Text"、"Button"） */
  name: string;
}

/**
 * 目录入口
 */
export interface CatalogEntry {
  /** 目录唯一标识符 */
  id: string;
  /** 组件注册表 */
  components: Map<string, ComponentApi>;
}
