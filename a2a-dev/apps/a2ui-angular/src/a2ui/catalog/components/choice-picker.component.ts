/**
 * A2UI ChoicePicker 组件
 * 选项选择器，支持 mutuallyExclusive/multipleSelection 两种模式。
 * 支持 checkbox 和 chips 两种显示样式。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-choice-picker",
  standalone: true,
  template: `
    <div class="a2ui-choice-picker">
      @if (label) { <label class="a2ui-cp-label">{{ label }}</label> }
      <div class="a2ui-cp-options" [class.chips]="displayStyle === 'chips'">
        @for (opt of options; track opt.value) {
          @if (displayStyle === 'chips') {
            <button class="a2ui-chip" [class.selected]="selected.has(opt.value)" (click)="toggle(opt.value)">
              {{ opt.label }}
            </button>
          } @else {
            <label class="a2ui-cp-option">
              <input type="checkbox" [checked]="selected.has(opt.value)" (change)="toggle(opt.value)" />
              <span>{{ opt.label }}</span>
            </label>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .a2ui-choice-picker { display: flex; flex-direction: column; gap: 6px; }
    .a2ui-cp-label { font-size: 0.85rem; color: #555; }
    .a2ui-cp-options { display: flex; flex-direction: column; gap: 4px; }
    .a2ui-cp-options.chips { flex-direction: row; flex-wrap: wrap; }
    .a2ui-cp-option { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9rem; }
    .a2ui-chip { padding: 6px 14px; border: 1px solid #d0d0d0; border-radius: 20px; background: #fff; cursor: pointer; font-size: 0.85rem; }
    .a2ui-chip.selected { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoicePickerComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  label = "";
  options: Array<{ label: string; value: string }> = [];
  selected = new Set<string>();
  displayStyle = "checkbox";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.label = String(props["label"] ?? "");
    this.displayStyle = (props["displayStyle"] as string) ?? "checkbox";
    const opts = props["options"];
    if (Array.isArray(opts)) {
      this.options = opts.map((o: any) => ({
        label: typeof o.label === "object" && o.label?.path ? `{${o.label.path}}` : String(o.label ?? o.value ?? ""),
        value: String(o.value ?? ""),
      }));
    }
    const val = props["value"];
    if (Array.isArray(val)) {
      this.selected = new Set(val.map(String));
    }
  }

  toggle(value: string): void {
    if (this.selected.has(value)) {
      this.selected.delete(value);
    } else {
      const variant = this.propsSignal()["variant"] as string;
      if (variant === "multipleSelection") {
        this.selected.add(value);
      } else {
        this.selected = new Set([value]);
      }
    }
  }
}
