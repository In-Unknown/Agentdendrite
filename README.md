c:\D\01-Projects\Agentdendrite\README.md
# Agentdendrite

> 个人 AI Agent 可视化工作流与操作系统

一款基于 **Electron + Vue 3 + C# ASP.NET Core** 构建的本地化 AI 智能体运行环境与工作流编排引擎。

## 🎯 项目定位

Agentdendrite 不是一个简单的聊天工具，而是一个**高度自由的本地化 AI 执行环境与工作流编排平台**。系统提供基础的"物理规律"——UI交互、节点编排、数据持久化、标准化的工具调用接口，所有的Agent行为、系统提示词和业务工作流均由用户（或具备工具调用能力的AI）自由探索和定义。

### 核心价值

- **提供画布，而非成品**：不预设特定业务逻辑，让用户自由创建和定义工作流
- **不会被模型升级淘汰**：无论大模型如何进化，它们要操作本地电脑、执行复杂任务，永远需要一个"落地执行层"
- **工作流即本地文件**：基于"工作流即本地文件"的设计，赋予AI基础的读写权限后，AI便能直接读取、解析甚至创建新的工作流
- **涌现的自我构建能力**：系统不存在专门用于"生成工作流的复杂代码"，"AI自己搭建工作流"仅仅是AI调用文件读写工具的自然结果

## 💡 核心哲学与愿景

**"提供画布，而非成品。"**

Agentdendrite 并不是一个预设好特定业务逻辑的垂直 AI 工具，而是一个**高度自由、可视化的本地 AI 执行底座**。系统仅提供最基础的"物理规律"——图形界面交互、节点编排能力、数据本地持久化、标准化的工具调用接口。所有的 Agent 行为、系统提示词和业务工作流，均交由用户（或具备工具调用能力的 AI）去自由探索和定义。

### 三大核心特性

- **拥抱模型进化，做坚实的基础设施**：无论云端的大模型如何迭代，它们要操作本地电脑环境、执行复杂多步网络请求或读写本地文件，永远需要一个"落地执行层"。本项目正是为此而生。
- **让工作流执行白盒化**：彻底抛弃隐式的 Prompt 路由和晦涩的终端脚本，提供比拟 VS Code 的专业图形界面，让大任务拆解、节点流转、状态与中间日志清晰可见。
- **"涌现"的自我构建能力**：基于"工作流即本地文件"的设计，赋予 AI 基础的读写权限后，AI 便能直接读取、解析甚至凭空创建新的工作流，实现能力上的自我扩展。

---

## ✨ 核心特性

项目已完成核心应用骨架和布局系统，具备以下成熟功能：

### 🛠️ 高级布局引擎 (Docking Layout System)
- **双模式布局系统**：
  - **网格标签组系统 (TabFolder)**：基于比例 (ratio) 的网格布局，支持水平和垂直方向分割
  - **自由标签组系统 (FreeFolder)**：基于坐标和尺寸的自由浮动布局，支持拖拽和层级管理
- **多层级任意嵌套**：支持无限层级的 `Canvas` 容器和 `Shell` 容器嵌套，实现复杂的 IDE 级布局
- **智能标签管理**：
  - 标签头位置可配置（top/bottom/left/right/none）
  - 支持标签激活切换和动态关闭
  - 三种叶子类型：normal（正常标签组）、placeholder（占位符）、singleton（单例组件）
- **多层架构支持**：支持多层布局叠加（如 topLayoutData、layoutData），实现复杂的界面层次结构
- **布局引擎核心**：内置布局操作引擎 (layoutEngine.ts、layoutActions.ts、layoutCoordinator.ts)，支持文件夹关闭、标签切换、节点查找、空容器修剪等操作
- **类型安全**：完整的 TypeScript 类型定义系统，使用品牌类型确保 ratio 字段在 0-1 范围内

### 💬 企业级 AI 聊天底座
- **极速流式对话**：基于服务端推送事件（SSE）的无缝流式输出机制，实时响应用户输入
- **深度思考模式 (Reasoning)**：原生兼容 DeepSeek 等带有推理过程（Think Process）的模型，支持 `reasoning_content` 字段解析与思考内容独立展示
- **开发者友好的文本渲染**：
  - 工业级 Markdown 解析（基于 marked），内嵌基于 `shiki` 的精确代码高亮引擎
  - 代码块支持一键复制、语言识别和语法高亮
  - 支持消息气泡、用户消息和 AI 消息的差异化展示
