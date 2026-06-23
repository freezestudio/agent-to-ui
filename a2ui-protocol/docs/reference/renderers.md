# 渲染器（客户端库）

渲染器将 A2UI JSON 消息转换为不同平台的原生 UI 组件。

[代理](agents.md)负责生成 A2UI 消息，[传输层](../concepts/transports.md)负责将消息传递到客户端。客户端渲染器库必须缓冲和处理 A2UI 消息、实现 A2UI 生命周期、渲染部件并将用户操作路由回代理。

让我们用 Web 做类比。A2UI 协议就像 HTML。它提供了一种语言和 UI 模型的语义。代理就像向客户端提供 HTML 的服务器。渲染器就像浏览器。它与代理通信、解释 A2UI 协议并渲染 UI。就像 HTML 有多个浏览器引擎一样，A2UI 有多个不同的渲染器。

你有很大的灵活性，可以为渲染器带来自定义组件，或构建自己的渲染器以支持你的 UI 组件框架。

## 受维护的渲染器

### Web

| 渲染器                 | 平台           | v0.8      | v0.9.1    | v1.0       | 链接                                                                                |
| ------------------------ | ------------------ | --------- | --------- | ---------- | ------------------------------------------------------------------------------------ |
| **React**                | Web                | ✅ 稳定 | ✅ 稳定 | 🚧 计划中 | [代码](https://github.com/a2ui-project/a2ui/tree/main/renderers/react)               |
| **Lit（Web 组件）** | Web                | ✅ 稳定 | ✅ 稳定 | 🚧 计划中 | [代码](https://github.com/a2ui-project/a2ui/tree/main/renderers/lit)                 |
| **Angular**              | Web                | ✅ 稳定 | ✅ 稳定 | 🚧 计划中 | [代码](https://github.com/a2ui-project/a2ui/tree/main/renderers/angular)             |
| **Flutter（GenUI SDK）**  | 移动端/桌面端/Web | ✅ 稳定 | ✅ 稳定 | 🚧 计划中 | [文档](https://docs.flutter.dev/ai/genui) · [代码](https://github.com/flutter/genui) |

### 移动端

| 渲染器                | 平台           | v0.8      | v0.9.1    | v1.0       | 链接                                                                                |
| ----------------------- | ------------------ | --------- | --------- | ---------- | ------------------------------------------------------------------------------------ |
| **Flutter（GenUI SDK）** | 移动端/桌面端/Web | ✅ 稳定 | ✅ 稳定 | 🚧 计划中 | [文档](https://docs.flutter.dev/ai/genui) · [代码](https://github.com/flutter/genui) |
| **SwiftUI**             | iOS/macOS          | —         | —         | 🚧 计划中 | —                                                                                    |
| **Jetpack Compose**     | Android            | —         | —         | 🚧 计划中 | —                                                                                    |

查看[路线图](../roadmap.md)了解更多。

## 生态系统渲染器

社区正在为更多平台构建 A2UI 渲染器。参见完整的**[生态系统渲染器列表](../ecosystem/renderers.md)**。

## 渲染器工作原理

渲染过程通常涉及以下步骤：

1. **从传输层接收** A2UI 消息。
2. **解析** JSON 并根据模式验证。
3. **使用平台原生组件渲染**。
4. **根据应用主题应用样式**。

## 使用渲染器

按照所选渲染器的设置指南开始将 A2UI 集成到你的应用中：

- **[React](../guides/client-setup.md#react)**
- **[Lit（Web 组件）](../guides/client-setup.md#web-components-lit)**
- **[Angular](../guides/client-setup.md#angular)**
- **[Flutter（GenUI SDK）](../guides/client-setup.md#flutter-genui-sdk)**

## 构建渲染器

想为你自己的平台构建渲染器？请参见：

- [路线图](../roadmap.md)了解计划的框架。
- 查看现有渲染器以了解模式。
- 查看我们的[渲染器开发指南](../guides/renderer-development.md)了解实现渲染器的详细信息。

兼容的渲染器必须满足以下关键要求：

- 解析 A2UI JSON 消息，特别是邻接表格式。
- 将 A2UI 组件映射到原生部件。
- 处理数据绑定和生命周期事件。
- 处理一系列增量 A2UI 消息以构建和更新 UI。
- 支持服务器发起的更新。
- 支持用户操作。

更多信息，请参见以下资源：

- **[客户端设置指南](../guides/client-setup.md)**：集成说明。
- **[快速入门](../quickstart.md)**：尝试 Lit 渲染器。
- **[组件参考](components.md)**：要支持的组件。
