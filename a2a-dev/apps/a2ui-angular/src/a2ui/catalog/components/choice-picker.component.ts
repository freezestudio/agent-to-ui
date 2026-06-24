import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-choice-picker",
  standalone: true,
  template: `<div style="display:flex;flex-direction:column;gap:6px">
    @if (labels) {
      <label style="font-size:.85rem;color:#555">{{ labels }}</label>
    }
    <div [class.chips]="isChips" style="display:flex;flex-direction:column;gap:4px">
      @for (opt of optionList; track opt.value) {
        @if (isChips) {
          <button
            class="a2ui-chip"
            [class.selected]="selectedValues().has(opt.value)"
            (click)="toggle(opt.value)"
          >
            {{ opt.label }}
          </button>
        } @else {
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.9rem"
            ><input
              type="checkbox"
              [checked]="selectedValues().has(opt.value)"
              (change)="toggle(opt.value)"
            /><span>{{ opt.label }}</span></label
          >
        }
      }
    </div>
  </div>`,
  styles: [
    `
      .a2ui-chip {
        padding: 6px 14px;
        border: 1px solid #d0d0d0;
        border-radius: 20px;
        background: #fff;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .a2ui-chip.selected {
        background: #1a1a2e;
        color: #fff;
        border-color: #1a1a2e;
      }
      .chips {
        flex-direction: row !important;
        flex-wrap: wrap;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoicePickerComponent extends BaseComponent {
  labels = this.binding.resolveString(this.props["label"], this.surfaceId);
  isChips = (this.props["displayStyle"] as string) === "chips";
  isMulti = (this.props["variant"] as string) === "multipleSelection";
  optionList: Array<{ label: string; value: string }> = Array.isArray(this.props["options"])
    ? (this.props["options"] as any[]).map((o: any) => ({
        label: this.binding.resolveString(o.label, this.surfaceId),
        value: String(o.value ?? ""),
      }))
    : [];
  selectedValues = signal<Set<string>>(new Set());
  private valuePath = this.binding.resolveBindingPath(this.props["value"]);

  toggle(value: string): void {
    this.selectedValues.update((s) => {
      const next = new Set(s);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (this.isMulti) next.add(value);
        else return new Set([value]);
      }
      if (this.valuePath) {
        const surface = this.renderer.getSurface(this.surfaceId);
        surface?.dataModel.set(this.valuePath, [...next]);
      }
      return next;
    });
  }
}
