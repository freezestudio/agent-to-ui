import { Component, signal, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-slider",
  standalone: true,
  template: `<div style="display:flex;flex-direction:column;gap:4px">@if(label){<label style="font-size:.85rem;color:#555">{{label}}: {{currentValue()}}</label>}<input type="range" [min]="min" [max]="max" [step]="step" [value]="currentValue()" (input)="onInput($event)" style="width:100%;cursor:pointer"/></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent extends BaseComponent {
  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  min = (this.props["min"] as number) ?? 0;
  max = (this.props["max"] as number) ?? 100;
  step = ((this.props["steps"] as number) && ((this.props["max"] as number) - (this.props["min"] as number ?? 0)) / (this.props["steps"] as number)) ?? 1;
  currentValue = signal(this.binding.resolveNumber(this.props["value"], this.surfaceId));
  onInput(e: Event): void { this.currentValue.set(Number((e.target as HTMLInputElement).value)); }
}
