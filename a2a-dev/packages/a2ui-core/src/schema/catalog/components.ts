/**
 * A2UI v1.0 基本目录组件 Zod 模式
 *
 * 根据 `catalogs/basic/catalog.json` 定义 18 个组件的运行时验证规则。
 * 使用 Zod v4 的 discriminatedUnion 实现组件类型鉴别。
 *
 * @packageDocumentation
 */

import { z } from "zod";
import {
  ComponentCommonSchema,
  ChildListSchema,
  DynamicStringSchema,
  DynamicNumberSchema,
  DynamicBooleanSchema,
  DynamicStringListSchema,
  CheckRuleSchema,
} from "../common-types.js";

// ============================================================================
// 通用辅助模式
// ============================================================================

/** weight 属性（flex-grow, 仅在 Row/Column 直接子元素时可用） */
const WeightProp = z.object({
  weight: z.number().optional(),
});

/** Checkable 属性 */
const CheckableProps = z.object({
  checks: z.array(CheckRuleSchema).optional(),
});

// ============================================================================
// 展示组件模式
// ============================================================================

export const TextSchema = ComponentCommonSchema.extend({
  component: z.literal("Text"),
  text: DynamicStringSchema,
  variant: z.enum(["body", "caption"]).optional().default("body"),
})
  .merge(WeightProp)
  .strict();

export const ImageSchema = ComponentCommonSchema.extend({
  component: z.literal("Image"),
  url: DynamicStringSchema,
  description: DynamicStringSchema.optional(),
  fit: z.enum(["contain", "cover", "fill", "none", "scaleDown"]).optional().default("fill"),
  variant: z
    .enum(["icon", "avatar", "smallFeature", "mediumFeature", "largeFeature", "header"])
    .optional()
    .default("mediumFeature"),
})
  .merge(WeightProp)
  .strict();

export const IconSchema = ComponentCommonSchema.extend({
  component: z.literal("Icon"),
  name: DynamicStringSchema,
})
  .merge(WeightProp)
  .strict();

export const VideoSchema = ComponentCommonSchema.extend({
  component: z.literal("Video"),
  url: DynamicStringSchema,
  posterUrl: DynamicStringSchema.optional(),
})
  .merge(WeightProp)
  .strict();

export const AudioPlayerSchema = ComponentCommonSchema.extend({
  component: z.literal("AudioPlayer"),
  url: DynamicStringSchema,
  description: DynamicStringSchema.optional(),
})
  .merge(WeightProp)
  .strict();

// ============================================================================
// 布局组件模式
// ============================================================================

export const RowSchema = ComponentCommonSchema.extend({
  component: z.literal("Row"),
  children: ChildListSchema,
  justify: z
    .enum(["start", "center", "end", "spaceBetween", "spaceAround", "spaceEvenly", "stretch"])
    .optional()
    .default("start"),
  align: z.enum(["start", "center", "end", "stretch"]).optional().default("stretch"),
})
  .merge(WeightProp)
  .strict();

export const ColumnSchema = ComponentCommonSchema.extend({
  component: z.literal("Column"),
  children: ChildListSchema,
  justify: z
    .enum(["start", "center", "end", "spaceBetween", "spaceAround", "spaceEvenly", "stretch"])
    .optional()
    .default("start"),
  align: z.enum(["start", "center", "end", "stretch"]).optional().default("stretch"),
})
  .merge(WeightProp)
  .strict();

export const ListSchema = ComponentCommonSchema.extend({
  component: z.literal("List"),
  children: ChildListSchema,
  direction: z.enum(["vertical", "horizontal"]).optional().default("vertical"),
  align: z.enum(["start", "center", "end", "stretch"]).optional().default("stretch"),
})
  .merge(WeightProp)
  .strict();

export const CardSchema = ComponentCommonSchema.extend({
  component: z.literal("Card"),
  child: z.string().min(1, "Card 需要 child 组件 ID"),
})
  .merge(WeightProp)
  .strict();

export const TabsSchema = ComponentCommonSchema.extend({
  component: z.literal("Tabs"),
  tabs: z
    .array(
      z
        .object({
          title: DynamicStringSchema,
          child: z.string().min(1, "tab child 组件 ID 不能为空"),
        })
        .strict(),
    )
    .min(1, "Tabs 至少需要 1 个标签页"),
})
  .merge(WeightProp)
  .strict();

