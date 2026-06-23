# 教程

## Python

教程 | 描述 | 难度
:-------- | :------------ | :-----------
[A2A 和 Python 快速入门](./python/1-introduction.md) | 学习构建一个简单的基于 Python 的"echo"A2A 服务器和客户端。 | 简单
[ADK 知识](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/adk_facts) | 使用 Agent Development Kit (ADK) 构建和测试一个简单的个人助手智能体，它可以提供有趣的知识。 | 简单
[Cloud Run 上的 ADK 智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/adk_cloud_run) | 将基于 ADK 的智能体作为可扩展的无服务器服务部署、管理和观察在 Google Cloud Run 上。 | 简单
[使用 A2A 的多智能体协作](https://github.com/a2aproject/a2a-samples/tree/main/demo) | 学习如何设置一个编排器（宿主智能体），在多个专门的 A2A 兼容智能体之间路由和管理请求。 | 简单
[Airbnb 和天气多智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/agents/airbnb_planner_multiagent) | 构建一个复杂的多智能体系统，智能体使用 A2A 协作规划旅行，同时查找 Airbnb 住宿和天气信息。 | 中等
[使用远程 ADK 智能体的 A2A 客户端-服务器示例](https://goo.gle/adk-a2a) | 学习本地 A2A 客户端智能体如何发现和使用单独的、基于 ADK 的远程智能体（例如，素数检查器）的能力。 | 简单
[Colab Notebook](https://github.com/a2aproject/a2a-samples/blob/main/notebooks/multi_agents_eval_with_cloud_run_deployment.ipynb) | 使用 Colab Notebook 从浏览器将 A2A 智能体部署到 Cloud Run，然后使用 Vertex AI 评估其性能。 | 简单

## Java

教程 | 描述 | 难度
:-------- | :------------ | :-----------
[天气智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/java/agents/weather_mcp) | 使用 MCP 服务器构建天气信息智能体。<br><br>**要在多语言、多智能体系统中使用此智能体，请查看 [weather_and_airbnb_planner 示例](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/hosts/weather_and_airbnb_planner)。** | 简单
[内容编写智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/java/agents/content_writer) | 构建一个内容编写智能体，根据大纲生成引人入胜的内容片段。<br><br>**要在内容创建多语言、多智能体系统中使用此智能体，请查看 [content_creation 示例](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/hosts/content_creation)。** | 简单
[内容编辑智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/java/agents/content_editor) | 构建一个内容编辑智能体，校对和润色内容。<br><br>**要在内容创建多语言、多智能体系统中使用此智能体，请查看 [content_creation 示例](https://github.com/a2aproject/a2a-samples/tree/main/samples/python/hosts/content_creation)。** | 简单
[骰子智能体（多传输）](https://github.com/a2aproject/a2a-samples/tree/main/samples/java/agents/dice_agent_multi_transport) | 构建一个多传输智能体，掷骰子并检查素数。 | 中等
[魔法 8 球智能体（安全）](https://github.com/a2aproject/a2a-samples/tree/main/samples/java/agents/magic_8_ball_security) | 构建魔法 8 球智能体，学习如何使用 Keycloak 通过 Bearer 令牌身份验证保护 A2A 服务器，并配置 A2A 客户端以获取和传递所需令牌。 | 中等

## JavaScript

教程 | 描述
:-------- | :------------
[使用 JavaScript 的电影研究智能体](https://github.com/a2aproject/a2a-samples/tree/main/samples/js) | 使用 Node.js 构建 A2A 智能体，使用 TMDB（电影数据库）API 处理电影搜索和查询。

## C#/.NET

教程 | 描述
:-------- | :------------
[所有 .NET 示例](https://github.com/a2aproject/a2a-dotnet/tree/main/samples) | 基础示例仓库，展示如何使用 C#/.NET SDK 构建 A2A 客户端和服务器，包括 Echo 智能体。
