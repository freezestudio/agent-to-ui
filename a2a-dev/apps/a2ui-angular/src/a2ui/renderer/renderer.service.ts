/**
 * A2UI 子组件渲染服务
 *
 * 为容器组件提供子组件渲染能力。
 * 通过 Angular 依赖注入解耦，避免循环依赖。
 *
 * @packageDocumentation
 */

import { Injectable, ViewContainerRef, inject, ComponentRef, Injector } from "@angular/core";
import { CatalogService } from "../catalog/catalog.js";
import { A2uiRendererService } from "./a2ui-renderer.service.js";

@Injectable({ providedIn: "root" })
export class ChildRendererService {
  private catalog = inject(CatalogService);
  private renderer = inject(A2uiRendererService);

  /**
   * 在指定的 ViewContainer 中渲染子组件
   *
   * @param vcr 父组件的 ViewContainerRef
   * @param surfaceId 表面 ID
   * @param childIds 子组件 ID 列表
   */
  renderChildren(vcr: ViewContainerRef, surfaceId: string, childIds: string[]): void {
    vcr.clear();
    for (const childId of childIds) {
      this.renderChild(vcr, surfaceId, childId);
    }
  }

  /**
   * 渲染单个子组件
   */
  renderChild(vcr: ViewContainerRef, surfaceId: string, childId: string): ComponentRef<unknown> | null {
    const surface = this.renderer.getSurface(surfaceId);
    if (!surface) return null;

    const model = surface.componentsModel.get(childId);
    if (!model) return null;

    const componentType = this.catalog.get(model.type);
    if (!componentType) return null;

    const ref = vcr.createComponent(componentType, {
      injector: vcr.injector,
    });

    if (ref.instance) {
      (ref.instance as any).surfaceIdValue?.set?.(surfaceId);
      (ref.instance as any).propsSignal?.set?.(model.properties);
    }

    return ref;
  }
}
