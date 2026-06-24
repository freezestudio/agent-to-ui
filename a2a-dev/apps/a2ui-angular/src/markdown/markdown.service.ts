/**
 * Markdown 渲染服务
 *
 * 提供 Markdown 渲染的 Angular 服务抽象。
 * 懒加载 markdown-it + DOMPurify，避免 SSR 时的加载问题。
 *
 * @packageDocumentation
 */

import { Injectable } from "@angular/core";

/**
 * Markdown 渲染器抽象
 */
export abstract class MarkdownRenderer {
  abstract render(markdown: string): Promise<string>;
}

/**
 * 默认 Markdown 渲染器（懒加载 markdown-it）
 */
@Injectable({ providedIn: "root" })
export class DefaultMarkdownRenderer extends MarkdownRenderer {
  private static warnLogged = false;

  override async render(markdown: string): Promise<string> {
    try {
      const { renderMarkdown } = await import("./render-markdown.js");
      return renderMarkdown(markdown);
    } catch (err) {
      if (!DefaultMarkdownRenderer.warnLogged) {
        console.warn("[Markdown] 懒加载 markdown-it 失败，使用纯文本回退:", err);
        DefaultMarkdownRenderer.warnLogged = true;
      }
      return markdown;
    }
  }
}
