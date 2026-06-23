/**
 * A2UI Tabs 组件
 * 标签页容器，每个 tab 包含标题和子组件。
 */

import { Component, signal, inject, ViewChild, ViewContainerRef, OnInit, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { ChildRendererService } from "../../renderer/renderer.service.js";

@Component({
  selector: "a2ui-tabs",
  standalone: true,
  template: `
    <div class="a2ui-tabs">
      <div class="a2ui-tab-headers">
        @for (tab of tabs; track $index) {
          <button class="a2ui-tab-btn" [class.active]="$index === activeIndex" (click)="selectTab($index)">
            {{ tab.title }}
          </button>
        }
      </div>
      <div class="a2ui-tab-content">
        <ng-container #childContainer></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .a2ui-tab-headers { display: flex; gap: 4px; border-bottom: 1px solid #e0e0e0; margin-bottom: 12px; }
    .a2ui-tab-btn { padding: 8px 16px; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; border-bottom: 2px solid transparent; }
    .a2ui-tab-btn.active { border-bottom-color: #1a1a2e; font-weight: 600; }
    .a2ui-tab-content { min-height: 40px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements OnInit, AfterViewInit {
  private childRenderer = inject(ChildRendererService);
  @ViewChild("childContainer", { read: ViewContainerRef }) childContainer!: ViewContainerRef;

  surfaceIdValue = signal("");
  propsSignal = signal<Record<string, unknown>>({});
  tabs: Array<{ title: string; child: string }> = [];
  activeIndex = 0;

  ngOnInit(): void {
    const tabsData = this.propsSignal()["tabs"];
    if (Array.isArray(tabsData)) {
      this.tabs = tabsData.map((t: any) => ({ title: String(t.title ?? ""), child: String(t.child ?? "") }));
    }
  }

  ngAfterViewInit(): void {
    this.renderActiveTab();
  }

  selectTab(index: number): void {
    this.activeIndex = index;
    this.renderActiveTab();
  }

  private renderActiveTab(): void {
    const tab = this.tabs[this.activeIndex];
    if (tab?.child && this.childContainer) {
      this.childContainer.clear();
      this.childRenderer.renderChild(this.childContainer, this.surfaceIdValue(), tab.child);
    }
  }
}
