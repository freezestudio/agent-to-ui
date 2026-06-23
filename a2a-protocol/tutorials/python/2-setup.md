# 2. 设置您的环境

## 先决条件

- Python 3.10 或更高版本。
- 可以访问终端或命令提示符。
- Git，用于克隆仓库。
- 建议使用代码编辑器（例如，Visual Studio Code）。

## 克隆仓库

如果您还没有克隆，请先克隆 A2A 示例仓库：

```bash
git clone https://github.com/a2aproject/a2a-samples.git -b main --depth 1
cd a2a-samples
```

## Python 环境和 SDK 安装

我们建议对 Python 项目使用虚拟环境。A2A Python SDK 使用 `uv` 进行依赖管理，但您也可以使用 `pip` 配合 `venv`。

1. **创建并激活虚拟环境：**

    使用 `venv`（标准库）：

    === "Mac/Linux"

        ```sh
        python -m venv .venv
        source .venv/bin/activate
        ```

    === "Windows"

        ```powershell
        python -m venv .venv
        .venv\Scripts\activate
        ```

2. **安装 A2A SDK 及其所需的 Python 依赖：**

    ```bash
    pip install -r samples/python/requirements.txt
    ```

## 验证安装

安装后，您应该能够在 Python 解释器中导入 `a2a` 包：

```bash
python -c "import a2a; print('A2A SDK 导入成功')"
```

如果此命令运行无误并打印成功消息，则您的环境已正确设置。
