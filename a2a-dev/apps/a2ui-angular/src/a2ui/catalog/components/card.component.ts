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
  selector: "a2ui-card",
  standalone: true,
  template: `<div class="a2ui-card"><ng-container #childContainer></ng-container></div>`,
  styles: [
    `
      .a2ui-card {
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 20px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;
  private childId: string = (this.props["child"] as string) ?? "";

  ngAfterViewInit(): void {
    if (this.childId && this.childContainer)
      this.childRenderer.renderChild(this.childContainer, this.surfaceId, this.childId);
  }
}
