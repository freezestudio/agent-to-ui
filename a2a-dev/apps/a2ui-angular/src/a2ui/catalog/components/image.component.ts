/**
 * A2UI Image 组件（Angular 实现）
 *
 * 显示图片。支持 fit（object-fit）和 variant（尺寸变体）。
 */

import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-image",
  standalone: true,
  template: `<img [src]="url()" [alt]="alt()" [style.objectFit]="fit()" class="a2ui-image" [class]="variant()" />`,
  styles: [`
    .a2ui-image { max-width: 100%; border-radius: 8px; }
    .a2ui-image.icon { width: 24px; height: 24px; }
    .a2ui-image.avatar { width: 40px; height: 40px; border-radius: 50%; }
    .a2ui-image.smallFeature { width: 80px; height: 80px; }
    .a2ui-image.mediumFeature { width: 200px; height: 150px; }
    .a2ui-image.largeFeature { width: 100%; height: 300px; }
    .a2ui-image.header { width: 100%; height: 200px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  private propsSignal = signal<Record<string, unknown>>({}, { alias: "props" });
  private props = this.propsSignal.asReadonly();
  url = computed(() => String(this.props()["url"] ?? ""));
  alt = computed(() => String(this.props()["description"] ?? ""));
  fit = computed(() => (this.props()["fit"] as string) ?? "fill");
  variant = computed(() => (this.props()["variant"] as string) ?? "mediumFeature");
}
