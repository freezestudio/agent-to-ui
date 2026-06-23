# 代理 SDK 开发指南

本文档描述了 A2UI 代理 SDK 的架构。设计将关注点分离为不同层次，以在不同语言之间保持一致的结构，为构建生成丰富 UI 的 AI 代理提供简化的开发者体验。

**Agent SDK** 负责**能力管理、提示工程和 A2UI 负载验证**。它使 LLM 能够理解它可以构建什么 UI，并确保它产生的内容是有效的。

## 1. 统一架构概述

A2UI 代理 SDK 架构具有定义良好的数据流，连接了语言无关的模式规范与 LLM 输入和输出。

1.  **定义能力**：SDK 加载组件模式（通常来自捆绑的包资源）并将它们组织成**目录**。
2.  **生成提示**：SDK 使用这些目录生成系统指令，自动将相关的 JSON 模式和少样本示例注入到 LLM 的提示中。
3.  **流式解析**：支持在 LLM 输出**流式传输时**进行解析，逐步生成部分或完整的 UI 消息。
4.  **验证输出**：当 LLM 生成响应时，SDK 解析它，提取 A2UI JSON，并根据模式进行验证。
5.  **序列化和发送**：验证后的 JSON 被包装在标准传输信封（例如代理到代理/A2A DataPart）中，并流式传输到客户端。

---

## 2. 核心接口

A2UI 代理 SDK 的核心是四个管理模式和验证输出的关键接口。

### `CatalogConfig`

定义组件目录的元数据。它使用**提供者**加载模式，并指向可选的示例。

```python
class CatalogConfig:
    name: str
    provider: A2uiCatalogProvider
    examples_path: Optional[str] = None
```

### `A2uiCatalog`

表示处理后的目录。它提供用于验证和 LLM 指令渲染的方法。

```python
class A2uiCatalog:
    name: str
    validator: A2uiValidator

    def render_as_llm_instructions(self, options: InstructionOptions) -> str:
        """生成目录的字符串表示（模式和示例），
        适合包含在 LLM 系统提示中。"""
        ...
```

### `InferenceStrategy`

用于为 LLM 组装系统提示的抽象基础接口。它定义了如何将角色描述、工作流描述和 UI 描述组合成单个提示。

```python
class InferenceStrategy(ABC):
    @abstractmethod
    def generate_system_prompt(
        self,
        role_description: str,
        workflow_description: str = "",
        ui_description: str = "",
        client_ui_capabilities: Optional[dict[str, Any]] = None,
        allowed_components: Optional[list[str]] = None,
        allowed_messages: Optional[list[str]] = None,
        include_schema: bool = False,
        include_examples: bool = False,
        validate_examples: bool = False,
    ) -> str:
        """为 LLM 生成系统提示。"""
        ...
```

#### 标准实现

- **`A2uiSchemaManager`**：通过从目录中动态加载和组织组件模式和示例来生成提示。
- **`A2uiTemplateManager`**：使用预定义的 UI 模板或静态结构生成提示。

### `A2uiValidator` & `PayloadFixer`

SDK 的安全网。

- **`PayloadFixer`**：尝试修复常见的 LLM 格式化错误（如尾随逗号、缺失引号或未闭合的括号），然后再进行结构解析。
- **`A2uiValidator`**：执行超越标准 JSON Schema 检查的深度语义和完整性验证。

#### 标准验证器检查：

1.  **JSON Schema 验证**：验证负载是否符合 A2UI JSON Schema。
2.  **组件完整性**：确保所有组件 ID 唯一，并且如果要求，存在有效的 `root` 组件。
3.  **拓扑和可达性**：检测循环引用（包括自引用）和孤立组件（所有组件必须可从根组件到达）。
4.  **递归深度限制**：强制嵌套深度限制（例如 50 层）和函数调用的特定限制（例如 5 层），以防止客户端堆栈溢出。
5.  **路径语法验证**：验证数据绑定路径的 JSON Pointer 语法。

