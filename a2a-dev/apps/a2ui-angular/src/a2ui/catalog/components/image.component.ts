import { Component, signal, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "a2ui-image",
  standalone: true,
  template: `<img [src]="url" [alt]="alt" [style.objectFit]="fit" class="a2ui-image" [class]="variant" />`,
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
  propsSignal = signal<Record<string, unknown>>({});
  get url(): string { return String(this.propsSignal()["url"] ?? ""); }
  get alt(): string { return String(this.propsSignal()["description"] ?? ""); }
  get fit(): string { return (this.propsSignal()["fit"] as string) ?? "fill"; }
  get variant(): string { return (this.propsSignal()["variant"] as string) ?? "mediumFeature"; }
}
