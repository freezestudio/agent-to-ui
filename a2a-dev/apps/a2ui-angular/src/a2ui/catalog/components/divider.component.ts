/**
 * A2UI Divider 组件
 * 水平或垂直分隔线。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-divider",
  standalone: true,
  template: `<div class="a2ui-divider" [class.vertical]="axis === 'vertical'" [class.horizontal]="axis !== 'vertical'"></div>`,
  styles: [`
    .a2ui-divider.horizontal { height: 1px; background: #e0e0e0; margin: 8px 0; }
    .a2ui-divider.vertical { width: 1px; background: #e0e0e0; margin: 0 8px; align-self: stretch; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  axis = "horizontal";

  ngOnInit(): void {
    this.axis = (this.propsSignal()["axis"] as string) ?? "horizontal";
  }
}
