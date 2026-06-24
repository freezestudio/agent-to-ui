import { Component, signal, inject, ChangeDetectionStrategy } from "@angular/core";

import { BaseComponent } from "./base.component.js";
import { ValidationService } from "../../data/validation.service.js";

@Component({
  selector: "a2ui-checkbox",
  standalone: true,
  template: `<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" [checked]="checked()" (change)="toggle()" (blur)="runValidation()" style="width:18px;height:18px;cursor:pointer"/><span>{{label}}</span></label>@for(e of errors();track e){<small style="color:#d32f2f;font-size:.8rem;display:block">{{e}}</small>}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckBoxComponent extends BaseComponent {
  private validator = inject(ValidationService);

  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  checked = signal(this.binding.resolveBoolean(this.props["value"], this.surfaceId));
  errors = signal<string[]>([]);
  private valuePath = this.binding.resolveBindingPath(this.props["value"]);
  private checks = this.props["checks"];

  toggle(): void {
    this.checked.update(v => {
      const next = !v;
      if (this.valuePath) {
        const surface = this.renderer.getSurface(this.surfaceId);
        surface?.dataModel.set(this.valuePath, next);
      }
      return next;
    });
  }

  async runValidation(): Promise<void> {
    if (!this.checks) { this.errors.set([]); return; }
    const result = await this.validator.validate(this.checks, this.surfaceId);
    this.errors.set(result.errors);
  }
}
