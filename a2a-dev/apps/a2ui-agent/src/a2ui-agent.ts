/**
 * A2UI 演示智能体执行器
 *
 * 提供 5 个内置演示场景的 A2UI 消息生成。
 * 每个场景展示不同的基本目录组件组合。
 *
 * @packageDocumentation
 */

import pino from "pino";
import { TaskState, Role } from "@a2a-dev/core";
import type { AgentExecutor, RequestContext, EventQueue } from "@a2a-dev/server";
import { A2UI_MIME_TYPE } from "@a2a-dev/a2ui-extension";
import type { A2uiMessage } from "@a2a-dev/a2ui-core";

const logger = pino({ name: "a2ui-agent" });

/** 公共目录 ID */
const BASIC_CATALOG = "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json";

/**
 * 5 个演示场景的 A2UI 消息定义
 *
 * 每个场景包含 createSurface + updateComponents 消息，
 * 使用 v1.0 协议格式。
 */
const SCENARIOS: Record<string, A2uiMessage[]> = {
  hello: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "body"] },
          { id: "title", component: "Text", text: "👋 欢迎使用 A2UI v1.0", variant: "body" },
          { id: "body", component: "Text", text: "这是 **A2UI v1.0** 协议的 Angular 演示应用。\n\n由 AI 代理通过声明式 JSON 消息生成交互式 UI。\n\n支持 **Markdown** 格式的文本内容。", variant: "body" },
        ],
      },
    },
  ],

  login: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "username", "password", "login-btn"], justify: "center" },
          { id: "title", component: "Text", text: "**用户登录**", variant: "body" },
          { id: "username", component: "TextField", label: "用户名", variant: "shortText", value: { path: "/login/username" } },
          { id: "password", component: "TextField", label: "密码", variant: "obscured", value: { path: "/login/password" } },
          { id: "login-btn-text", component: "Text", text: "登录" },
          { id: "login-btn", component: "Button", child: "login-btn-text", variant: "primary", action: { event: { name: "login", context: { username: { path: "/login/username" } }, wantResponse: true } } },
        ],
      },
    },
  ],

  booking: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "datetime", "guests", "submit-area"] },
          { id: "title", component: "Text", text: "**预订餐桌**", variant: "body" },
          { id: "datetime", component: "DateTimeInput", label: "选择日期和时间", value: { path: "/booking/datetime" }, enableDate: true, enableTime: true },
          { id: "guests", component: "ChoicePicker", label: "人数", options: [{ label: "1 人", value: "1" }, { label: "2 人", value: "2" }, { label: "3-4 人", value: "3-4" }, { label: "5+ 人", value: "5+" }], value: { path: "/booking/guests" }, variant: "mutuallyExclusive" },
          { id: "submit-area", component: "Row", children: ["submit-text", "submit-btn"], justify: "end" },
          { id: "submit-text", component: "Text", text: "确认预订" },
          { id: "submit-btn", component: "Button", child: "submit-text", variant: "primary", action: { event: { name: "confirm_booking", context: { datetime: { path: "/booking/datetime" }, guests: { path: "/booking/guests" } } } } },
        ],
      },
    },
  ],

  dashboard: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["header", "cards"] },
          { id: "header", component: "Text", text: "📊 **数据面板**", variant: "body" },
          { id: "cards", component: "Row", children: ["card1", "card2", "card3"], justify: "spaceBetween" },
          { id: "card1", component: "Card", child: "c1-col" }, { id: "c1-col", component: "Column", children: ["c1-title", "c1-val"], align: "center" },
          { id: "c1-title", component: "Text", text: "用户数", variant: "caption" },
          { id: "c1-val", component: "Text", text: "**1,234**", variant: "body" },
          { id: "card2", component: "Card", child: "c2-col" }, { id: "c2-col", component: "Column", children: ["c2-title", "c2-val"], align: "center" },
          { id: "c2-title", component: "Text", text: "订单数", variant: "caption" },
          { id: "c2-val", component: "Text", text: "**567**", variant: "body" },
          { id: "card3", component: "Card", child: "c3-col" }, { id: "c3-col", component: "Column", children: ["c3-title", "c3-val"], align: "center" },
          { id: "c3-title", component: "Text", text: "收入", variant: "caption" },
          { id: "c3-val", component: "Text", text: "**¥98,765**", variant: "body" },
        ],
      },
    },
  ],

  media: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "img", "desc"] },
          { id: "title", component: "Text", text: "🖼️ **多媒体展示**", variant: "body" },
          { id: "img", component: "Image", url: "https://picsum.photos/400/200", description: "示例图片", variant: "mediumFeature" },
          { id: "desc", component: "Text", text: "A2UI 支持 **Image**, **Video**, **AudioPlayer** 等多媒体组件。\n\n所有文本组件的 `body` 变体支持 Markdown 格式内容。", variant: "body" },
        ],
      },
    },
  ],

  /** form — 综合表单（展示所有交互组件 + 校验） */
  form: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "name", "email", "age", "subscribe", "prefs", "submit-area"] },
          { id: "title", component: "Text", text: "📝 **用户信息表单**", variant: "body" },
          { id: "name", component: "TextField", label: "姓名", value: { path: "/user/name" }, checks: [{ condition: { call: "required", args: { value: { path: "/user/name" } } }, message: "姓名不能为空" }] },
          { id: "email", component: "TextField", label: "邮箱", variant: "shortText", value: { path: "/user/email" }, checks: [{ condition: { call: "required", args: { value: { path: "/user/email" } } }, message: "邮箱不能为空" }, { condition: { call: "email", args: { value: { path: "/user/email" } } }, message: "邮箱格式不正确" }] },
          { id: "age", component: "Slider", label: "年龄", max: 100, value: { path: "/user/age" } },
          { id: "subscribe", component: "CheckBox", label: "订阅通知", value: { path: "/user/subscribe" } },
          { id: "prefs", component: "ChoicePicker", label: "兴趣", options: [{ label: "技术", value: "tech" }, { label: "设计", value: "design" }, { label: "音乐", value: "music" }], value: { path: "/user/interests" }, variant: "multipleSelection", displayStyle: "chips" },
          { id: "submit-area", component: "Row", children: ["submit-t", "submit-btn"], justify: "end" },
          { id: "submit-t", component: "Text", text: "提交" },
          { id: "submit-btn", component: "Button", child: "submit-t", variant: "primary", action: { event: { name: "submit_form" } } },
        ],
      },
    },
  ],

  /** gallery — 多媒体画廊 */
  gallery: [
    { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "div1", "img-row", "div2", "icon-row"] },
          { id: "title", component: "Text", text: "🖼️ **多媒体画廊**", variant: "body" },
          { id: "div1", component: "Divider", axis: "horizontal" },
          { id: "img-row", component: "Row", children: ["img1", "img2", "img3"], justify: "spaceEvenly" },
          { id: "img1", component: "Image", url: "https://picsum.photos/seed/a/150/150", description: "图片 A", variant: "smallFeature" },
          { id: "img2", component: "Image", url: "https://picsum.photos/seed/b/150/150", description: "图片 B", variant: "smallFeature" },
          { id: "img3", component: "Image", url: "https://picsum.photos/seed/c/150/150", description: "图片 C", variant: "smallFeature" },
          { id: "div2", component: "Divider", axis: "horizontal" },
          { id: "icon-row", component: "Row", children: ["ic1", "ic2", "ic3", "ic4", "ic5"], justify: "spaceEvenly" },
          { id: "ic1", component: "Icon", name: "favorite" },
          { id: "ic2", component: "Icon", name: "star" },
          { id: "ic3", component: "Icon", name: "search" },
          { id: "ic4", component: "Icon", name: "settings" },
          { id: "ic5", component: "Icon", name: "home" },
        ],
      },
    },
  ],
};

