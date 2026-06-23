/**
 * A2UI Slider 组件
 * 滑块选择器，支持 min/max/value/steps 配置。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-slider",
  standalone: true,
  template: `
    <div class="a2ui-slider">
      @if (label) { <label class="a2ui-slider-label">{{ label }}: {{ currentValue }}</label> }
      <input type="range" [min]="min" [max]="max" [step]="step" [value]="currentValue" (input)="onInput($event)" class="a2ui-slider-input" />
    </div>
  `,
  styles: [`
    .a2ui-slider { display: flex; flex-direction: column; gap: 4px; }
    .a2ui-slider-label { font-size: 0.85rem; color: #555; }
    .a2ui-slider-input { width: 100%; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  label = "";
  min = 0;
  max = 100;
  step = 1;
  currentValue = 50;

  ngOnInit(): void {
    const props = this.propsSignal();
    this.label = String(props["label"] ?? "");
    this.min = (props["min"] as number) ?? 0;
    this.max = (props["max"] as number) ?? 100;
    this.currentValue = (props["value"] as number) ?? 50;
    const steps = props["steps"] as number;
    if (steps && steps > 0) {
      this.step = (this.max - this.min) / steps;
    }
  }

  onInput(event: Event): void {
    this.currentValue = Number((event.target as HTMLInputElement).value);
  }
}
