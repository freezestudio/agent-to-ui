import { Component, inject, ViewChild, ViewContainerRef, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-column",
  standalone: true,
  template: `<div class="a2ui-column" [style.justifyContent]="justifyCss" [style.alignItems]="alignCss"><ng-container #childContainer></ng-container></div>`,
  styles: [`.a2ui-column { display: flex; flex-direction: column; gap: 12px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;
  private childIds: string[] = Array.isArray(this.props["children"]) ? this.props["children"] as string[] : [];
  justifyCss = this.mapFlex(this.props["justify"] as string, "flex-start");
  alignCss = this.mapFlex(this.props["align"] as string, "stretch");

  ngAfterViewInit(): void {
    if (this.childContainer) this.childRenderer.renderChildren(this.childContainer, this.surfaceId, this.childIds);
  }
  private mapFlex(v?: string, def = "flex-start"): string {
    const m: Record<string, string> = { start: "flex-start", end: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" };
    return m[v ?? ""] ?? def;
  }
}
