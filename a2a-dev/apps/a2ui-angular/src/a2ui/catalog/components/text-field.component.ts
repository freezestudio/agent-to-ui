/**
 * A2UI TextField 组件
 * 文本输入框，支持 shortText/longText/number/obscured 四种变体。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-text-field",
  standalone: true,
  template: `
    <div class="a2ui-text-field">
      <label class="a2ui-tf-label">{{ label }}</label>
      @if (inputType === 'textarea') {
        <textarea class="a2ui-tf-input" [placeholder]="placeholder" [value]="inputValue" (input)="onInput($event)"></textarea>
      } @else {
        <input class="a2ui-tf-input" [type]="inputType" [placeholder]="placeholder" [value]="inputValue" (input)="onInput($event)" />
      }
    </div>
  `,
  styles: [`
    .a2ui-text-field { display: flex; flex-direction: column; gap: 4px; }
    .a2ui-tf-label { font-size: 0.85rem; color: #555; }
    .a2ui-tf-input { padding: 8px 12px; border: 1px solid #d0d0d0; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    .a2ui-tf-input:focus { border-color: #1a1a2e; }
    textarea.a2ui-tf-input { min-height: 80px; resize: vertical; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  label = "";
  placeholder = "";
  inputValue = "";
  inputType = "text";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.label = String(props["label"] ?? "");
    this.placeholder = String(props["placeholder"] ?? "");
    this.inputValue = String(props["value"] ?? "");
    const variant = (props["variant"] as string) ?? "shortText";
    const typeMap: Record<string, string> = { shortText: "text", longText: "textarea", number: "number", obscured: "password" };
    this.inputType = typeMap[variant] ?? "text";
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.inputValue = target.value;
    // TODO: 更新 data model 的数据绑定
  }
}
