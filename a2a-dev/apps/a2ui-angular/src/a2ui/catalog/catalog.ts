/**
 * A2UI Angular 目录服务
 *
 * 管理组件名到 Angular 组件的映射。
 * 渲染时通过组件名查找对应的 Angular 实现。
 *
 * @packageDocumentation
 */

import { Injectable, Type } from "@angular/core";
import { TextComponent } from "./components/text.component.js";
import { ButtonComponent } from "./components/button.component.js";
import { RowComponent } from "./components/row.component.js";
import { ColumnComponent } from "./components/column.component.js";
import { ImageComponent } from "./components/image.component.js";
// 其余组件在后续增量添加

@Injectable({ providedIn: "root" })
export class CatalogService {
  /** 组件名 → Angular 组件类型映射 */
  private registry = new Map<string, Type<unknown>>();

  constructor() {
    // 注册基本目录组件
    this.register("Text", TextComponent);
    this.register("Button", ButtonComponent);
    this.register("Row", RowComponent);
    this.register("Column", ColumnComponent);
    this.register("Image", ImageComponent);
    // TODO: 注册剩余 13 个组件
  }

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
