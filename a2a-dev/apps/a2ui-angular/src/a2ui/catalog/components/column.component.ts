import { Component, signal, inject, ViewContainerRef, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-column",
  standalone: true,
  template: `<div class="a2ui-column" [style.justifyContent]="justify" [style.alignItems]="align"></div>`,
  styles: [`.a2ui-column { display: flex; flex-direction: column; gap: 12px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent implements OnInit {
  private renderer = inject(ChildRendererService);
  private vcr = inject(ViewContainerRef);

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  justify = "flex-start";
  align = "stretch";

  ngOnInit(): void {
    const children = this.propsSignal()["children"];
    if (Array.isArray(children)) {
      this.renderer.renderChildren(this.vcr, this.surfaceIdValue(), children as string[]);
    }
  }
}
