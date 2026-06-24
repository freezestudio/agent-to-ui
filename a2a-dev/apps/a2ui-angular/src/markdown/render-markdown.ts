/**
 * Markdown → HTML 渲染器
 *
 * 使用 markdown-it 解析 Markdown 文本，
 * 使用 DOMPurify 净化输出的 HTML 防止 XSS。
 *
 * @packageDocumentation
 */

import markdownit from "markdown-it";
import DOMPurify from "dompurify";

/** markdown-it 实例（配置为安全模式：禁用 HTML，启用链接和排版） */
const md = markdownit({
  html: false, // 禁止内嵌 HTML
  linkify: true, // 自动识别 URL
  typographer: true, // 智能排版
});

/**
 * 将 Markdown 渲染为安全的 HTML 字符串
 *
 * @param value Markdown 文本
 * @returns 安全 HTML 字符串
 */
export function renderMarkdown(value: string): string {
  const html = md.render(value);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "del",
      "ins",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "blockquote",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel"],
  });
}
