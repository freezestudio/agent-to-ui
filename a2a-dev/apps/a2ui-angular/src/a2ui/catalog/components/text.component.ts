/**
 * A2UI Text 组件
 * body（默认）：markdown-it 渲染 → innerHTML
 * caption：纯文本 → <em>
 */

import { Component, signal, inject, ChangeDetectionStrategy, effect } from "@angular/core";
import { DefaultMarkdownRenderer } from "../../../markdown/markdown.service.js";
import { BaseComponent } from "./base.component.js";

@Component({
  selector: "a2ui-text",
  standalone: true,
  template: `
    @if (variant === 'caption') {
      <em class="a2ui-text caption">{{ text }}</em>
    } @else {
      <span class="a2ui-text body" [innerHTML]="renderedHtml()"></span>
    }
  `,
  styles: [`
    :host ::ng-deep .a2ui-text.body p { margin: 0 0 0.5em 0; }
    :host ::ng-deep .a2ui-text.body p:last-child { margin-bottom: 0; }
    :host ::ng-deep .a2ui-text.body { line-height: 1.6; }
    :host ::ng-deep .a2ui-text.body strong { font-weight: 600; }
    .a2ui-text.caption { font-size: 0.85em; color: #888; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent extends BaseComponent {
  private mdRenderer = inject(DefaultMarkdownRenderer);

  /** 解析后的文本内容（支持 DynamicString 数据绑定） */
  text = this.binding.resolveString(this.props["text"], this.surfaceId);
  /** 文本变体 */
  variant: "body" | "caption" = (this.props["variant"] as any) ?? "body";

  /** 渲染后的 HTML（仅在 body 变体时使用） */
  renderedHtml = signal("");
  private renderRequestId = 0;

  constructor() {
    super();
    // 异步渲染 Markdown
    effect(() => {
      if (this.variant === "caption") return;
      const rawText = this.text;
      const requestId = ++this.renderRequestId;
      this.mdRenderer.render(rawText).then((html: string) => {
        if (requestId === this.renderRequestId) {
          this.renderedHtml.set(html);
        }
      });
    });
  }
}
