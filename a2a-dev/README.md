# A2A + A2UI 协议开发工具集

基于 Vite+ 的 monorepo，实现 A2A 协议 v1.0 和 A2UI 协议 v1.0。

## 项目结构

```
a2a-dev/
├── packages/
│   ├── a2a-core/          ← A2A 协议 v1.0 核心类型与 Zod 验证
│   ├── a2a-server/        ← A2A 服务端框架（Handler、TaskStore、Extension）
│   ├── a2a-client/        ← A2A 客户端 SDK
│   ├── a2ui-core/         ← A2UI v1.0 协议类型、Zod 模式、18 个组件属性
│   ├── a2ui-renderer/     ← 框架无关渲染器核心（MessageProcessor、SurfaceModel）
│   └── a2ui-extension/    ← A2A 扩展辅助（AgentCard 声明、DataPart 提取）
├── apps/
│   ├── a2a-example/       ← A2A 协议示例（HelloWorld Agent）
│   ├── a2ui-agent/        ← A2UI 演示 Agent 服务器（5 个场景）
│   ├── a2ui-angular/      ← Angular v22 前端应用（18 个组件 + Markdown）
│   └── website/           ← 静态网站
```

## A2UI 演示

### 启动 Agent 服务器

```bash
vp run start:agent
```

启动后提供 5 个演示场景：`hello` / `login` / `booking` / `dashboard` / `media`

### 启动 Angular 前端

```bash
cd apps/a2ui-angular && npx ng serve --port 5173
```

访问 `http://localhost:5173`，点击场景按钮即可看到 A2UI 渲染效果。

### 协议架构

```
AgentExecutor → 生成 A2UI 消息 → DataPart(application/a2ui+json)
  → A2A 传输 → A2AClient → MessageProcessor
  → SurfaceGroupModel → Angular 渲染
```

A2UI 数据的 MIME 类型：`application/a2ui+json`

## 开发命令

```bash
# 安装依赖
vp install

# 检查代码
vp check

# 运行所有测试
vp run -r test

# 构建所有包
vp run -r build
```

## 测试统计

| 包 | 测试数 | 说明 |
|------|--------|------|
| @a2a-dev/a2ui-core | 51 | 类型定义 + Zod 模式验证 |
| @a2a-dev/a2ui-renderer | 20 | 渲染器核心 + 函数调用器 |
| @a2a-dev/a2ui-extension | 3 | A2A 扩展辅助 |
| **总计** | **74** | |
