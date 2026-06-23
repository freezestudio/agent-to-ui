/**
 * A2UI Row 组件（Angular 实现）
 *
 * 水平布局容器。使用 CSS Flexbox 实现。
 * children 为子组件 ID 列表，通过 ComponentHost 递归渲染。
 */

import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";

@Component({
  selector: "a2ui-row",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `
    <div class="a2ui-row" [style.justifyContent]="justifyCss()" [style.alignItems]="alignCss()">
      @for (childId of childIds(); track childId) {
        <a2ui-component-host [surfaceId]="surfaceId()" [componentId]="childId" />
      }
    </div>
  `,
  styles: [`
    .a2ui-row { display: flex; flex-direction: row; gap: 8px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowComponent {
  surfaceId = signal("", { alias: "surfaceId" });
  childIds = computed(() => {
    const children = this.props()["children"];
    if (Array.isArray(children)) return children as string[];
    return [];
  });
  justifyCss = computed(() => {
    const m: Record<string, string> = { start: "flex-start", end: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" };
    return m[this.props()["justify"] as string] ?? "flex-start";
  });
  alignCss = computed(() => {
    const m: Record<string, string> = { start: "flex-start", end: "flex-end" };
    return m[this.props()["align"] as string] ?? "stretch";
  });
  private propsSignal = signal<Record<string, unknown>>({}, { alias: "props" });
  private props = this.propsSignal.asReadonly();
}
