# Genkit 评估框架用于 UI 生成

此框架用于评估各种 LLM 的 A2UI（v1.0）。

此版本将 JSON 模式直接嵌入提示中，并指示 LLM 在 Markdown 代码块内输出 JSON 对象。框架然后提取并验证此 JSON。

## 设置

要使用模型，你需要设置以下包含 API 密钥的环境变量：

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

你可以在项目根目录的 `.env` 文件中设置这些，或在 shell 配置文件中设置。

提供了一个 `.env.example` 文件作为模板：

```bash
cp .env.example .env
# 用你的 API 密钥编辑 .env（不要提交 .env）
```

运行前还需要安装依赖：

```bash
yarn install
```

## 运行所有评估（警告：可能消耗大量模型配额）

要运行流程，请使用以下命令：

```bash
yarn evalAll
```

## 运行单个测试

你可以通过使用 `--model` 和 `--prompt` 命令行标志来运行单个模型和数据点的脚本。

### 语法

```bash
yarn eval --model=<模型名称> --prompt=<提示名称>
```

### 示例

要使用 `gemini-2.5-flash-lite` 模型和 `loginForm` 提示运行测试，请使用以下命令：

```bash
yarn eval --model=gemini-2.5-flash-lite --prompt=loginForm
```

## 控制输出

默认情况下，脚本会向控制台打印进度条和最终汇总表。详细日志写入结果目录中的 `output.log`。

### 命令行选项

- `--log-level=<级别>`：设置控制台日志记录级别（默认：`info`）。选项：`error`、`warn`、`info`、`http`、`verbose`、`debug`、`silly`。
- `--results=<输出目录>`：（默认：`results/output-<model>` 或 `results/output-combined`）保留输出文件。
- `--clean-results`：如果设置，在运行测试前清理结果目录。
- `--runs-per-prompt=<次数>`：每个提示运行的次数（默认：1）。
- `--model=<模型名称>`：（默认：所有模型）仅运行指定模型。
- `--prompt=<提示名称>`：（默认：所有提示）仅运行指定提示。

## 速率限制

框架包含一个双层速率限制系统：

1. **主动限制**：本地跟踪令牌和请求使用情况以保持在配置的限制内。
2. **反应式断路器**：如果收到 `RESOURCE_EXHAUSTED`（429）错误，自动暂停对模型的请求，仅在请求的重试持续时间过后恢复。
