/**
 * A2UI Surface 组件
 *
 * 渲染一个完整的 UI 表面。
 * 从根组件开始，递归渲染整个组件树。
 *
 * @packageDocumentation
 */

import { Component, input, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "./component-host.component.js";

@Component({
  selector: "a2ui-surface",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `<a2ui-component-host [surfaceId]="surfaceId()" [componentId]="'root'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurfaceComponent {
  /** 要渲染的表面 ID */
  surfaceId = input.required<string>();
}
