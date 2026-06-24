import { Component, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-image",
  standalone: true,
  template: `<img
    [src]="url"
    [alt]="alt"
    [style.objectFit]="fit"
    class="a2ui-image"
    [class]="variant"
  />`,
  styles: [
    `
      .a2ui-image {
        max-width: 100%;
        border-radius: 8px;
      }
      .a2ui-image.icon {
        width: 24px;
        height: 24px;
      }
      .a2ui-image.avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      .a2ui-image.smallFeature {
        width: 80px;
        height: 80px;
      }
      .a2ui-image.mediumFeature {
        width: 200px;
        height: 150px;
      }
      .a2ui-image.largeFeature {
        width: 100%;
        height: 300px;
      }
      .a2ui-image.header {
        width: 100%;
        height: 200px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent extends BaseComponent {
  url = this.binding.resolveString(this.props["url"], this.surfaceId);
  alt = this.binding.resolveString(this.props["description"], this.surfaceId);
  fit = (this.props["fit"] as string) ?? "fill";
  variant = (this.props["variant"] as string) ?? "mediumFeature";
}
