import { Component, inject, ViewChild, ViewContainerRef, AfterViewInit, ChangeDetectionStrategy, signal } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-tabs",
  standalone: true,
  template: `
    <div class="a2ui-tabs">
      <div class="a2ui-tab-headers">@for(tab of tabs; track $index){<button class="a2ui-tab-btn" [class.active]="$index===activeIndex()" (click)="selectTab($index)">{{tab.title}}</button>}</div>
      <div class="a2ui-tab-content"><ng-container #childContainer></ng-container></div>
    </div>`,
  styles: [`.a2ui-tab-headers{display:flex;gap:4px;border-bottom:1px solid #e0e0e0;margin-bottom:12px}.a2ui-tab-btn{padding:8px 16px;border:none;background:transparent;cursor:pointer;font-size:0.9rem;border-bottom:2px solid transparent}.a2ui-tab-btn.active{border-bottom-color:#1a1a2e;font-weight:600}.a2ui-tab-content{min-height:40px}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent extends BaseComponent implements AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;
  tabs: Array<{ title: string; child: string }> = Array.isArray(this.props["tabs"]) ? (this.props["tabs"] as any[]).map((t: any) => ({ title: this.binding.resolveString(t.title, this.surfaceId), child: String(t.child ?? "") })) : [];
  activeIndex = signal(0);

  ngAfterViewInit(): void { this.renderTab(); }
  selectTab(i: number): void { this.activeIndex.set(i); this.renderTab(); }
  private renderTab(): void {
    const tab = this.tabs[this.activeIndex()];
    if (tab?.child && this.childContainer) { this.childContainer.clear(); this.childRenderer.renderChild(this.childContainer, this.surfaceId, tab.child); }
  }
}
