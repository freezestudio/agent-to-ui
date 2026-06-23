import { Component, signal, inject, ViewContainerRef, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";
import { A2uiRendererService } from "../../renderer/a2ui-renderer.service.js";

@Component({
  selector: "a2ui-button",
  standalone: true,
  template: `<button class="a2ui-button" [class.primary]="variant === 'primary'" [class.borderless]="variant === 'borderless'" (click)="onClick()"></button>`,
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
export class ButtonComponent implements OnInit {
  private childRenderer = inject(ChildRendererService);
  private renderer = inject(A2uiRendererService);
  private vcr = inject(ViewContainerRef);

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  variant = "default";

  ngOnInit(): void {
    this.variant = (this.propsSignal()["variant"] as string) ?? "default";
    const childId = this.propsSignal()["child"] as string;
    if (childId) {
      this.childRenderer.renderChild(this.vcr, this.surfaceIdValue(), childId);
    }
  }

  onClick(): void {
    const action = this.propsSignal()["action"] as any;
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
