/**
 * A2UI 演示智能体卡片
 *
 * 声明 A2UI v1.0 扩展能力和 5 个演示技能。
 *
 * @packageDocumentation
 */

import type { AgentCard } from "@a2a-dev/core";
import { createA2UIExtension } from "@a2a-dev/a2ui-extension";

const PORT = 10002;
const HOST = "127.0.0.1";

/** A2UI 演示智能体卡片 */
export const agentCard: AgentCard = {
  name: "A2UI 演示智能体",
  description: "演示 A2UI v1.0 协议通过 A2A 扩展传输，支持多种 UI 场景",
  version: "1.0.0",
  supportedInterfaces: [{
    url: `http://${HOST}:${PORT}/a2a`,
    protocolBinding: "JSONRPC",
    protocolVersion: "1.0",
  }],
  capabilities: {
    streaming: true,
    extensions: [createA2UIExtension()],
  },
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["application/a2ui+json"],
  skills: [
    {
      id: "hello", name: "欢迎页",
      description: "显示 A2UI 欢迎界面（Text 组件）",
      examples: ["hello", "你好", "欢迎"],
    },
    {
      id: "login", name: "登录表单",
      description: "显示登录表单（TextField + Button）",
      examples: ["login", "登录", "显示登录"],
    },
    {
      id: "booking", name: "餐厅预订",
      description: "餐厅预订表单（DateTimeInput + ChoicePicker + Button）",
      examples: ["booking", "预订", "订餐"],
    },
    {
      id: "dashboard", name: "数据面板",
      description: "显示数据卡片面板（Card + Row/Column + Text）",
      examples: ["dashboard", "面板", "数据"],
    },
    {
      id: "media", name: "多媒体展示",
      description: "多媒体展示（Image + Text）",
      examples: ["media", "图片", "多媒体"],
    },
  ],
};
