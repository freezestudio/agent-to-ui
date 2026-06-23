import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";

@Component({
  selector: "a2ui-card",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `<div class="a2ui-card"><a2ui-component-host [surfaceId]="surfaceIdValue()" [componentId]="childId()" /></div>`,
  styles: [`.a2ui-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  surfaceIdValue = signal("");
  childId = computed(() => String(this.propsSignal()["child"] ?? ""));
  propsSignal = signal<Record<string, unknown>>({});
}
