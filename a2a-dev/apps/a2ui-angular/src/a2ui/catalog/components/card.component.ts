import { Component, signal, inject, ViewContainerRef, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-card",
  standalone: true,
  template: `<div class="a2ui-card"></div>`,
  styles: [`.a2ui-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  private renderer = inject(ChildRendererService);
  private vcr = inject(ViewContainerRef);

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});

  ngOnInit(): void {
    const childId = this.propsSignal()["child"] as string;
    if (childId) {
      this.renderer.renderChild(this.vcr, this.surfaceIdValue(), childId);
    }
  }
}
