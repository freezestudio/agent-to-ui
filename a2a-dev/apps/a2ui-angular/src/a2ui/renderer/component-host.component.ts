/**
 * A2UI 组件宿主组件
 *
 * 根据组件类型动态解析并渲染对应的 Angular 组件。
 * 负责递归渲染容器组件的子组件。
 *
 * @packageDocumentation
 */

import { Component, computed, inject, input, ViewContainerRef, OnInit, OnDestroy } from "@angular/core";
import { A2uiRendererService } from "./a2ui-renderer.service.js";
import { CatalogService } from "../catalog/catalog.js";

@Component({
  selector: "a2ui-component-host",
  standalone: true,
  template: `<!-- 子组件通过 ViewContainerRef 动态创建 -->`,
})
export class ComponentHostComponent implements OnInit, OnDestroy {
  private renderer = inject(A2uiRendererService);
  private catalog = inject(CatalogService);
  private viewContainer = inject(ViewContainerRef);

  surfaceId = input.required<string>();
  componentId = input.required<string>();

  private childHosts: ComponentHostComponent[] = [];

  ngOnInit(): void {
    this.renderComponent();
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
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

    // 创建组件实例
    const ref = this.viewContainer.createComponent(componentType, {
      injector: this.viewContainer.injector,
    });

    // 设置输入属性
    if (ref.instance) {
      (ref.instance as any).surfaceIdValue?.set?.(this.surfaceId());
      (ref.instance as any).propsSignal?.set?.(model.properties);
    }
  }
}
