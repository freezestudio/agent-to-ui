/**
 * A2UI Angular 应用配置
 *
 * 使用 APP_INITIALIZER 注册所有 A2UI 基本目录组件，
 * 避免 CatalogService 直接导入组件类造成的循环依赖。
 */

import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { CatalogService } from "../a2ui/catalog/catalog.js";

// 导入所有 18 个组件
import { TextComponent } from "../a2ui/catalog/components/text.component.js";
import { ButtonComponent } from "../a2ui/catalog/components/button.component.js";
import { RowComponent } from "../a2ui/catalog/components/row.component.js";
import { ColumnComponent } from "../a2ui/catalog/components/column.component.js";
import { ImageComponent } from "../a2ui/catalog/components/image.component.js";
import { IconComponent } from "../a2ui/catalog/components/icon.component.js";
import { VideoComponent } from "../a2ui/catalog/components/video.component.js";
import { AudioPlayerComponent } from "../a2ui/catalog/components/audio-player.component.js";
import { CardComponent } from "../a2ui/catalog/components/card.component.js";
import { ListComponent } from "../a2ui/catalog/components/list.component.js";
import { TabsComponent } from "../a2ui/catalog/components/tabs.component.js";
import { DividerComponent } from "../a2ui/catalog/components/divider.component.js";
import { ModalComponent } from "../a2ui/catalog/components/modal.component.js";
import { TextFieldComponent } from "../a2ui/catalog/components/text-field.component.js";
import { CheckBoxComponent } from "../a2ui/catalog/components/check-box.component.js";
import { ChoicePickerComponent } from "../a2ui/catalog/components/choice-picker.component.js";
import { SliderComponent } from "../a2ui/catalog/components/slider.component.js";
import { DateTimeInputComponent } from "../a2ui/catalog/components/date-time-input.component.js";

/** 在应用启动时注册所有 A2UI 基本目录组件 */
function registerCatalogComponents(catalog: CatalogService): () => void {
  return () => {
    catalog.register("Text", TextComponent);
    catalog.register("Button", ButtonComponent);
    catalog.register("Row", RowComponent);
    catalog.register("Column", ColumnComponent);
    catalog.register("Image", ImageComponent);
    catalog.register("Icon", IconComponent);
    catalog.register("Video", VideoComponent);
    catalog.register("AudioPlayer", AudioPlayerComponent);
    catalog.register("Card", CardComponent);
    catalog.register("List", ListComponent);
    catalog.register("Tabs", TabsComponent);
    catalog.register("Divider", DividerComponent);
    catalog.register("Modal", ModalComponent);
    catalog.register("TextField", TextFieldComponent);
    catalog.register("CheckBox", CheckBoxComponent);
    catalog.register("ChoicePicker", ChoicePickerComponent);
    catalog.register("Slider", SliderComponent);
    catalog.register("DateTimeInput", DateTimeInputComponent);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([]),
    {
      provide: APP_INITIALIZER,
      useFactory: registerCatalogComponents,
      deps: [CatalogService],
      multi: true,
    },
  ],
};
