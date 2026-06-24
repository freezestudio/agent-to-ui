import { Component, ChangeDetectionStrategy } from "@angular/core";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-audio-player",
  standalone: true,
  template: `<div style="padding:8px 0">
    @if (desc) {
      <p style="margin:0 0 8px;font-size:0.9rem;color:#666">{{ desc }}</p>
    }
    <audio controls [src]="audioUrl" style="width:100%"></audio>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent extends BaseComponent {
  audioUrl = this.binding.resolveString(this.props["url"], this.surfaceId);
  desc = this.binding.resolveString(this.props["description"], this.surfaceId);
}
