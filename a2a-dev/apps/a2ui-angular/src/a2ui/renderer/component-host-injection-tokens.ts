/**
 * A2UI 组件宿主注入令牌
 *
 * 通过 Angular 依赖注入将 surfaceId 和 props 在组件构造时传入，
 * 避免 createComponent 后设置信号导致的时序问题。
 */

import { InjectionToken } from "@angular/core";

/** 表面 ID 注入令牌 */
export const SURFACE_ID = new InjectionToken<string>("A2UI_SURFACE_ID");

/** 组件属性集合注入令牌 */
export const COMPONENT_PROPS = new InjectionToken<Record<string, unknown>>("A2UI_COMPONENT_PROPS");