const SCENARIO_KEYS = Object.keys(SCENARIOS);

/**
 * A2UIDemoAgent — 5 场景演示智能体
 *
 * 根据用户输入的关键词返回对应的 A2UI 场景消息。
 * 关键词匹配场景名或场景名中的任意部分。
 */
export class A2UIDemoAgent implements AgentExecutor {
  async execute(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    const text = context.message.parts[0]?.text ?? "";

    // 检测是否是 action 事件（来自客户端的 DataPart）
    const actionPart = context.message.parts.find(p => p.mediaType === A2UI_MIME_TYPE);
    if (actionPart?.data) {
      const actionData = actionPart.data as { action?: { name: string; context?: Record<string, unknown> } };
      const actionName = actionData?.action?.name;
      if (actionName) {
        await this.handleAction(actionName, actionData.action?.context, eventQueue);
        return;
      }
    }

    logger.info({ scenario, text }, "匹配到场景");

    // 发送工作中状态
    eventQueue.push({
      taskId: context.task!.id,
      status: {
        state: TaskState.TASK_STATE_WORKING,
        message: { role: Role.ROLE_AGENT, parts: [{ text: `场景: ${scenario}` }], messageId: crypto.randomUUID() },
      },
    });

    // 发送 A2UI 数据
    eventQueue.push({
      taskId: context.task!.id,
      artifact: {
        artifactId: crypto.randomUUID(),
        name: "a2ui-surface",
        parts: [{ data: { a2uiMessages: msgs }, mediaType: A2UI_MIME_TYPE }],
        lastChunk: true,
      },
    });

    // 发送完成状态
    eventQueue.push({
      taskId: context.task!.id,
      status: { state: TaskState.TASK_STATE_COMPLETED, timestamp: new Date().toISOString() },
    });

    eventQueue.complete();
    logger.info({ taskId: context.task!.id, scenario }, "任务完成");
  }

