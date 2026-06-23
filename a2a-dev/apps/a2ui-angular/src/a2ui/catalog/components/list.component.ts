/**
 * A2UI List 组件
 * 可滚动的列表容器，支持垂直/水平方向。
 */

import { Component, signal, inject, ViewChild, ViewContainerRef, OnInit, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-list",
  standalone: true,
  template: `
    <div class="a2ui-list" [style.flexDirection]="direction">
      <ng-container #childContainer></ng-container>
    </div>
  `,
  styles: [`.a2ui-list { display: flex; overflow: auto; gap: 8px; padding: 4px 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  direction = "column";
  private childIds: string[] = [];

  ngOnInit(): void {
    const props = this.propsSignal();
    this.direction = (props["direction"] as string) === "horizontal" ? "row" : "column";
    this.childIds = Array.isArray(props["children"]) ? props["children"] as string[] : [];
  }

  ngAfterViewInit(): void {
    if (this.childContainer) {
      this.childRenderer.renderChildren(this.childContainer, this.surfaceIdValue(), this.childIds);
    }
  }
}
