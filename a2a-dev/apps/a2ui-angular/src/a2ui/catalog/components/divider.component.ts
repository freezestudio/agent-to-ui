import { Component, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-divider",
  standalone: true,
  template: `<div [class.vertical]="axis==='vertical'" [class.horizontal]="axis!=='vertical'" style="margin:8px 0"></div>`,
  styles: [`.horizontal{height:1px;background:#e0e0e0}.vertical{width:1px;background:#e0e0e0;margin:0 8px;align-self:stretch}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent extends BaseComponent {
  axis = (this.props["axis"] as string) ?? "horizontal";
}
