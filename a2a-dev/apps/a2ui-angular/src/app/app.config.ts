/**
 * A2UI Angular 应用配置
 *
 * 使用 APP_INITIALIZER 注册 A2UI 基本目录组件，
 * 避免 CatalogService 直接导入组件类造成的循环依赖。
 *
 * @packageDocumentation
 */

import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { CatalogService } from "../a2ui/catalog/catalog.js";
import { TextComponent } from "../a2ui/catalog/components/text.component.js";
import { ButtonComponent } from "../a2ui/catalog/components/button.component.js";
import { RowComponent } from "../a2ui/catalog/components/row.component.js";
import { ColumnComponent } from "../a2ui/catalog/components/column.component.js";
import { ImageComponent } from "../a2ui/catalog/components/image.component.js";
import { CardComponent } from "../a2ui/catalog/components/card.component.js";

/** 在应用启动时注册所有 A2UI 基本目录组件 */
function registerCatalogComponents(catalog: CatalogService): () => void {
  return () => {
    catalog.register("Text", TextComponent);
    catalog.register("Button", ButtonComponent);
    catalog.register("Row", RowComponent);
    catalog.register("Column", ColumnComponent);
    catalog.register("Image", ImageComponent);
    catalog.register("Card", CardComponent);
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
