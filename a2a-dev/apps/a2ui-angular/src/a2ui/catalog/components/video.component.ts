/**
 * A2UI Video 组件
 * 显示视频播放器，支持封面图。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-video",
  standalone: true,
  template: `
    <div class="a2ui-video-wrapper">
      <video controls [src]="videoUrl" [poster]="posterUrl" class="a2ui-video"></video>
    </div>
  `,
  styles: [`.a2ui-video-wrapper { width: 100%; } .a2ui-video { width: 100%; max-height: 400px; border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  videoUrl = "";
  posterUrl = "";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.videoUrl = String(props["url"] ?? "");
    this.posterUrl = String(props["posterUrl"] ?? "");
  }
}
