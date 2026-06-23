import { Component, signal, inject, ViewChild, ViewContainerRef, OnInit, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-row",
  standalone: true,
  template: `
    <div class="a2ui-row" [style.justifyContent]="justifyCss" [style.alignItems]="alignCss">
      <ng-container #childContainer></ng-container>
    </div>
  `,
  styles: [`.a2ui-row { display: flex; flex-direction: row; gap: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowComponent implements OnInit, AfterViewInit {
  private childRenderer = inject(ChildRendererService);

  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  justifyCss = "flex-start";
  alignCss = "stretch";
  private childIds: string[] = [];

  ngOnInit(): void {
    const props = this.propsSignal();
    this.childIds = Array.isArray(props["children"]) ? props["children"] as string[] : [];
    const jMap: Record<string, string> = { start: "flex-start", end: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" };
    this.justifyCss = jMap[(props["justify"] as string) ?? ""] ?? "flex-start";
    const aMap: Record<string, string> = { start: "flex-start", end: "flex-end" };
    this.alignCss = aMap[(props["align"] as string) ?? ""] ?? "stretch";
  }

  ngAfterViewInit(): void {
    if (this.childContainer) {
      this.childRenderer.renderChildren(this.childContainer, this.surfaceIdValue(), this.childIds);
    }
  }
}
