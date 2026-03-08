# 2026-03-07 今日todo ✅ 已完成

根据你的描述，我帮你把今天的任务整理成清晰的两步走计划，并补充一些技术要点，方便你落地执行。

---

## 今日核心目标：实现一个基本的"用户消息 → 后端存储 → 调用云端LLM → 流式返回前端"的闭环。

### ✅ 第一步（必须完成）：后端API开发 [ ✅ 已完成 ]

**目标**：创建一个POST接口，接收前端消息，存入会话记录，调用云端大模型并流式返回。

**子任务拆解**：

1. **创建API端点** ✅
   - 在控制器（Controller）中新建一个路由，比如 `POST /api/chat`。
   - 确保路由能接收JSON格式的请求体（Body）。

2. **解析请求体** ✅
   - 定义请求的数据结构（例如：`{ role: "user", content: "消息内容" }`）。
   - 从请求中解析出消息内容。

3. **存储消息到后端** ✅
   - 维护一个会话数组（可用JSON文件、内存变量或简单数据库）。
   - 将接收到的消息追加到当前会话上下文中。

4. **调用云端LLM并流式返回** ✅
   - 将会话上下文（全部历史消息）发送给大模型API（如OpenAI、DeepSeek等）。
   - 使用流式接口（如SSE或fetch流）接收模型返回的逐词响应。
   - **边接收边转发**：将模型返回的每个数据块直接通过HTTP流发送给前端，不要等完整响应。

**技术提醒**：

- 如何读取Body：在Spring Boot中可用`@RequestBody`，在Node.js（Express）中可用`body-parser`。
- 存储：简单起见可先用内存数组，后续再考虑持久化。
- 流式转发：如果后端用Java，可用`SseEmitter`或`Flux`；如果用Node.js，可用`res.write()`配合`stream`。

---

### ✅ 第二步（第一步完成后有余力）：前端对接流式响应 [ ✅ 已完成 ]

**目标**：前端能够发送消息到后端，并实时接收流式数据更新页面。

**子任务拆解**：

1. **前端发送POST请求** ✅
   - 在Vue组件中，将用户输入的消息包装成 `{ role: "user", content: "..." }` 格式。
   - 使用 `fetch` 或 `axios` 发送POST请求到 `http://后端地址/api/chat`。

2. **处理流式响应** ✅
   - 因为后端返回的是流，前端需要用 `fetch` 的 `response.body` 获取 `ReadableStream`，并通过 `TextDecoder` 逐步解析数据。
   - 或者如果后端使用Server-Sent Events (SSE)，则用 `EventSource` 监听。

3. **更新页面数据** ✅
   - 将接收到的每个数据块追加到Vue的响应式数组（如 `messages`）中。
   - 注意：AI的回复可能是一个完整的消息，需要按角色（assistant）存储。

**技术提醒**：

- 如果使用 `fetch` 处理流，示例代码：
  ```javascript
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content: msg })
  })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    // 解析chunk（可能按行或按约定格式），追加到消息列表
  }
  ```
- 如果后端返回的是纯文本流，前端可能需要自己拼接完整消息，但显示时可以实时追加。

## 今日执行建议

1. ✅ **先完成后端第一步**，确保能通过Postman或curl测试：
   - 发送一个消息，能看到后端正确调用模型并流式返回内容。
2. ✅ **再开发前端第二步**，让页面真正动起来。
3. ✅ 如果时间不够，第二步可以简化：先用console.log打印接收到的流，确认通信正常后再接入UI。

---

## 今日总结

✅ **所有任务已完成**：成功实现了完整的"用户消息 → 后端存储 → 调用云端LLM → 流式返回前端"闭环，包括：
- 后端API开发：LlmController、LlmService、JsonlStore等核心组件
- 前端流式响应：完整的聊天界面，支持实时流式显示和历史记录加载
- 数据持久化：JSONL格式的聊天记录存储
- 思考过程支持：AI推理内容的独立显示和折叠

---

# 2026-03-08 明日todo（重新规划）

## 核心目标：实现多标签布局系统（第一阶段）

> 对了，别忘了把侧边的滚动条的底色和颜色都调暗一些。

根据《标签思考.md》的设计文档，实现类似IDE或Photoshop的高自由度、可嵌套的标签页系统（Docking Layout System）。

**说明**：原计划工作量过大（预计12-15小时），不适合在一天内完成。现调整为第一阶段核心架构，预计7-10小时。

---

## 第一部分：文件结构和类型定义（1-2小时）

