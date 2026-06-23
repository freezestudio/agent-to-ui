import { Component, computed, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { ComponentHostComponent } from "../../renderer/component-host.component.js";
import { A2uiRendererService } from "../../renderer/a2ui-renderer.service.js";

@Component({
  selector: "a2ui-button",
  standalone: true,
  imports: [ComponentHostComponent],
  template: `
    <button class="a2ui-button" [class.primary]="variantValue() === 'primary'" [class.borderless]="variantValue() === 'borderless'" (click)="onClick()">
      <a2ui-component-host [surfaceId]="surfaceIdValue()" [componentId]="childId()" />
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
export class ButtonComponent {
  private renderer = inject(A2uiRendererService);

  surfaceIdValue = signal("");
  childId = computed(() => String(this.propsSignal()["child"] ?? ""));
  variantValue = computed(() => (this.propsSignal()["variant"] as string) ?? "default");
  actionValue = computed(() => this.propsSignal()["action"]);
  propsSignal = signal<Record<string, unknown>>({});

  onClick(): void {
    const action = this.actionValue();
    if (action && typeof action === "object" && "event" in action) {
      const evt = (action as any).event;
      this.renderer.onAction.next({
        version: "1.0",
        action: {
          name: evt.name,
          surfaceId: this.surfaceIdValue(),
          sourceComponentId: "button",
          timestamp: new Date().toISOString(),
          context: evt.context ?? {},
          wantResponse: evt.wantResponse,
        },
      });
    }
  }
}
