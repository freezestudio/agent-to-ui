/**
 * A2UI Icon 组件
 * 支持 56 个预设 Material Design 图标名或数据绑定路径。
 */

import { Component, signal, OnInit, ChangeDetectionStrategy } from "@angular/core";

/** Material Design 图标名称列表（来自 v1.0 catalog.json） */
const ICONS = [
  "accountCircle","add","arrowBack","arrowForward","attachFile","calendarToday","call",
  "camera","check","close","delete","download","edit","event","error","fastForward",
  "favorite","favoriteOff","folder","help","home","info","locationOn","lock","lockOpen",
  "mail","menu","moreVert","moreHoriz","notificationsOff","notifications","pause",
  "payment","person","phone","photo","play","print","refresh","rewind","search",
  "send","settings","share","shoppingCart","skipNext","skipPrevious","star","starHalf",
  "starOff","stop","upload","visibility","visibilityOff","volumeDown","volumeMute",
  "volumeOff","volumeUp","warning",
];

@Component({
  selector: "a2ui-icon",
  standalone: true,
  template: `<span class="a2ui-icon material-symbols-outlined">{{ iconName }}</span>`,
  styles: [`.a2ui-icon { font-size: 24px; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
  propsSignal = signal<Record<string, unknown>>({});
  iconName = "";

  ngOnInit(): void {
    const name = this.propsSignal()["name"];
    let iconStr = typeof name === "string" ? name : "";
    // 检查是否为有效图标名
    if (!ICONS.includes(iconStr)) {
      console.warn(`未知图标: "${iconStr}"`);
      iconStr = "help"; // 回退到 help 图标
    }
    this.iconName = iconStr;
  }
}
