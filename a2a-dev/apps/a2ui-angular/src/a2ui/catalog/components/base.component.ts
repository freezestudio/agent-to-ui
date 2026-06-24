/**
 * A2UI 组件基类
 *
 * 提供注入 SURFACE_ID 和 COMPONENT_PROPS 的公共逻辑。
 * 所有 18 个基本目录组件继承此类。
 */

import { inject } from "@angular/core";
import { SURFACE_ID, COMPONENT_PROPS } from "../../renderer/component-host-injection-tokens.js";
import { DataBindingService } from "../../data/data-binding.service.js";
import { A2uiRendererService } from "../../renderer/a2ui-renderer.service.js";

export abstract class BaseComponent {
  /** 通过依赖注入获取 surfaceId（构造时可用） */
  protected readonly surfaceId: string = inject(SURFACE_ID);
  /** 通过依赖注入获取组件属性（构造时可用） */
  protected readonly props: Record<string, unknown> = inject(COMPONENT_PROPS);
  /** 数据绑定解析服务 */
  protected readonly binding = inject(DataBindingService);
  /** 渲染器服务（用于写回 DataModel 等操作） */
  protected readonly renderer = inject(A2uiRendererService);
}