- **完整的数据持久化**：基于 JSONL 格式的聊天记录存储（JsonlStore.cs），支持历史会话加载
- **灵活的 API 集成**：支持 OpenAI 兼容协议，可配置不同的 LLM 提供商（DeepSeek、GPT-4 等）

### 🧠 健壮的"管家与大脑"双轴架构

### 架构设计理念

Agentdendrite 采用**混合架构设计**，将系统职责清晰划分为"应用外壳"和"执行引擎"两大部分：

- **Electron 外壳进程（管家）**：作为"管家"控制应用生命周期、多窗口管理及跨平台系统级事件
- **C# 强类型数据核心（大脑）**：作为"大脑"，负责掌控数据真理、LLM 接口并发调度、消息路由与上下文管理
- **前后端彻底解耦**：摒弃了传统 Node.js 承担过重业务逻辑的弊端，实现清晰的职责划分
- **混合架构优势**：结合 Electron 的跨平台能力和 C# 的强类型优势，为后续 Agent 开发奠定坚实基础

### 技术栈选择理由

- **Electron**：成熟的桌面应用框架，负责窗口管理、软件生命周期、系统级事件监听
- **Vue 3 + TypeScript**：现代化的前端技术栈，提供强大的响应式能力和类型安全
- **C# ASP.NET Core**：强类型、高性能的后端框架，适合处理复杂业务逻辑、并发调度和多线程任务
- **不随大流选择 JS/Python 而选择 C#**：在处理繁重的并发、本地进程拉起与多线程调度上，具有更天然的工程优势

### 数据模型与所有权

- **后端即真理**：后端才是真实数据的持有者
- **前端即视图**：前端保留数据只是为了方便渲染画面
- **同步机制**：前后端均持有数据副本，必须在特定时机保持同步
  - 第一次加载页面时：从后端拉取真理数据填充前端
  - 修改前端数据时：当 Vue 数据自动更新时，立即将更新推送到后端

---

## 🗺️ 演进路线图 (Roadmap)

我们采取"骨架优先 -> 跑通闭环 -> 扩展生态"的渐进式构建策略：

- [x] **Phase 1: 核心骨架搭建** —— 跑通 Electron 渲染进程与 C# 本地 API 通信，实现基础对话与流式渲染。
- [x] **Phase 2: 专业级 UI 布局** —— 落地高定制化的 Docking 标签布局引擎，支持双模式布局（网格 + 自由浮动）和无限嵌套。
- [ ] **Phase 3: 最小执行闭环** —— 引入可视化图节点库，打通 JSON 节点解析与单步执行逻辑。
- [ ] **Phase 4: 本地工具集与 AI 赋能** —— 实现 `ReadFile` / `WriteFile` 等本地基础能力，跑通 LLM 的 Function Calling (Tool Use) 链路。
- [ ] **Phase 5: 工作流与多智能体** —— 支持完整流程编排、多入口路由（接入外部 IM 服务）及多 Agent 协同。

### 当前进度：Phase 1-2 已完成，正在准备 Phase 3

#### 已完成模块

**Phase 1: 核心骨架搭建** ✅
- Electron 主进程与渲染进程架构已搭建完成
- C# ASP.NET Core 后端 API 服务器已就绪（端口 5068）
- 跨平台安全策略配置（CSP、证书错误处理）
- 完整的 LLM 流式对话链路已打通：
  - 支持标准 OpenAI 兼容协议（DeepSeek、GPT-4 等）
  - 原生支持推理过程（Thinking/Reasoning）解析
  - SSE 流式实时响应
  - JSONL 格式聊天记录持久化

**Phase 2: 专业级 UI 布局** ✅
- 完整的布局引擎系统已实现：
  - 类型安全的布局数据模型（PageLayout.ts）
  - 高效的布局操作引擎（layoutEngine.ts、layoutActions.ts、layoutCoordinator.ts）
  - 响应式状态管理（useLayout.ts）
  - 工具类函数库（LayoutUtils.ts）
- 双模式布局支持：
  - **网格标签组系统**：基于比例的网格布局，支持水平/垂直分割
  - **自由标签组系统**：基于坐标和尺寸的自由浮动布局
- 核心视图组件：
  - TabFolder.vue - 网格标签组容器
  - FreeFolder.vue - 自由标签组容器
  - TabPanel.vue - 标签页面板
  - LayerRoot.vue - 多层布局根容器
  - LayoutWorkspace.vue - 布局工作空间
