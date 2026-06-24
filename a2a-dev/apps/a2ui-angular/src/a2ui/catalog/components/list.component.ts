import {
  Component,
  inject,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-list",
  standalone: true,
  template: `<div class="a2ui-list" [style.flexDirection]="direction">
    <ng-container #childContainer></ng-container>
  </div>`,
  styles: [
    `
      .a2ui-list {
        display: flex;
        overflow: auto;
        gap: 8px;
        padding: 4px 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;
  direction = (this.props["direction"] as string) === "horizontal" ? "row" : "column";
  private childIds: string[] = Array.isArray(this.props["children"])
    ? (this.props["children"] as string[])
    : [];

  ngAfterViewInit(): void {
    if (this.childContainer)
      this.childRenderer.renderChildren(this.childContainer, this.surfaceId, this.childIds);
  }
}