### 1. 创建目录结构
- `src/renderer/src/components/layout/` - 布局组件目录
- `src/renderer/src/components/layout/LayoutContainer.vue` - 容器组件
- `src/renderer/src/components/layout/TabGroup.vue` - 标签组组件
- `src/renderer/src/components/layout/TabContent.vue` - 标签内容组件
- `src/renderer/src/types/layout.ts` - 布局相关类型定义

### 2. 定义TypeScript类型系统
- `LayoutNode` - 布局节点基础接口
- `ContainerNode` - 容器节点类型（支持row/column方向）
- `TabGroupNode` - 标签组节点类型
- `Tab` - 标签数据接口
- `HeaderPosition` - 标签头位置枚举

---

## 第二部分：核心组件实现（4-5小时）

### 1. LayoutContainer.vue（2小时）
- 支持水平（row）和垂直（column）布局方向
- 递归渲染子节点（容器或标签组）
- 响应式尺寸调整（基于百分比）
- 基础Flex布局实现
- 处理sizes属性进行尺寸分配

### 2. TabGroup.vue（1.5小时）
- 标签头列表渲染（根据headerPosition调整布局）
- 当前激活标签的内容显示
- 标签点击切换逻辑
- 标签头位置切换（顶部/底部/左侧/右侧）

### 3. TabContent.vue（0.5小时）
- 动态组件渲染（使用Vue的`<component :is>`）
- 支持不同类型的内容组件

---

## 第三部分：基础静态渲染验证（2-3小时）

### 1. 创建测试数据和状态管理
- 设计简单的JSON Schema测试数据
- 创建基础的布局状态store
- 实现简单的序列化和反序列化

### 2. 渲染验证
- 简单的单标签组布局验证
- 左右分栏布局验证
- 上下分栏布局验证
- 确认递归渲染正常

### 3. 集成现有聊天组件
- 将现有AiChat组件作为标签内容
- 确保聊天功能在新的布局系统中正常工作

---

## 第二阶段：基础交互功能（移至后续天）

以下功能移到后续天实现，避免第一天工作量过大：

- 分割线拖拽调整比例
- 右键菜单功能（关闭标签、切换位置等）
- 标签添加/删除功能
- 布局状态持久化
- 工具模式
- 拖拽重组
- 网格容器

---

## 技术提醒

### Vue 3 组件设计要点
1. **递归组件**：使用组件的`name`属性实现递归调用
2. **动态组件**：使用`<component :is="tab.component">`渲染不同内容
3. **响应式数据**：使用Vue 3的`ref`和`reactive`管理布局状态
4. **类型安全**：充分利用TypeScript的类型检查

### 布局算法要点
1. **Flex布局**：使用CSS Flexbox实现容器布局
2. **百分比计算**：使用`calc()`或直接百分比设置尺寸
3. **递归渲染**：确保组件能正确处理嵌套结构
4. **性能优化**：避免不必要的重渲染

### 数据结构示例

```typescript
interface Tab {
  id: string
  title: string
  icon?: string
  component: string
  data?: any
}

interface ContainerNode {
  type: 'container'
  id: string
  direction: 'row' | 'column'
  children: LayoutNode[]
  sizes: number[]
}

interface TabGroupNode {
  type: 'tabGroup'
  id: string
  tabs: Tab[]
  activeTabId: string
  headerPosition: 'top' | 'bottom' | 'left' | 'right'
}

type LayoutNode = ContainerNode | TabGroupNode
```

---

## 明日执行建议

1. **先完成类型定义**，确保数据结构清晰
2. **再实现基础组件**，确保静态渲染正常
3. **最后进行集成测试**，将现有聊天组件集成到新布局中
4. **保持现有聊天功能**，确保向后兼容
5. **重点验证核心架构**，确保递归渲染和布局逻辑正确

---

## 时间预估

| 阶段 | 预估时间 | 关键产出 |
|------|---------|----------|
| 文件结构和类型定义 | 1-2小时 | 完整的类型系统 |
| 核心组件实现 | 4-5小时 | 三个核心组件 |
| 静态渲染验证 | 2-3小时 | 可运行的布局系统 |
| **总计** | **7-10小时** | **基础架构完成** |

---

## 后续规划（2026-03-09及之后）

1. 第二阶段：基础交互功能（分割线拖拽、右键菜单）
2. 第三阶段：动态管理（添加/删除标签、状态持久化）
3. 第四阶段：高级功能（拖拽重组、网格容器、工具模式）

---
