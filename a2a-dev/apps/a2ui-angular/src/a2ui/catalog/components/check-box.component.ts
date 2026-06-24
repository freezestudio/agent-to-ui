import { Component, signal, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-checkbox",
  standalone: true,
  template: `<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" [checked]="checked()" (change)="toggle()" style="width:18px;height:18px;cursor:pointer"/><span>{{label}}</span></label>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckBoxComponent extends BaseComponent {
  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  checked = signal(this.binding.resolveBoolean(this.props["value"], this.surfaceId));
  toggle(): void { this.checked.update(v => !v); }
}
