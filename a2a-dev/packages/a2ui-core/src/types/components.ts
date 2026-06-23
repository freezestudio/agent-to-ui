/**
 * A2UI v1.0 基本目录组件属性类型
 *
 * 根据 `catalogs/basic/catalog.json` 规范定义 18 个组件的属性接口。
 * 所有组件继承 ComponentCommon，交互组件继承 Checkable。
 *
 * @packageDocumentation
 */

import type {
  ComponentCommon, ChildList,
  DynamicString, DynamicNumber, DynamicBoolean, DynamicStringList,
  Action, Checkable,
} from "./common.js";

// ============================================================================
// 展示组件（Display Components）
// ============================================================================

/** Text — 文本显示组件，body 变体支持 Markdown 渲染 */
export interface TextProps extends ComponentCommon {
  component: "Text";
  /** 文本内容（字面量、数据绑定或函数调用） */
  text: DynamicString;
  /** 文本样式变体：body（默认，支持 Markdown）| caption（纯文本） */
  variant?: "body" | "caption";
}

/** Image — 图片显示组件 */
export interface ImageProps extends ComponentCommon {
  component: "Image";
  /** 图片 URL */
  url: DynamicString;
  /** 无障碍描述文本 */
  description?: DynamicString;
  /** 图片适应方式（对应 CSS object-fit） */
  fit?: "contain" | "cover" | "fill" | "none" | "scaleDown";
  /** 图片尺寸变体 */
  variant?: "icon" | "avatar" | "smallFeature" | "mediumFeature" | "largeFeature" | "header";
}

/** Icon — 图标组件，支持 56 个预设图标名或数据绑定 */
export interface IconProps extends ComponentCommon {
  component: "Icon";
  /** 图标名称（预设名或数据绑定路径） */
  name: DynamicString;
}

/** Video — 视频播放组件 */
export interface VideoProps extends ComponentCommon {
  component: "Video";
  /** 视频 URL */
  url: DynamicString;
  /** 视频封面图 URL */
  posterUrl?: DynamicString;
}

/** AudioPlayer — 音频播放组件 */
export interface AudioPlayerProps extends ComponentCommon {
  component: "AudioPlayer";
  /** 音频 URL */
  url: DynamicString;
  /** 音频描述（如标题） */
  description?: DynamicString;
}

// ============================================================================
// 布局组件（Layout Components）
// ============================================================================

/** Row — 水平布局容器 */
export interface RowProps extends ComponentCommon {
  component: "Row";
  /** 子组件（静态 ID 列表或动态模板） */
  children: ChildList;
  /** 主轴对齐方式（水平方向） */
  justify?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly" | "stretch";
  /** 交叉轴对齐方式（垂直方向） */
  align?: "start" | "center" | "end" | "stretch";
}

/** Column — 垂直布局容器 */
export interface ColumnProps extends ComponentCommon {
  component: "Column";
  /** 子组件（静态 ID 列表或动态模板） */
  children: ChildList;
  /** 主轴对齐方式（垂直方向） */
  justify?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly" | "stretch";
  /** 交叉轴对齐方式（水平方向） */
  align?: "start" | "center" | "end" | "stretch";
}

/** List — 可滚动列表容器 */
export interface ListProps extends ComponentCommon {
  component: "List";
  /** 子组件（静态 ID 列表或动态模板） */
  children: ChildList;
  /** 列表滚动方向 */
  direction?: "vertical" | "horizontal";
  /** 交叉轴对齐方式 */
  align?: "start" | "center" | "end" | "stretch";
}

/** Card — 卡片容器（圆角、阴影样式） */
export interface CardProps extends ComponentCommon {
  component: "Card";
  /** 单个子组件 ID（多个元素需包裹在 Row/Column 中） */
  child: string;
}

/** Tabs — 标签页容器 */
export interface TabsProps extends ComponentCommon {
  component: "Tabs";
  /** 标签页定义（每个包含 title 和 child） */
  tabs: Array<{ title: DynamicString; child: string }>;
}

