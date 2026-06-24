/**
 * A2UI 组件宿主组件
 *
 * 根据组件类型动态解析并渲染对应的 Angular 组件。
 * 通过 Injector 在子组件构造时注入 surfaceId 和 props，
 * 确保 ngOnInit 中可以访问到完整数据。
 */

import { Component, inject, input, ViewContainerRef, Injector, OnInit } from "@angular/core";
import { A2uiRendererService } from "./a2ui-renderer.service.js";
import { CatalogService } from "../catalog/catalog.js";
import { SURFACE_ID, COMPONENT_PROPS } from "./component-host-injection-tokens.js";

@Component({
  selector: "a2ui-component-host",
  standalone: true,
  template: `<!-- 子组件通过 ViewContainerRef 动态创建 -->`,
})
export class ComponentHostComponent implements OnInit {
  private renderer = inject(A2uiRendererService);
  private catalog = inject(CatalogService);
  private viewContainer = inject(ViewContainerRef);
  private parentInjector = inject(Injector);

  surfaceId = input.required<string>();
  componentId = input.required<string>();

  ngOnInit(): void {
    this.renderComponent();
  }

  private renderComponent(): void {
    const surface = this.renderer.getSurface(this.surfaceId());
    if (!surface) return;

    const model = surface.componentsModel.get(this.componentId());
    if (!model) return;

    const componentType = this.catalog.get(model.type);
    if (!componentType) {
      console.warn(`未知组件类型: ${model.type}`);
      return;
    }

    // 通过 Injector 在构造时注入 surfaceId 和 props
    const childInjector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: SURFACE_ID, useValue: this.surfaceId() },
        { provide: COMPONENT_PROPS, useValue: model.properties },
      ],
    });

    this.viewContainer.createComponent(componentType, {
      injector: childInjector,
    });
  }
}