- 高级特性：
  - 多层级任意嵌套支持
  - 智能标签管理（激活/关闭/单例）
  - 保护机制防止关键节点误删
  - 空容器自动修剪

#### 核心应用功能

**企业级 AI 聊天系统** ✅
- 完整的聊天界面组件体系：
  - MessageList.vue - 消息列表容器
  - AiMessage.vue - AI 消息展示组件
  - UserMessage.vue - 用户消息展示组件
  - ChatInput.vue - 聊天输入框
- 富文本渲染能力：
  - MarkdownBlock.vue - Markdown 渲染器
  - CodeBlock.vue - 代码块高亮（基于 Shiki）
  - 代码块一键复制功能
- SVG 图标组件库：
  - BotIcon、SendIcon、MicrophoneIcon、StarIcon 等
- 完整的前后端通信链路已建立

#### 技术架构亮点

**混合架构已落地** ✅
- Electron 外壳进程：窗口管理、生命周期、安全策略
- C# 强类型后端：LLM 接口调度、消息路由、数据持久化
- 前后端彻底解耦：清晰的职责划分和通信机制
- 类型安全保障：TypeScript + C# 双重类型系统

### MVP 30天冲刺计划

基于项目核心定位，我们将锁定并打通最核心的物理链路：

- **第1阶段：壳与骨架通信**
  - 完成 Electron 外壳的搭建，实现对 C# 后端的正确拉起、端口分配与随动关闭
  - 实现前端与后端的本地 API 通信连通

- **第2阶段：核心运行时（最小执行闭环）**
  - 定义并实现 1-3 个最基础的节点类型（如：文本输入节点、调用 LLM 节点、输出节点）
  - 后端实现最简版的工作流解析器：能读取一段 JSON（代表图连线），按顺序将上一个节点的输出传给下一个节点，并打出日志

- **第3阶段：基建工具与 AI 赋能（生命注入）**
  - 实现两个不可或缺的内置工具：`ReadFile` 和 `WriteFile`
  - 跑通大模型的 Function Calling / Tool Use 机制，使得在聊天框输入指令时，AI 能够准确理解并调用上述两个本地文件工具