---

## 3. 模式管理和加载

SDK 不在代码中以编程方式定义组件模式。相反，它在运行时**加载打包到 SDK 资源中的基本目录 JSON Schema 定义**。将 SDK 移植到新语言需要为该语言的生态系统实现资源加载器和模式解析器（例如，在 Python 中使用 `Pydantic`，在 Kotlin 中使用 `kotlinx.serialization`）。

### 实现原则

1.  **独立目录**：目录应是独立的。它们应定义自己的类型或引用同一目录树内的相对路径。
2.  **版本感知**：模式管理器必须尊重 A2UI 协议版本。如果代理请求 `v0.8` 模式，它应提供 `v0.8` 的定义。
3.  **资源捆绑**：标准模式应与 SDK 产物捆绑。使用语言标准工具从包资源中读取（例如 Python 的 `importlib.resources`）。仅在资源加载失败或为开发显式配置时，回退到扫描本地 `/specification` 文件系统路径。

---

## 4. 提示工程和示例

Agent SDK 的主要价值在于轻松创建**动态、令牌高效的系统提示**。

### `generateSystemPrompt` 要求

生成提示时，SDK 应允许开发者：

1.  **修剪模式**：如果代理只需要组件的子集（例如只有 `Text` 和 `Button`），SDK 应修剪模式以节省令牌。
2.  **注入少样本示例**：少样本示例对 LLM 准确性至关重要。SDK 应从示例文件（例如目录中的 `examples/` 目录）加载这些示例，并使用标准 A2UI 标签正确格式化它们。
3.  **标准信封**：提示必须指示 LLM 将其 A2UI 输出包装在标准标签中，以实现确定性解析。

**标准提示标签：**

```
会话文本响应
<a2ui-json>
[{
  "surfaceUpdate": { ... }
}]
</a2ui-json>
```

---

## 5. 流式解析器

`A2uiStreamParser` 使用**基于正则表达式的块解析**来查找和提取 LLM 文本输出流中的 A2UI JSON 负载。它缓冲传入的块，并在检测到完整块时生成标准的部分表示。

### 1. 高级用法

解析器设计为接收文本块（例如来自 LLM 流）并返回完整的或部分的 `ResponsePart` 对象。

```python
parser = A2uiStreamParser(catalog=my_catalog)

for chunk in llm_stream:
    parts = parser.process_chunk(chunk)
    for part in parts:
        if part.a2ui_json:
            send_to_client(part.a2ui_json)
        if part.text:
            stream_text(part.text)
```

### 2. 内部机制

解析器缓冲文本并使用正则表达式提取标签之间的内容。

#### 块缓冲

传入的文本块被追加到内部缓冲区。解析器传递对话文本，直到检测到 `<a2ui-json>` 开始标签。

#### 正则表达式块提取

一旦在缓冲区中找到开始和结束标签，解析器使用正则表达式模式（例如 `<a2ui-json>(.*?)</a2ui-json>` 带 `re.DOTALL`）提取原始 JSON 字符串。

#### 净化和清理

