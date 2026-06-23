/**
 * A2UI CheckBox 组件
 * 复选框，支持数据绑定。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-checkbox",
  standalone: true,
  template: `
    <label class="a2ui-checkbox">
      <input type="checkbox" [checked]="checked" (change)="toggle()" />
      <span class="a2ui-checkbox-label">{{ label }}</span>
    </label>
  `,
  styles: [`
    .a2ui-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .a2ui-checkbox input { width: 18px; height: 18px; cursor: pointer; }
    .a2ui-checkbox-label { font-size: 0.95rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckBoxComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  label = "";
  checked = false;

  ngOnInit(): void {
    const props = this.propsSignal();
    this.label = String(props["label"] ?? "");
    // value 可能是 DynamicBoolean: 布尔值、DataBinding 或 FunctionCall
    const val = props["value"];
    if (typeof val === "boolean") {
      this.checked = val;
    } else if (typeof val === "object" && val !== null && "path" in val) {
      // DataBinding 路径 - 需要从 data model 解析
      this.checked = false;
    }
  }

  toggle(): void {
    this.checked = !this.checked;
  }
}