export const DividerSchema = ComponentCommonSchema.extend({
  component: z.literal("Divider"),
  axis: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
})
  .merge(WeightProp)
  .strict();

export const ModalSchema = ComponentCommonSchema.extend({
  component: z.literal("Modal"),
  trigger: z.string().min(1, "Modal 需要 trigger 组件 ID"),
  content: z.string().min(1, "Modal 需要 content 组件 ID"),
})
  .merge(WeightProp)
  .strict();

// ============================================================================
// 交互组件模式
// ============================================================================

const ActionSchemaForComponent = z.union([
  z
    .object({
      event: z
        .object({
          name: z.string().min(1, "事件名称不能为空"),
          context: z.record(z.string(), z.unknown()).optional(),
          wantResponse: z.boolean().optional(),
          responsePath: z.string().optional(),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      functionCall: z.object({
        call: z.string().min(1, "函数名不能为空"),
        args: z.record(z.string(), z.unknown()).optional(),
      }),
    })
    .strict(),
]);

export const ButtonSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("Button"),
    child: z.string().min(1, "Button 需要 child 组件 ID"),
    variant: z.enum(["default", "primary", "borderless"]).optional().default("default"),
    action: ActionSchemaForComponent,
  })
  .merge(WeightProp)
  .strict();

export const TextFieldSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("TextField"),
    label: DynamicStringSchema,
    value: DynamicStringSchema.optional(),
    placeholder: DynamicStringSchema.optional(),
    variant: z
      .enum(["shortText", "longText", "number", "obscured"])
      .optional()
      .default("shortText"),
  })
  .merge(WeightProp)
  .strict();

export const CheckBoxSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("CheckBox"),
    label: DynamicStringSchema,
    value: DynamicBooleanSchema,
  })
  .merge(WeightProp)
  .strict();

export const ChoicePickerSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("ChoicePicker"),
    label: DynamicStringSchema.optional(),
    variant: z
      .enum(["mutuallyExclusive", "multipleSelection"])
      .optional()
      .default("mutuallyExclusive"),
    options: z
      .array(
        z
          .object({
            label: DynamicStringSchema,
            value: z.string(),
          })
          .strict(),
      )
      .min(1, "至少需要 1 个选项"),
    value: DynamicStringListSchema,
    displayStyle: z.enum(["checkbox", "chips"]).optional().default("checkbox"),
    filterable: z.boolean().optional().default(false),
  })
  .merge(WeightProp)
  .strict();

export const SliderSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("Slider"),
    label: DynamicStringSchema.optional(),
    min: z.number().optional().default(0),
    max: z.number(),
    value: DynamicNumberSchema,
    steps: z.number().int().min(1, "steps 必须为正整数").optional(),
  })
  .merge(WeightProp)
  .strict();

export const DateTimeInputSchema = ComponentCommonSchema.merge(CheckableProps)
  .extend({
    component: z.literal("DateTimeInput"),
    value: DynamicStringSchema,
    enableDate: z.boolean().optional().default(false),
    enableTime: z.boolean().optional().default(false),
    min: DynamicStringSchema.optional(),
    max: DynamicStringSchema.optional(),
    label: DynamicStringSchema.optional(),
  })
  .merge(WeightProp)
  .strict();

// ============================================================================
// 组件鉴别联合
// ============================================================================

/**
 * 任意组件 Zod 模式
 *
 * 使用 discriminatedUnion 通过 component 字段值鉴别组件类型。
 * 这是 catalog.json 中 anyComponent 的 Zod 实现。
 */
export const AnyComponentSchema = z.discriminatedUnion("component", [
  TextSchema,
  ImageSchema,
  IconSchema,
  VideoSchema,
  AudioPlayerSchema,
  RowSchema,
  ColumnSchema,
  ListSchema,
  CardSchema,
  TabsSchema,
  DividerSchema,
  ModalSchema,
  ButtonSchema,
  TextFieldSchema,
  CheckBoxSchema,
  ChoicePickerSchema,
  SliderSchema,
  DateTimeInputSchema,
]);
