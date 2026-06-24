import { Component, signal, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-date-time-input",
  standalone: true,
  template: `<div style="display:flex;flex-direction:column;gap:4px">@if(label){<label style="font-size:.85rem;color:#555">{{label}}</label>}<div style="display:flex;gap:8px">@if(enableDate){<input type="date" class="a2ui-dt-input" [value]="dateValue()" (change)="onDateChange($event)" />}@if(enableTime){<input type="time" class="a2ui-dt-input" [value]="timeValue()" (change)="onTimeChange($event)" />}</div></div>`,
  styles: [`.a2ui-dt-input{padding:8px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:.95rem;outline:none}.a2ui-dt-input:focus{border-color:#1a1a2e}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeInputComponent extends BaseComponent {
  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  enableDate = !!this.props["enableDate"];
  enableTime = !!this.props["enableTime"];
  dateValue = signal("");
  timeValue = signal("");

  constructor() {
    super();
    const raw = this.binding.resolveString(this.props["value"], this.surfaceId);
    if (raw) {
      try { const d = new Date(raw); if (!isNaN(d.getTime())) { this.dateValue.set(d.toISOString().slice(0, 10)); this.timeValue.set(d.toISOString().slice(11, 16)); } } catch {}
    }
  }

  private valuePath = this.binding.resolveBindingPath(this.props["value"]);

  private writeBack(): void {
    if (!this.valuePath) return;
    const combined = this.enableDate && this.enableTime
      ? `${this.dateValue()}T${this.timeValue()}`
      : this.enableDate ? this.dateValue() : this.timeValue();
    if (combined) {
      const surface = this.renderer.getSurface(this.surfaceId);
      surface?.dataModel.set(this.valuePath, combined);
    }
  }

  onDateChange(e: Event): void { this.dateValue.set((e.target as HTMLInputElement).value); this.writeBack(); }
  onTimeChange(e: Event): void { this.timeValue.set((e.target as HTMLInputElement).value); this.writeBack(); }
}
