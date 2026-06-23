# 文档转换脚本

此目录包含用于准备我们的文档以进行 **MkDocs** 构建过程的实用脚本。

## 目的

为确保在 GitHub 和托管站点上都有良好的阅读体验，项目使用 **GitHub 风味 Markdown** 作为主要真实来源。此脚本在构建过程中将 GitHub 的原生语法转换为 **MkDocs 兼容的语法**（专门用于 `pymdown-extensions`）。

## 支持的转换（单向）

脚本执行单向转换：**GitHub Markdown → MkDocs 语法**。

### 警报/提醒转换

脚本处理以下转换：

- GitHub 对警报使用基于 blockquote 的语法。
- MkDocs 需要 `!!!` 或 `???` 语法来渲染彩色标注框。

## 运行转换

转换作为构建过程的一部分运行。不需要额外步骤。如果需要手动运行转换，可以运行仓库根目录中的 `convert_docs.py` 脚本。

```bash
python docs/scripts/convert_docs.py
```

### 示例

- **源（GitHub 风味 Markdown）：**

    ```markdown
    > ⚠️ **注意**
    >
    > 这是一个警报。
    ```

- **目标（MkDocs 语法）：**

    ```markdown
    !!! warning "注意"
    这是一个警报。
    ```
