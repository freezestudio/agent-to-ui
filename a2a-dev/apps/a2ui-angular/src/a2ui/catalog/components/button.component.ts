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
  selector: "a2ui-button",
  standalone: true,
  imports: [],
  template: `
    <button
      class="a2ui-button"
      [class.primary]="variant === 'primary'"
      [class.borderless]="variant === 'borderless'"
      (click)="onClick()"
    >
      <ng-container #childContainer></ng-container>
    </button>
  `,
  styles: [
    `
      .a2ui-button {
        padding: 8px 20px;
        border-radius: 8px;
        border: 1px solid #d0d0d0;
        background: #fff;
        cursor: pointer;
        font-size: 0.95rem;
      }
      .a2ui-button:hover {
        background: #f5f5f5;
      }
      .a2ui-button.primary {
        background: #1a1a2e;
        color: #fff;
        border-color: #1a1a2e;
      }
      .a2ui-button.primary:hover {
        background: #2d2d5e;
      }
      .a2ui-button.borderless {
        border: none;
        background: transparent;
      }
      .a2ui-button.borderless:hover {
        background: transparent;
        text-decoration: underline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  variant: string = (this.props["variant"] as string) ?? "default";
  private childId: string = (this.props["child"] as string) ?? "";
  private action: any = this.props["action"];

  ngAfterViewInit(): void {
    if (this.childId && this.childContainer) {
      this.childRenderer.renderChild(this.childContainer, this.surfaceId, this.childId);
    }
  }

  onClick(): void {
    if (this.action?.event) {
      const surface = this.renderer.getSurface(this.surfaceId);
      if (surface) {
        surface.dispatchAction({
          version: "1.0",
          action: {
            name: this.action.event.name,
            surfaceId: this.surfaceId,
            sourceComponentId: "button",
            timestamp: new Date().toISOString(),
            context: this.action.event.context ?? {},
            wantResponse: this.action.event.wantResponse,
          },
        });
      }
    }
  }
}
