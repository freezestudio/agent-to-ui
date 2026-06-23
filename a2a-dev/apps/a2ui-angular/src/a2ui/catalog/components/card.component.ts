/**
 * A2UI Card 组件（Angular 实现）
 *
 * 卡片容器。单个子组件通过 child ID 引用。
 * 要显示多个元素需包裹在 Row/Column 中。
 */

import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";

@Component({
  selector: "a2ui-card",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `
    <div class="a2ui-card">
      <a2ui-component-host [surfaceId]="surfaceId()" [componentId]="childId()" />
    </div>
  `,
  styles: [`.a2ui-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  surfaceId = signal("", { alias: "surfaceId" });
  childId = computed(() => String((this.props()["child"]) ?? ""));
  private propsSignal = signal<Record<string, unknown>>({}, { alias: "props" });
  private props = this.propsSignal.asReadonly();
}
