import { Component, signal, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-text-field",
  standalone: true,
  template: `<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:.85rem;color:#555">{{label}}</label>@if(isTextarea){<textarea class="a2ui-tf-input" [placeholder]="placeholder" [value]="inputValue()" (input)="onInput($event)" style="min-height:80px;resize:vertical"></textarea>}@else{<input class="a2ui-tf-input" [type]="inputType" [placeholder]="placeholder" [value]="inputValue()" (input)="onInput($event)" />}</div>`,
  styles: [`.a2ui-tf-input{padding:8px 12px;border:1px solid #d0d0d0;border-radius:8px;font-size:.95rem;outline:none;width:100%}.a2ui-tf-input:focus{border-color:#1a1a2e}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent extends BaseComponent {
  label = this.binding.resolveString(this.props["label"], this.surfaceId);
  placeholder = this.binding.resolveString(this.props["placeholder"], this.surfaceId);
  isTextarea = (this.props["variant"] as string) === "longText";
  inputType = ({ shortText: "text", longText: "text", number: "number", obscured: "password" } as Record<string, string>)[(this.props["variant"] as string) ?? "shortText"] ?? "text";
  inputValue = signal(this.binding.resolveString(this.props["value"], this.surfaceId));

  onInput(e: Event): void { this.inputValue.set((e.target as HTMLInputElement).value); }
}