在解析 JSON 之前，它会净化字符串以移除 LLM 可能在 A2UI 标签内的 JSON 周围意外包装的任何意外的 Markdown 代码块分隔符（如 ` ```json `）。

---

## 6. 解析、修复和验证

LLM 容易出现语法错误或模式违规。SDK 必须优雅地处理这些问题。

### `parseResponse` 流程

1.  **标签检测**：在原始文本中定位 `<a2ui-json>` 和 `</a2ui-json>` 标签。
2.  **提取**：提取标签之间的子字符串。
3.  **预处理（修复器）**：运行标准修复器（例如移除尾随逗号、修复未引用的键、纠正简单的 JSON 结构错误）。
4.  **JSON 验证**：使用你语言的标准 JSON Schema 验证器，根据目标目录模式验证清理后的 JSON 字符串。
5.  **错误报告**：如果验证失败且无法修复，SDK 应抛出结构化错误或优雅回退（例如向客户端生成错误部分）。

---

## 7. 传输和 A2A 集成

验证后，A2UI 负载必须通过网络传输。在典型的代理到应用（A2A）拓扑中，这些被包装为 **DataPart**。

### 传输标准

1.  **MIME 类型**：将 A2UI JSON 负载标记为 `application/a2ui+json`。这告诉前端渲染器如何解释流。
2.  **标准辅助函数**：提供一个 `createA2uiPart` 辅助函数以自动化此包装过程。
3.  **生成策略**：支持完整对象（当 LLM 完成说话时）和增量流式解析器生成（用于部分 JSON 显示）。

---

## 8. 基本目录标准

SDK 应为 **A2UI 基本目录**（Button、Text、Row、Column 等）提供开箱即用的配置。这确保了无需定义自定义模式即可构建"Hello, World"代理。

- 在 Python 中，这由 `BasicCatalog.get_config()` 提供。
- 你的语言 SDK 应提供类似的单例或预设，指向 `specification` 文件夹中的标准基本目录文件。

---

## 9. 代理框架集成（工具化）

虽然 SDK 可以是独立的，但当它与流行的代理框架（如 Python 的 ADK）集成时最为有用。SDK 应提供标准适配器，将 A2UI 能力与框架的工具和事件系统连接起来。

### 1. 工具集和工具

提供一个标准工具集（通常称为 `SendA2uiToClientToolset`），向 LLM 暴露用于发送丰富 UI 的工具。

### 2. Part 转换器

Part 转换器将 LLM 的输出（工具调用或文本标签）转换为标准传输 Part（如 A2A DataPart）。

### 3. 事件转换器

事件转换器拦截代理框架的事件流并应用 Part 转换器。

---

## 10. 贡献者实现指南

如果你负责将 `agent_sdk` 移植到新语言（例如 C++ 或 Kotlin），请遵循此严格的分阶段顺序：

### 第 1 步：核心基础（非 UI）

实现 `CatalogConfig`（及其 `Provider`）、`A2uiCatalog` 和 `InferenceStrategy`（如 `A2uiSchemaManager`）。确保你可以通过提供者加载 JSON 文件并打印其模式。

### 第 2 步：提示生成

实现 `generateSystemPrompt`。验证它输出带有嵌入 JSON 模式和示例的有效 Markdown。

### 第 3 步：解析和验证

实现 `parseResponse` 和验证。连接你语言的标准 JSON Schema 验证器。使用 `agent_sdks/conformance/` 中的集中式 YAML 一致性套件验证你的实现是否与参考实现相同地处理流式和验证边缘情况。

### 第 4 步：传输（A2A）

创建辅助工具以将 JSON 包装在传输 Part 中。

### 第 5 步：示例应用

创建一个简单的示例来验证 SDK 端到端工作。

---

## 11. 跨语言功能同步

A2UI 代理 SDK 是一个多语言生态系统。虽然功能可能首先在一种语言中实现（例如 Python），但我们力求在所有支持的语言之间保持一致性。

### 同步流程：

1. **主导实现**：功能可以首先在一种语言中开发和合并。
2. **文件同步 Issues**：功能的作者或审阅者**必须为所有其他支持语言提交等效功能请求的 issues**。
3. **交叉引用**：将这些新 issues 链接回原始 PR 或 issue 以获取上下文和参考。
4. **一致性而非克隆**：虽然实现应适应目标语言的习惯用法，但它们必须遵循本指南中定义的相同架构模式（推理策略、验证器、流式解析器）和协议标准。

---

## 12. 一致性测试

为确保所有 SDK 实现的行为一致性，项目维护了一个语言无关的一致性套件。

有关套件结构以及如何在你的 SDK 实现中使用它的详细信息，请参见[一致性测试 README](conformance/README.md)。
