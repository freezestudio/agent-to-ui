/**
 * A2UI DateTimeInput 组件
 * 日期/时间输入，支持 enableDate/enableTime 配置。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-date-time-input",
  standalone: true,
  template: `
    <div class="a2ui-datetime">
      @if (label) { <label class="a2ui-dt-label">{{ label }}</label> }
      <div class="a2ui-dt-fields">
        @if (enableDate) {
          <input type="date" class="a2ui-dt-input" [value]="dateValue" (change)="onDateChange($event)" />
        }
        @if (enableTime) {
          <input type="time" class="a2ui-dt-input" [value]="timeValue" (change)="onTimeChange($event)" />
        }
      </div>
    </div>
  `,
  styles: [`
    .a2ui-datetime { display: flex; flex-direction: column; gap: 4px; }
    .a2ui-dt-label { font-size: 0.85rem; color: #555; }
    .a2ui-dt-fields { display: flex; gap: 8px; }
    .a2ui-dt-input { padding: 8px 12px; border: 1px solid #d0d0d0; border-radius: 8px; font-size: 0.95rem; outline: none; }
    .a2ui-dt-input:focus { border-color: #1a1a2e; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeInputComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  label = "";
  enableDate = false;
  enableTime = false;
  dateValue = "";
  timeValue = "";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.label = String(props["label"] ?? "");
    this.enableDate = !!props["enableDate"];
    this.enableTime = !!props["enableTime"];
    const fullValue = String(props["value"] ?? "");
    if (fullValue) {
      // 尝试解析 ISO 8601 格式
      try {
        const dt = new Date(fullValue);
        if (!isNaN(dt.getTime())) {
          this.dateValue = dt.toISOString().slice(0, 10);
          this.timeValue = dt.toISOString().slice(11, 16);
        }
      } catch { /* 保持空值 */ }
    }
  }

  onDateChange(event: Event): void {
    this.dateValue = (event.target as HTMLInputElement).value;
  }

  onTimeChange(event: Event): void {
    this.timeValue = (event.target as HTMLInputElement).value;
  }
}
