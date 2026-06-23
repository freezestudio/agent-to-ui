import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";

@Component({
  selector: "a2ui-column",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `<div class="a2ui-column" [style.justifyContent]="justifyCss()" [style.alignItems]="alignCss()">@for (childId of childIds(); track childId) {<a2ui-component-host [surfaceId]="surfaceIdValue()" [componentId]="childId" />}</div>`,
  styles: [`.a2ui-column { display: flex; flex-direction: column; gap: 12px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent {
  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  childIds = computed(() => { const c = this.propsSignal()["children"]; return Array.isArray(c) ? c as string[] : []; });
  justifyCss = computed(() => { const m: Record<string, string> = { start: "flex-start", end: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" }; return m[this.propsSignal()["justify"] as string] ?? "flex-start"; });
  alignCss = computed(() => { const m: Record<string, string> = { start: "flex-start", end: "flex-end" }; return m[this.propsSignal()["align"] as string] ?? "stretch"; });
}
