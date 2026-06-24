/**
 * A2UI TextField 组件
 *
 * 文本输入框，支持 DynamicString 数据绑定和 CheckRule 校验。
 * 用户输入自动写回到 Surface 的 DataModel。
 */

import { Component, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";
import { ValidationService } from "../../data/validation.service.js";

@Component({
  selector: "a2ui-text-field",
  standalone: true,
  template: `<div style="display:flex;flex-direction:column;gap:4px">
<label style="font-size:.85rem;color:#555">{{label}}</label>
@if(isTextarea){<textarea class="a2ui-tf-input" [class.invalid]="errors().length>0" [placeholder]="placeholder" [value]="inputValue()" (input)="onInput($event)" (blur)="runValidation()" style="min-height:80px;resize:vertical"></textarea>}
@else{<input class="a2ui-tf-input" [class.invalid]="errors().length>0" [type]="inputType" [placeholder]="placeholder" [value]="inputValue()" (input)="onInput($event)" (blur)="runValidation()" />}
@for(err of errors(); track err){<small style="color:#d32f2f;font-size:.8rem">{{err}}</small>}
</div>`,
  styles: [`.a2ui-tf-input{padding:8px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:.95rem;outline:none;width:100%;box-sizing:border-box}.a2ui-tf-input:focus{border-color:#1a1a2e}.a2ui-tf-input.invalid{border-color:#d32f2f}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent extends BaseComponent {
  private validator = inject(ValidationService);

  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  placeholder = this.binding.resolveString(this.props["placeholder"], this.surfaceId);
  isTextarea = (this.props["variant"] as string) === "longText";
  inputType = ({ shortText: "text", longText: "text", number: "number", obscured: "password" } as Record<string, string>)[(this.props["variant"] as string) ?? "shortText"] ?? "text";
  inputValue = signal(this.binding.resolveString(this.props["value"], this.surfaceId));

  private valuePath = this.binding.resolveBindingPath(this.props["value"]);
  private checks = this.props["checks"];

  /** 校验错误消息列表 */
  errors = signal<string[]>([]);

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.inputValue.set(val);
    if (this.valuePath) {
      const surface = this.renderer.getSurface(this.surfaceId);
      surface?.dataModel.set(this.valuePath, val);
    }
  }

  async runValidation(): Promise<void> {
    if (!this.checks) { this.errors.set([]); return; }
    const result = await this.validator.validate(this.checks, this.surfaceId);
    this.errors.set(result.errors);
  }
}
