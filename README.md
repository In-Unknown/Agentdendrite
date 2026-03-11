# Agentdendrite 

> 个人 AI Agent 可视化工作流与操作系统

一款基于 **Electron + Vue 3 + C# ASP.NET Core** 构建的本地化 AI 智能体运行环境与工作流编排引擎。

## 💡 核心哲学与愿景

**“提供画布，而非成品。”** 

Agentdendrite 并不是一个预设好特定业务逻辑的垂直 AI 工具（如：特定文案生成器、周报助手），而是一个**高度自由、可视化的本地 AI 执行底座**。
系统仅提供最基础的“物理规律”（包含图形界面交互、节点编排能力、数据本地持久化、标准化的工具调用接口）。所有的 Agent 行为、系统提示词和业务工作流，均交由用户（或具备工具调用能力的 AI 本身）去自由探索和定义。

- **拥抱模型进化，做坚实的基础设施**：无论云端的大模型如何迭代，它们要操作本地电脑环境、执行复杂多步网络请求或读写本地文件，永远需要一个“落地执行层”。本项目正是为此而生。
- **让工作流执行白盒化**：彻底抛弃隐式的 Prompt 路由和晦涩的终端脚本，提供比拟 VS Code 的专业图形界面，让大任务拆解、节点流转、状态与中间日志清晰可见。
- **“涌现”的自我构建能力**：基于“工作流即本地文件”的设计，赋予 AI 基础的读写权限后，AI 便能直接读取、解析甚至凭空创建新的工作流，实现能力上的自我扩展。

---

## ✨ 核心特性

项目目前正处于快速迭代的**第一阶段（应用骨架与核心 UI 搭建）**，已实现以下核心能力：

### 🛠️ 桌面级交互与布局 (Docking Layout)
- **高自由度多标签系统**：完全自主实现的类 VS Code / Photoshop 窗口排版系统。
- **多层级任意嵌套**：支持 `Row` / `Column` 任意维度的视窗分割、嵌套容器及标签组管理。
- **响应式排版引擎**：侧边栏、状态栏、主内容区与多组工具面板的无缝切分。

### 💬 现代化的 AI 聊天底座
- **极速流式对话**：基于服务端推送事件（SSE）的无缝流式输出机制。
- **深度思考模式 (Reasoning)**：原生兼容 DeepSeek 等带有推理过程（Think Process）的模型，支持独立的思考面板渲染与折叠。
- **开发者友好的文本渲染**：工业级的 Markdown 解析，内嵌基于 `shiki` 的精确代码高亮引擎，支持一键复制。

### 🧠 健壮的“管家与大脑”双轴架构
- **Electron 外壳进程**：作为“管家”控制应用生命周期、多窗口管理及跨平台系统级事件。
- **C# 强类型数据核心**：作为“大脑”，负责掌控数据真理、LLM 接口并发调度、消息路由与上下文管理。前后端彻底解耦，摒弃了传统 Node.js 承担过重业务逻辑的弊端。

---

## 🗺️ 演进路线图 (Roadmap)

我们采取“骨架优先 -> 跑通闭环 -> 扩展生态”的渐进式构建策略：

- [x] **Phase 1: 核心骨架搭建** —— 跑通 Electron 渲染进程与 C# 本地 API 通信，实现基础对话与流式渲染。
- [x] **Phase 2: 专业级 UI 布局** —— 落地高定制化的 Docking 标签布局引擎，支持工作区的无限拆分。
- [ ] **Phase 3: 最小执行闭环** —— 引入可视化图节点库，打通 JSON 节点解析与单步执行逻辑。
- [ ] **Phase 4: 本地工具集与 AI 赋能** —— 实现 `ReadFile` / `WriteFile` 等本地基础能力，跑通 LLM 的 Function Calling (Tool Use) 链路。
- [ ] **Phase 5: 工作流与多智能体** —— 支持完整流程编排、多入口路由（接入外部 IM 服务）及多 Agent 协同。

---

## 🚀 快速开始

### 运行环境要求
- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- npm、yarn 或 pnpm

### 1. 启动本地执行大脑 (C# 后端)

打开终端，进入服务端目录并启动：

```bash
cd server/AgentdendriteServer
dotnet restore
dotnet run
```
> 后端引擎将默认在 `http://localhost:5068` 监听请求。

### 2. 启动应用主界面 (前端)

保持后端运行，打开另一个终端窗口：

```bash
# 在项目根目录下，安装依赖
npm install

# 启动 Electron 开发环境
npm run dev
```

### 3. 应用构建与打包

```bash
npm run typecheck   # TypeScript 类型校验
npm run lint        # ESLint 代码规范检查

# 生成各平台可执行文件
npm run build:win   # 打包 Windows 应用 (.exe)
npm run build:mac   # 打包 macOS 应用 (.dmg / .app)
npm run build:linux # 打包 Linux 应用 (.AppImage / .deb)
```

---

## 📂 项目结构概览

为了实现高度的模块化和前后端责任划分，项目采用如下结构：

```text
Agentdendrite/
├── src/                      # Electron 与前端界面
│   ├── main/                 # Electron 主进程 (生命周期、窗口与安全策略)
│   ├── renderer/             # Vue 3 渲染进程 (UI 层)
│   │   └── src/
│   │       ├── components/   # 全局基础组件 (包含 Docking 布局核心模块)
│   │       ├── views/        # 视窗级功能面板 (如 AiChat 等)
│   │       ├── assets/       # 全局样式、自定义滚动条与主题色盘
│   │       └── ...
│   └── preload/              # 安全预加载脚本
├── server/                   # .NET 9.0 业务核心大脑
│   └── AgentdendriteServer/
│       ├── Controllers/      # 控制器 (多渠道路由接入、LLM 数据流式转发)
│       ├── Utils/            # 工具类 (JsonlStore, 高性能序列化)
│       └── Data/             # 默认存储池 (会话记录、本地缓存)
└── build/                    # 应用打包与图标资源
```

## 📝 贡献与支持

Agentdendrite 目前正处于活跃的开发期，欢迎任何形式的贡献！
如果您发现了 Bug、有新的功能建议或希望参与开发，请随时提交 Issue 或 Pull Request。

### 推荐的开发工具
- [VS Code](https://code.visualstudio.com/) 配合 Volar 插件
- [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) 扩展

## 📄 许可证 (License)

本项目采用 [MIT License](LICENSE) 协议进行开源。
