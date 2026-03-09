# Agentdendrite

一款基于 Electron + Vue 3 + ASP.NET Core 的 AI 聊天应用，支持流式响应和本地数据存储。

## 功能特性

- **实时流式对话**：支持 AI 助手的流式响应，实现流畅的聊天体验
- **思考过程展示**：支持显示 AI 的思考内容（reasoning）和回复内容
- **Markdown 渲染**：完整支持 Markdown 格式，包括代码高亮
- **本地数据存储**：使用 JSONL 格式存储聊天记录，支持历史对话加载
- **现代化界面**：基于 Vue 3 的响应式设计，提供优秀的用户体验

## 技术栈

### 前端
- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **electron-vite** - 快速的 Electron 构建工具
- **marked** - Markdown 解析器
- **shiki** - 语法高亮引擎

### 后端
- **ASP.NET Core 9.0** - 高性能 Web 框架
- **C#** - 现代化的编程语言

## 项目结构

```
Agentdendrite/
├── src/
│   ├── main/              # Electron 主进程
│   ├── renderer/          # Vue 渲染进程
│   │   └── src/
│   │       ├── components/
│   │       ├── views/
│   │       │   └── tabs/AiChat/  # AI 聊天功能
│   │       └── assets/
│   └── preload/          # 预加载脚本
├── server/
│   └── AgentdendriteServer/      # ASP.NET Core 后端
│       ├── Controllers/          # API 控制器
│       │   └── ChatFeature/      # 聊天功能相关
│       ├── Data/                 # 数据存储
│       └── Utils/                # 工具类
└── build/               # 构建资源
```

## 快速开始

### 环境要求

- Node.js 18+ 
- .NET 9.0 SDK
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
npm install

# 后端依赖会通过 .NET 自动还原
cd server/AgentdendriteServer
dotnet restore
```

### 开发模式

#### 启动后端服务器

```bash
cd server/AgentdendriteServer
dotnet run
```

后端服务器将在 `http://localhost:5068` 启动

#### 启动前端应用

```bash
npm run dev
```

这将启动 Electron 开发环境，自动打开应用窗口

### 构建

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 构建应用
npm run build

# 打包为可执行文件
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## API 端点

后端服务器提供以下 API：

### 聊天功能

- `POST /api/Llm/stream` - 流式 AI 响应
- `POST /api/Llm/full` - 完整 AI 响应
- `GET /api/Llm/clone` - 获取聊天历史记录

## 配置

后端配置文件位于 `server/AgentdendriteServer/appsettings.json`：

```json
{
  "Cors": {
    "AllowedOrigins": []  // 配置允许的跨域来源
  }
}
```

## 开发建议

### 推荐的 IDE 设置

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)

## 许可证

本项目采用 MIT 许可证

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。
