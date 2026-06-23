/**
 * A2UI v1.0 目录类型定义
 *
 * 目录（Catalog）是组件和函数的集合。
 * 每个 surface 在创建时指定 catalogId，渲染器根据 catalogId
 * 查找对应的目录定义来解析组件和函数。
 *
 * @packageDocumentation
 */

/**
 * 组件 API 描述
 *
 * 描述一个组件在目录中的定义。
 */
export interface ComponentApi {
  /** 组件类型名称（如 "Text"、"Button"） */
  name: string;
  /** 组件属性的 JSON Schema 描述 */
  properties: Record<string, unknown>;
}

/**
 * 目录定义
 *
 * 包含组件注册表和元数据。
 */
export interface Catalog {
  /** 目录唯一标识符 */
  id: string;
  /** 组件注册表（组件名 → ComponentApi） */
  components: Map<string, ComponentApi>;
}

/**
 * 函数实现类型
 *
 * 接受参数对象，返回计算结果。
 * 可以是同步或异步。
 */
export type FunctionImpl = (args: Record<string, unknown>) => unknown | Promise<unknown>;
