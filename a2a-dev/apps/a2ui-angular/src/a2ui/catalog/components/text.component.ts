/**
 * A2UI Text 组件（Angular 实现）
 *
 * 根据 v1.0 规范：
 * - body（默认）：使用 markdown-it 渲染 Markdown → innerHTML
 * - caption：纯文本，使用 <em> 标签
 *
 * @packageDocumentation
 */

import { Component, computed, effect, signal, ChangeDetectionStrategy, inject } from "@angular/core";
import { DefaultMarkdownRenderer } from "../../../markdown/markdown.service.js";

@Component({
  selector: "a2ui-text",
  standalone: true,
  template: `
    @if (variant() === 'caption') {
      <em class="a2ui-text caption">{{ text() }}</em>
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
export class TextComponent {
  private mdRenderer = inject(DefaultMarkdownRenderer);

  textValue = signal("");
  variantValue = signal<"body" | "caption">("body");

  /** 计算属性：文本内容 */
  text = computed(() => this.textValue());
  /** 计算属性：变体 */
  variant = computed(() => this.variantValue());

  /** 渲染后的 HTML（仅 Markdown 变体使用） */
  renderedHtml = signal("");

  /** 渲染请求 ID（用于竞态控制） */
  private renderRequestId = 0;

  constructor() {
    // 当 text 变化时，异步渲染 Markdown
    effect(() => {
      if (this.variant() === "caption") return;

      const rawText = this.text();
      const requestId = ++this.renderRequestId;

      this.mdRenderer.render(rawText).then((html: string) => {
        if (requestId === this.renderRequestId) {
          this.renderedHtml.set(html);
        }
      });
    });
  }
}
