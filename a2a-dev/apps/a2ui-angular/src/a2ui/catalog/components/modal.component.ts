/**
 * A2UI Modal 组件
 * 模态对话框，通过 trigger 组件激活，显示 content 内容。
 */

import { Component, signal, inject, ViewChild, ViewContainerRef, OnInit, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-modal",
  standalone: true,
  template: `
    <ng-container #triggerContainer></ng-container>
    @if (visible) {
      <div class="a2ui-modal-overlay" (click)="close()">
        <div class="a2ui-modal-content" (click)="$event.stopPropagation()">
          <button class="a2ui-modal-close" (click)="close()">&times;</button>
          <ng-container #contentContainer></ng-container>
        </div>
      </div>
    }
  `,
  styles: [`
    .a2ui-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .a2ui-modal-content { background: #fff; border-radius: 12px; padding: 24px; min-width: 300px; max-width: 80vw; position: relative; }
    .a2ui-modal-close { position: absolute; top: 8px; right: 12px; border: none; background: none; font-size: 1.5rem; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("triggerContainer", { read: ViewContainerRef }) triggerContainer!: ViewContainerRef;
  @ViewChild("contentContainer", { read: ViewContainerRef }) contentContainer!: ViewContainerRef;

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  visible = false;

  ngOnInit(): void {
    // Modal 不需要提取属性，在 ngAfterViewInit 中通过 trigger 组件控制显隐
  }

  ngAfterViewInit(): void {
    const props = this.propsSignal();
    const triggerId = props["trigger"] as string;
    const contentId = props["content"] as string;
    if (triggerId && this.triggerContainer) {
      this.childRenderer.renderChild(this.triggerContainer, this.surfaceIdValue(), triggerId);
    }
    if (contentId && this.contentContainer) {
      this.childRenderer.renderChild(this.contentContainer, this.surfaceIdValue(), contentId);
    }
  }

  close(): void { this.visible = false; }
  open(): void { this.visible = true; }
}
