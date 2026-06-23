/**
 * A2UI Angular 目录类型
 *
 * @packageDocumentation
 */

import type { Type } from "@angular/core";

/** Angular 组件注册条目 */
export interface AngularComponentEntry {
  name: string;
  component: Type<unknown>;
}
