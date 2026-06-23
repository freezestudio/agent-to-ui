import { Component, signal, inject, ViewContainerRef, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-row",
  standalone: true,
  template: `<div class="a2ui-row" [style.justifyContent]="justify" [style.alignItems]="align"><!-- 子组件通过 ViewContainerRef 动态创建 --></div>`,
  styles: [`.a2ui-row { display: flex; flex-direction: row; gap: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowComponent implements OnInit {
  private renderer = inject(ChildRendererService);
  private vcr = inject(ViewContainerRef);

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  justify = "flex-start";
  align = "stretch";

  ngOnInit(): void {
    const children = this.propsSignal()["children"];
    if (Array.isArray(children)) {
      this.justify = ((this.propsSignal()["justify"] as string) ?? "start").replace(/^./, m => `flex-${m}` === "flex-start" ? "flex-start" : m);
      this.renderer.renderChildren(this.vcr, this.surfaceIdValue(), children as string[]);
    }
  }
}
