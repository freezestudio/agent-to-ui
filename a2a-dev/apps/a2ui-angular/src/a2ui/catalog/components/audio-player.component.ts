/**
 * A2UI AudioPlayer 组件
 * 显示音频播放器，支持描述文字。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-audio-player",
  standalone: true,
  template: `
    <div class="a2ui-audio">
      @if(description) { <p class="a2ui-audio-desc">{{ description }}</p> }
      <audio controls [src]="audioUrl" class="a2ui-audio-player"></audio>
    </div>
  `,
  styles: [`.a2ui-audio { padding: 8px 0; } .a2ui-audio-desc { margin: 0 0 8px; font-size: 0.9rem; color: #666; } .a2ui-audio-player { width: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  audioUrl = "";
  description = "";

  ngOnInit(): void {
    const props = this.propsSignal();
    this.audioUrl = String(props["url"] ?? "");
    this.description = String(props["description"] ?? "");
  }
}
