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
  selector: "a2ui-row",
  standalone: true,
  template: `<div
    class="a2ui-row"
    [style.justifyContent]="justifyCss"
    [style.alignItems]="alignCss"
  >
    <ng-container #childContainer></ng-container>
  </div>`,
  styles: [
    `
      .a2ui-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  private childIds: string[] = Array.isArray(this.props["children"])
    ? (this.props["children"] as string[])
    : [];
  justifyCss = this.mapJustify(this.props["justify"] as string);
  alignCss = this.mapAlign(this.props["align"] as string);

  ngAfterViewInit(): void {
    if (this.childContainer) {
      this.childRenderer.renderChildren(this.childContainer, this.surfaceId, this.childIds);
    }
  }

  private mapJustify(j?: string): string {
    const m: Record<string, string> = {
      start: "flex-start",
      end: "flex-end",
      spaceBetween: "space-between",
      spaceAround: "space-around",
      spaceEvenly: "space-evenly",
    };
    return m[j ?? ""] ?? "flex-start";
  }
  private mapAlign(a?: string): string {
    const m: Record<string, string> = { start: "flex-start", end: "flex-end" };
    return m[a ?? ""] ?? "stretch";
  }
}
