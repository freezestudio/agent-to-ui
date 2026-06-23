/**
 * A2UI Text 组件（Angular 实现）
 *
 * body（默认）：使用 markdown-it 渲染 Markdown → innerHTML
 * caption：纯文本，使用 <em> 标签
 */

import { Component, signal, inject, OnInit, ChangeDetectionStrategy, effect } from "@angular/core";
import { DefaultMarkdownRenderer } from "../../../markdown/markdown.service.js";

@Component({
  selector: "a2ui-text",
  standalone: true,
  template: `
    @if (variantValue() === 'caption') {
      <em class="a2ui-text caption">{{ textValue() }}</em>
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
export class TextComponent implements OnInit {
  private mdRenderer = inject(DefaultMarkdownRenderer);

  /** 由 ComponentHostComponent 设置的原始属性 */
  propsSignal = signal<Record<string, unknown>>({});

  /** 组件内部状态 */
  textValue = signal("");
  variantValue = signal<"body" | "caption">("body");
  renderedHtml = signal("");

  /** 渲染请求 ID（用于竞态控制） */
  private renderRequestId = 0;

  ngOnInit(): void {
    // 从 propsSignal 中提取 Text 组件的特定属性
    const props = this.propsSignal();
    this.textValue.set(String(props["text"] ?? ""));
    this.variantValue.set((props["variant"] as "body" | "caption") ?? "body");
  }

  constructor() {
    // 监听 text 变化 → 异步渲染 Markdown
    effect(() => {
      if (this.variantValue() === "caption") return;
      const rawText = this.textValue();
      const requestId = ++this.renderRequestId;
      this.mdRenderer.render(rawText).then((html: string) => {
        if (requestId === this.renderRequestId) {
          this.renderedHtml.set(html);
        }
      });
    });
  }
}
