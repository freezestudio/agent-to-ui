import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";

@Component({
  selector: "a2ui-row",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `<div class="a2ui-row" [style.justifyContent]="justifyCss()" [style.alignItems]="alignCss()">@for (childId of childIds(); track childId) {<a2ui-component-host [surfaceId]="surfaceIdValue()" [componentId]="childId" />}</div>`,
  styles: [`.a2ui-row { display: flex; flex-direction: row; gap: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowComponent {
  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  childIds = computed(() => { const c = this.propsSignal()["children"]; return Array.isArray(c) ? c as string[] : []; });
  justifyCss = computed(() => { const m: Record<string, string> = { start: "flex-start", end: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" }; return m[this.propsSignal()["justify"] as string] ?? "flex-start"; });
  alignCss = computed(() => { const m: Record<string, string> = { start: "flex-start", end: "flex-end" }; return m[this.propsSignal()["align"] as string] ?? "stretch"; });
}
