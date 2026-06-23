/**
 * A2UI Angular v22 应用入口
 */
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.js";
import { appConfig } from "./app/app.config.js";

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error("应用启动失败:", err));
