/**
 * A2UI 组件宿主组件
 *
 * 根据组件类型动态解析并渲染对应的 Angular 组件。
 * 递归处理容器组件的子组件。
 *
 * @packageDocumentation
 */

import { Component, computed, inject, input } from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { A2uiRendererService } from "./a2ui-renderer.service.js";
import { CatalogService } from "../catalog/catalog.js";

@Component({
  selector: "a2ui-component-host",
  standalone: true,
  imports: [NgComponentOutlet],
  host: { style: "display: contents;" },
  template: `
    @let compType = resolvedComponentType();
    @let model = componentModel();

    @if (compType && model) {
      <ng-container
        *ngComponentOutlet="compType; inputs: model.properties"
      />
    }
  `,
})
export class ComponentHostComponent {
  private renderer = inject(A2uiRendererService);
  private catalog = inject(CatalogService);

  /** 所属 Surface ID */
  surfaceId = input.required<string>();
  /** 要渲染的组件 ID */
  componentId = input.required<string>();

  /** 获取组件模型 */
  componentModel = computed(() => {
    return this.renderer
      .getSurface(this.surfaceId())
      ?.componentsModel.get(this.componentId());
  });

  /** 根据组件类型解析对应的 Angular 组件 */
  resolvedComponentType = computed(() => {
    const model = this.componentModel();
    if (!model) return null;
    return this.catalog.get(model.type);
  });
}