- **第4阶段：极简前端交互**
  - 引入现成的前端节点图库（React Flow 等），实现"在界面上拖拽两个节点并连线 -> 保存为本地 JSON 文件"
  - 提供一个基础的对话框界面，能与大模型对话，并展示其调用工具的中间状态

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
│   │   └── index.ts          # 主进程入口
│   ├── renderer/             # Vue 3 渲染进程 (UI 层)
│   │   └── src/
│   │       ├── features/     # 功能模块
│   │       │   └── layout/   # 布局引擎系统
│   │       │       ├── logic/        # 布局逻辑引擎
│   │       │       │   ├── layoutEngine.ts     # 布局操作引擎
│   │       │       │   ├── layoutActions.ts   # 布局动作定义
│   │       │       │   └── layoutCoordinator.ts # 布局协调器
│   │       │       ├── models/       # 布局数据模型
│   │       │       │   ├── PageLayout.ts       # 布局类型定义
│   │       │       │   └── LayoutUtils.ts      # 布局工具函数
│   │       │       ├── stores/       # 布局状态管理
│   │       │       │   └── useLayout.ts         # 布局状态 Hook
│   │       │       └── views/        # 布局视图组件
│   │       │           ├── FreeFolder.vue        # 自由标签组
│   │       │           ├── TabFolder.vue         # 网格标签组
│   │       │           ├── TabPanel.vue          # 标签面板
│   │       │           ├── LayerRoot.vue          # 多层布局根容器
│   │       │           └── LayoutWorkspace.vue    # 布局工作空间
│   │       ├── views/        # 视窗级功能面板
│   │       │   └── tabs/     # 标签页组件
│   │       │       └── AiChat/ # AI 聊天模块
│   │       │           ├── MessageBlock/  # 消息块组件
│   │       │           │   ├── CodeBlock.vue      # 代码块
│   │       │           │   └── MarkdownBlock.vue  # Markdown 渲染器
│   │       │           ├── Svg/           # SVG 图标
│   │       │           │   ├── BotIcon.vue        # 机器人图标
│   │       │           │   ├── SendIcon.vue       # 发送图标
│   │       │           │   ├── MicrophoneIcon.vue # 麦克风图标
│   │       │           │   ├── StarIcon.vue       # 星标图标
│   │       │           │   ├── ToolIcon.vue       # 工具图标
│   │       │           │   └── ChevronDownIcon.vue # 下拉图标
│   │       │           ├── AiMessage.vue  # AI 消息组件
│   │       │           ├── ChatInput.vue  # 聊天输入组件
│   │       │           ├── MessageList.vue # 消息列表组件
│   │       │           ├── UserMessage.vue # 用户消息组件
│   │       │           └── index.vue      # 聊天主组件
│   │       ├── assets/       # 全局样式与主题
│   │       │   ├── skins/    # 自定义滚动条样式
│   │       │   ├── base.css
│   │       │   └── main.css
│   │       ├── App.vue       # 根组件
│   │       └── main.ts       # 应用入口
│   └── index.html            # 渲染进程 HTML 模板
├── server/                   # .NET 9.0 业务核心大脑
│   └── AgentdendriteServer/
│       ├── Controllers/      # 控制器
│       │   └── ChatFeature/ # 聊天功能模块
│       │       ├── LlmController.cs      # LLM 控制器
│       │       ├── LlmModels.cs          # LLM 数据模型
│       │       └── LlmService.cs         # LLM 服务
│       ├── Utils/            # 工具类
│       │   ├── JsonlStore.cs             # JSONL 存储
│       │   └── JsonConvert.cs            # JSON 转换工具
│       ├── Data/             # 数据存储
│       │   └── ChatFeature/  # 聊天数据
│       │       └── chatData.jsonl        # 聊天记录
│       ├── Properties/       # 项目属性
│       │   └── launchSettings.json       # 启动配置
│       ├── AgentdendriteServer.csproj    # 项目文件
│       └── Program.cs        # 应用入口
├── build/                    # 应用打包资源
│   ├── entitlements.mac.plist # macOS 权限配置
│   ├── icon.ico              # Windows 图标
│   ├── icon.icns             # macOS 图标
│   └── icon.png              # 通用图标
├── resources/                # 应用资源
│   └── icon.png              # 应用图标
├── .docs/                    # 项目文档
│   ├── plans/                # 实现计划
│   └── reviews/              # 代码审查记录
├── .vscode/                  # VS Code 配置
│   ├── extensions.json        # 推荐扩展
│   └── settings.json         # 编辑器设置
├── package.json              # Node.js 依赖配置
├── todo.md                   # 开发任务列表
├── 大框架.md                 # 混合架构设计文档
└── README.md                 # 项目说明文档
```

## 🎯 技术实现亮点

### 前端架构：高级布局引擎

项目的布局引擎采用了创新的**双模式架构**，完美融合了传统 IDE 的稳定性和现代桌面应用的灵活性：

#### 1. 核心数据模型

- **类型安全**：完整的 TypeScript 类型定义系统，支持编译时类型检查
- **品牌类型**：使用品牌类型（Branded Types）确保 ratio 字段在 0-1 范围内
- **联合类型**：灵活的联合类型设计，支持多种容器和叶子节点的组合

#### 2. 布局操作引擎

布局引擎 (`layoutEngine.ts`) 提供了高效的状态管理机制：

- **动作分发**：基于 Redux 模式的 action-dispatch 架构
- **递归查找**：高效的递归算法在复杂的嵌套结构中查找和操作节点
- **多层级支持**：支持多个布局层（如 topLayoutData、layoutData）的协同工作
- **保护机制**：通过 `protected` 标记防止关键节点被误删除

#### 3. 状态管理

- **响应式数据**：使用 Vue 3 的 `reactive` API 实现布局状态的响应式更新
- **中央化状态**：通过 `useLayout.ts` 实现布局状态的中央化管理
- **类型推断**：完整的类型推断支持，减少运行时错误

### 聊天系统架构

#### 1. 前端组件化设计

- **模块化组件**：聊天系统被拆分为多个独立的 Vue 组件
- **关注点分离**：消息列表、输入框、消息块等各司其职
- **可复用性**：SVG 图标组件可在整个应用中复用

#### 2. 数据流处理

- **流式响应**：基于 SSE 的流式数据处理，实现实时响应
- **状态同步**：前后端数据同步机制，确保数据一致性
- **持久化存储**：JSONL 格式的聊天记录存储，支持历史数据查询

### 后端架构：C# Web API 开发蓝图

#### 1. 数据存储策略：从文件到数据库的进化

- **静态配置**：使用 `appsettings.json`，利用强类型绑定 `IConfiguration`
- **当前实现**：聊天数据采用 **JSONL 文件存储**（轻量级、易读写）
- **未来规划**：统一使用 **EF Core + 数据库**，采用 **SQLite**，具备文件的便携性和 SQL 的查询能力

#### 2. 业务组织架构：垂直切片模式

- **当前实现**：按功能模块组织代码（Controllers/ChatFeature/）
- **目录结构规范**：
  ```text
  /Controllers
      /ChatFeature
          LlmController.cs      (入口：负责接待)
          LlmService.cs         (逻辑：负责执行)
          LlmModels.cs          (模型：负责数据结构定义)
  /Utils
      JsonlStore.cs            (工具：负责数据存储)
      JsonConvert.cs           (工具：负责 JSON 转换)
  ```
- **优势**：修改"聊天"功能时，相关代码集中在同一目录下

#### 3. 跨业务调用与公共逻辑

- **共享模型与逻辑的"公海" (Utils 层)**：被多个业务模块使用的模型或工具逻辑（如 JsonlStore、JsonConvert）
- **服务间依赖注入 (Service-to-Service)**：在 `LlmService` 的构造函数中注入 `IHttpClientFactory`
- **领域层提取 (Domain Layer)**：未来将核心实体提取到项目根目录的 `Domain` 文件夹中

#### 4. 依赖注入 (DI) 的必要性

- **配置传参**：通过 `IConfiguration` 注入，直接读取 `appsettings.json`
- **HttpClient 生命周期**：通过依赖注入管理 HttpClient 实例，避免 Socket 耗尽
- **服务注册**：在 Program.cs 中统一注册所有服务（AddControllers、AddHttpClient、AddScoped 等）

#### 5. 前端交互与约定

- **路径约定**：遵循 `api/[controller]/[action]`
- **Swagger 自动化**：已开启 OpenAPI，代码变动文档即刻更新（`app.MapOpenApi()`）
- **DTO 强约束**：
  - 输入：使用 `xxxRequest` 类（如未来的 SendMessageRequest）
  - 输出：使用 `xxxResponse` 类（如 AssistantMessage）
  - **禁忌**：绝对不要把数据库实体直接扔给前端
- **CORS 配置**：支持开发环境的跨域请求，可配置允许的源列表

### 混合架构优势

- **前后端解耦**：Electron 负责界面，C# 负责业务逻辑，职责清晰
- **类型安全**：C# 的强类型系统和 TypeScript 的类型检查双重保障
- **性能优化**：C# 后端处理复杂业务逻辑，前端专注于 UI 渲染
- **扩展性强**：模块化设计便于后续功能扩展和维护

### 前端 API 调用架构

当前项目采用**API 层结构**来管理前后端通信：

- **统一 HTTP 请求封装**：创建 `src/api/http.js` 统一配置 axios
- **按模块封装 API**：如 `src/api/userApi.js`，将 URL 封装成函数
- **Vue 页面调用方式**：不再直接写 URL，而是调用 API 函数
- **重构策略**：逐步迁移，新功能全部使用 API 层，旧代码保持不动

### 相比同类项目的优势

Agentdendrite 在设计之初就解决了同类开源项目的几个核心痛点：

1. **从 CLI/YAML 到 可视化 GUI**：彻底抛弃了在终端运行、靠修改晦涩的 YAML 文件和 Markdown 来定义技能的原始方式
2. **从隐式 Prompt 路由 到 显式节点编排**：复杂任务不再全靠 AI 的"盲猜"，用户可以通过工作流将一个大任务拆解，每一步该调用工具还是该进行逻辑运算，清晰可见
3. **更健壮的后端底座**：使用 C# Web API 替代 Node.js，在处理繁重的并发、本地进程拉起与多线程调度上，具有更天然的工程优势
4. **进化闭环**：因为"工作流即标准文本文件"的设计，赋予了系统极强的自扩展能力

---

## 📝 贡献与支持

Agentdendrite 目前正处于活跃的开发期，欢迎任何形式的贡献！
如果您发现了 Bug、有新的功能建议或希望参与开发，请随时提交 Issue 或 Pull Request。

### 推荐的开发工具
- [VS Code](https://code.visualstudio.com/) 配合 Volar 插件
- [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) 扩展

## 📄 许可证 (License)

本项目采用 [MIT License](LICENSE) 协议进行开源。
