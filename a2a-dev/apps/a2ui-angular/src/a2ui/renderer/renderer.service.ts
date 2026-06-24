/**
 * A2UI 子组件渲染服务
 *
 * 为容器组件提供子组件动态渲染能力。
 * 使用 Injector 在构造时注入 surfaceId 和 props。
 */

import { Injectable, ViewContainerRef, Injector, inject } from "@angular/core";
import { CatalogService } from "../catalog/catalog.js";
import { A2uiRendererService } from "./a2ui-renderer.service.js";
import { SURFACE_ID, COMPONENT_PROPS } from "./component-host-injection-tokens.js";

@Injectable({ providedIn: "root" })
export class ChildRendererService {
  private catalog = inject(CatalogService);
  private renderer = inject(A2uiRendererService);

  /**
   * 渲染多个子组件
   */
  renderChildren(vcr: ViewContainerRef, surfaceId: string, childIds: string[], parentInjector?: Injector): void {
    for (const childId of childIds) {
      this.renderChild(vcr, surfaceId, childId, parentInjector);
    }
  }

  /**
   * 渲染单个子组件，通过 Injector 注入 surfaceId 和 props
   */
  renderChild(vcr: ViewContainerRef, surfaceId: string, childId: string, parentInjector?: Injector): void {
    const surface = this.renderer.getSurface(surfaceId);
    if (!surface) return;

    const model = surface.componentsModel.get(childId);
    if (!model) return;

    const componentType = this.catalog.get(model.type);
    if (!componentType) return;

    const injector = Injector.create({
      parent: parentInjector ?? vcr.injector,
      providers: [
        { provide: SURFACE_ID, useValue: surfaceId },
        { provide: COMPONENT_PROPS, useValue: model.properties },
      ],
    });

    vcr.createComponent(componentType, { injector });
  }
}
