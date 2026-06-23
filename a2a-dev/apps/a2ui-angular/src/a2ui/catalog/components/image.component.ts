import { Component, computed, signal, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-image",
  standalone: true,
  template: `<img [src]="urlValue()" [alt]="altValue()" [style.objectFit]="fitValue()" class="a2ui-image" [class]="variantValue()" />`,
  styles: [`.a2ui-image { max-width: 100%; border-radius: 8px; } .a2ui-image.icon { width: 24px; height: 24px; } .a2ui-image.avatar { width: 40px; height: 40px; border-radius: 50%; } .a2ui-image.smallFeature { width: 80px; height: 80px; } .a2ui-image.mediumFeature { width: 200px; height: 150px; } .a2ui-image.largeFeature { width: 100%; height: 300px; } .a2ui-image.header { width: 100%; height: 200px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  propsSignal = signal<Record<string, unknown>>({});
  urlValue = computed(() => String(this.propsSignal()["url"] ?? ""));
  altValue = computed(() => String(this.propsSignal()["description"] ?? ""));
  fitValue = computed(() => (this.propsSignal()["fit"] as string) ?? "fill");
  variantValue = computed(() => (this.propsSignal()["variant"] as string) ?? "mediumFeature");
}
