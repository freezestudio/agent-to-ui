import { Component, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-video",
  standalone: true,
  template: `<div style="width:100%">
    <video
      controls
      [src]="videoUrl"
      [poster]="posterUrl"
      style="width:100%;max-height:400px;border-radius:8px"
    ></video>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoComponent extends BaseComponent {
  videoUrl = this.binding.resolveString(this.props["url"], this.surfaceId);
  posterUrl = this.binding.resolveString(this.props["posterUrl"], this.surfaceId);
}
