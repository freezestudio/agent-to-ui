# A2A 定义/模式

=== "Protobuf"
    <h3>Protobuf</h3>
    A2A 协议的规范性定义，使用 Protocol Buffers（proto3 语法）。
    这是 A2A 协议规范的唯一真实来源。

    <h3>下载</h3>

    您可以直接下载 proto 文件：[`a2a.proto`](spec/a2a.proto)

    <h3>定义</h3>

    ```protobuf
    --8<-- "docs/spec/a2a.proto"
    ```

=== "JSON"
    <h3>JSON</h3>
    A2A 协议 JSON 模式定义（符合 JSON Schema 2020-12）。
    此模式从 protocol buffer 定义自动生成，并捆绑到包含所有消息定义的单个文件中。

    <h3>下载</h3>

    您可以直接下载模式文件：[`a2a.json`](spec/a2a.json)

    <h3>定义</h3>

    ```json
    --8<-- "docs/spec/a2a.json"
    ```