/** Divider — 分隔线 */
export interface DividerProps extends ComponentCommon {
  component: "Divider";
  /** 分隔线方向 */
  axis?: "horizontal" | "vertical";
}

/** Modal — 模态对话框 */
export interface ModalProps extends ComponentCommon {
  component: "Modal";
  /** 触发模态框的组件 ID */
  trigger: string;
  /** 模态框内容的组件 ID */
  content: string;
}

// ============================================================================
// 交互组件（Interactive Components）
// ============================================================================

/** Button — 按钮组件 */
export interface ButtonProps extends ComponentCommon, Checkable {
  component: "Button";
  /** 子组件 ID（Text 组件作为标签，Icon 为图标按钮） */
  child: string;
  /** 按钮样式变体 */
  variant?: "default" | "primary" | "borderless";
  /** 交互处理器（触发事件或调用本地函数） */
  action: Action;
}

/** TextField — 文本输入框 */
export interface TextFieldProps extends ComponentCommon, Checkable {
  component: "TextField";
  /** 输入标签 */
  label: DynamicString;
  /** 输入值 */
  value?: DynamicString;
  /** 占位符 */
  placeholder?: DynamicString;
  /** 输入框变体 */
  variant?: "shortText" | "longText" | "number" | "obscured";
}

/** CheckBox — 复选框 */
export interface CheckBoxProps extends ComponentCommon, Checkable {
  component: "CheckBox";
  /** 复选框标签文本 */
  label: DynamicString;
  /** 当前状态（true=选中） */
  value: DynamicBoolean;
}

/** ChoicePicker — 选项选择器 */
export interface ChoicePickerProps extends ComponentCommon, Checkable {
  component: "ChoicePicker";
  /** 选项组标签 */
  label?: DynamicString;
  /** 选择模式 */
  variant?: "mutuallyExclusive" | "multipleSelection";
  /** 可用选项列表 */
  options: Array<{ label: DynamicString; value: string }>;
  /** 当前选中的值列表 */
  value: DynamicStringList;
  /** 显示样式 */
  displayStyle?: "checkbox" | "chips";
  /** 是否可搜索过滤 */
  filterable?: boolean;
}

/** Slider — 滑块选择 */
export interface SliderProps extends ComponentCommon, Checkable {
  component: "Slider";
  /** 滑块标签 */
  label?: DynamicString;
  /** 最小值（默认 0） */
  min?: number;
  /** 最大值 */
  max: number;
  /** 当前值 */
  value: DynamicNumber;
  /** 离散步数 */
  steps?: number;
}

/** DateTimeInput — 日期/时间输入 */
export interface DateTimeInputProps extends ComponentCommon, Checkable {
  component: "DateTimeInput";
  /** ISO 8601 格式的日期/时间值 */
  value: DynamicString;
  /** 是否允许选择日期 */
  enableDate?: boolean;
  /** 是否允许选择时间 */
  enableTime?: boolean;
  /** 最小允许值（ISO 8601） */
  min?: DynamicString;
  /** 最大允许值（ISO 8601） */
  max?: DynamicString;
  /** 输入标签 */
  label?: DynamicString;
}

// ============================================================================
// 组件联合类型
// ============================================================================

/** 任意组件属性的联合类型 */
export type AnyComponentProps =
  | TextProps | ImageProps | IconProps | VideoProps | AudioPlayerProps
  | RowProps | ColumnProps | ListProps | CardProps | TabsProps | DividerProps | ModalProps
  | ButtonProps | TextFieldProps | CheckBoxProps | ChoicePickerProps | SliderProps | DateTimeInputProps;

/** 所有组件名称的常量数组 */
export const COMPONENT_NAMES = [
  "Text", "Image", "Icon", "Video", "AudioPlayer",
  "Row", "Column", "List", "Card", "Tabs", "Divider", "Modal",
  "Button", "TextField", "CheckBox", "ChoicePicker", "Slider", "DateTimeInput",
] as const;

/** 组件名称的联合类型 */
export type ComponentName = typeof COMPONENT_NAMES[number];
