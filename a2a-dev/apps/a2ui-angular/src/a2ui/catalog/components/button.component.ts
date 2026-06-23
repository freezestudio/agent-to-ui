import { Component, signal, inject, ViewChild, ViewContainerRef, OnInit, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";
import { A2uiRendererService } from "../../renderer/a2ui-renderer.service.js";

@Component({
  selector: "a2ui-button",
  standalone: true,
  template: `
    <button class="a2ui-button" [class.primary]="variant === 'primary'" [class.borderless]="variant === 'borderless'" (click)="onClick()">
      <ng-container #childContainer></ng-container>
    </button>
  `,
  styles: [`
    .a2ui-button { padding: 8px 20px; border-radius: 8px; border: 1px solid #d0d0d0; background: #fff; cursor: pointer; font-size: 0.95rem; }
    .a2ui-button:hover { background: #f5f5f5; }
    .a2ui-button.primary { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
    .a2ui-button.primary:hover { background: #2d2d5e; }
    .a2ui-button.borderless { border: none; background: transparent; }
    .a2ui-button.borderless:hover { background: transparent; text-decoration: underline; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnInit, AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  private renderer = inject(A2uiRendererService);

  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  variant = "default";
  private childId = "";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.variant = (props["variant"] as string) ?? "default";
    this.childId = (props["child"] as string) ?? "";
  }

  ngAfterViewInit(): void {
    if (this.childId && this.childContainer) {
      this.childRenderer.renderChild(this.childContainer, this.surfaceIdValue(), this.childId);
    }
  }

  onClick(): void {
    const props = this.propsSignal();
    const action = props["action"] as any;
    if (action?.event) {
      this.renderer.onAction.next({
        version: "1.0",
        action: {
          name: action.event.name,
          surfaceId: this.surfaceIdValue(),
          sourceComponentId: "button",
          timestamp: new Date().toISOString(),
          context: action.event.context ?? {},
          wantResponse: action.event.wantResponse,
        },
      });
    }
  }
}
