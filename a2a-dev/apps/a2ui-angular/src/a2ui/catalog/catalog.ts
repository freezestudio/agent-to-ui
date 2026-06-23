/**
 * A2UI Angular 目录服务
 *
 * 管理组件名到 Angular 组件的映射。
 * 组件通过 app.config.ts 中的 APP_INITIALIZER 注册，
 * 避免 CatalogService 直接导入组件类造成的循环依赖。
 *
 * @packageDocumentation
 */

import { Injectable, Type } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CatalogService {
  /** 组件名 → Angular 组件类型映射 */
  private registry = new Map<string, Type<unknown>>();

  /**
   * 注册组件
   * @param name 组件类型名
   * @param component Angular 组件类
   */
  register(name: string, component: Type<unknown>): void {
    this.registry.set(name, component);
  }

  /**
   * 根据组件名获取 Angular 组件
   * @param name 组件类型名
   * @returns Angular 组件类型，未注册返回 undefined
   */
  get(name: string): Type<unknown> | undefined {
    return this.registry.get(name);
  }
}
