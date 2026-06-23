# A2UI 规范测试

此目录包含用于验证 A2UI JSON 模式的测试用例和运行器。

## 前提条件

- **Python 3**
- **Yarn**：测试使用 `yarn` 运行 `ajv`。

## 安装（可选）

要加速测试执行，请在本地安装依赖：

```bash
cd specification/v1_0/test
yarn install
```

## 运行测试

从仓库根目录或测试目录运行 Python 测试脚本：

```bash
python3 specification/v1_0/test/run_tests.py
```

脚本将：

1. 从 `specification/v1_0/json` 加载所有模式。
2. 执行 `specification/v1_0/test/cases/*.json` 中定义的所有测试套件。
3. 报告每个测试用例的通过/失败状态。

## 添加测试

在 `cases/` 中创建一个新的 JSON 文件（例如 `cases/my_feature.json`）：

```json
{
  "schema": "server_to_client.json",
  "tests": [
    {
      "description": "测试用例的描述",
      "valid": true,
      "data": {
        "updateComponents": { ... }
      }
    },
    {
      "description": "应验证失败",
      "valid": false,
      "data": { ... }
    }
  ]
}
```