  /**
   * 处理客户端发来的 action 事件
   *
   * 识别预设的 action 名称并返回对应响应消息。
   * 当前支持：login / confirm_booking
   */
  private async handleAction(
    name: string,
    context: Record<string, unknown> | undefined,
    eventQueue: EventQueue,
  ): Promise<void> {
    eventQueue.push({
      taskId: crypto.randomUUID(),
      status: { state: TaskState.TASK_STATE_WORKING, message: { role: Role.ROLE_AGENT, parts: [{ text: `处理操作: ${name}` }], messageId: crypto.randomUUID() } },
    });

    let responseMsgs: A2uiMessage[] = [];

    if (name === "login") {
      responseMsgs = [
        { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
        { version: "1.0", updateComponents: { surfaceId: "main", components: [
          { id: "root", component: "Column", children: ["msg"], align: "center" },
          { id: "msg", component: "Text", text: `✅ 登录成功！欢迎 ${String(context?.username ?? "用户")}` },
        ] } },
      ];
    } else if (name === "confirm_booking") {
      const datetime = String(context?.datetime ?? "待定");
      const guests = String(context?.guests ?? "");
      responseMsgs = [
        { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
        { version: "1.0", updateComponents: { surfaceId: "main", components: [
          { id: "root", component: "Column", children: ["title", "detail"], align: "center" },
          { id: "title", component: "Text", text: "✅ **预订成功**" },
          { id: "detail", component: "Text", text: `时间: ${datetime}\n人数: ${guests}` },
        ] } },
      ];
    } else {
      responseMsgs = [
        { version: "1.0", createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG } },
        { version: "1.0", updateComponents: { surfaceId: "main", components: [
          { id: "root", component: "Text", text: `收到操作: ${name}，但未定义处理逻辑` },
        ] } },
      ];
    }

    eventQueue.push({
      taskId: crypto.randomUUID(),
      artifact: {
        artifactId: crypto.randomUUID(), name: "a2ui-action-response",
        parts: [{ data: { a2uiMessages: responseMsgs }, mediaType: A2UI_MIME_TYPE }],
        lastChunk: true,
      },
    });

    eventQueue.push({ taskId: crypto.randomUUID(), status: { state: TaskState.TASK_STATE_COMPLETED, timestamp: new Date().toISOString() } });
    eventQueue.complete();
    logger.info({ action: name }, "Action 处理完成");
  }

  async cancel(context: RequestContext, eventQueue: EventQueue): Promise<void> {
    eventQueue.push({
      taskId: context.task?.id ?? "unknown",
      status: { state: TaskState.TASK_STATE_CANCELED },
    });
    eventQueue.complete();
  }
}
