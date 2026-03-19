c:\D\01-Projects\Agentdendrite\TECH_DEBT.md
# TODO: 重构前端 API 调用方式

当前项目的前端直接在 Vue 组件中 **硬编码 URL** 来请求接口，例如：

```js
axios.get("http://xxx/api/some/path")
```

这种方式短期开发比较快，但随着项目增长会产生一些问题：

* URL 分散在大量 Vue 文件中
* 后端地址或路径变化时需要全局搜索修改
* 请求逻辑（token、错误处理等）无法统一管理
* 代码可读性下降
* API 难以集中管理

因此后续需要逐步重构为 **API 层结构**。

---

# 目标结构

在 `src` 下新增 `api` 目录：

```
src
 ├ api
 │   ├ http.js
 │   ├ userApi.js
 │   ├ otherApi.js
 │
 ├ views
 ├ components
```

---

# 1 统一 HTTP 请求封装

创建：

```
src/api/http.js
```

示例：

```js
import axios from "axios"

const http = axios.create({
  baseURL: "http://backend-url/api",
  timeout: 10000
})

export default http
```

以后所有接口请求都通过这个实例发送。

---

# 2 按模块封装 API

例如：

```
src/api/userApi.js
```

示例：

```js
import http from "./http"

export function getUsers() {
  return http.get("/users")
}

export function getUser(id) {
  return http.get(`/users/${id}`)
}

export function createUser(data) {
  return http.post("/users", data)
}
```

本质就是：

**把 URL 封装成函数。**

---

# 3 Vue 页面调用方式

Vue 不再直接写 URL，而是调用 API 函数：

```js
import { getUsers } from "@/api/userApi"

async mounted() {
  const users = await getUsers()
  this.users = users.data
}
```

调用链：

```
Vue组件
 ↓
API函数
 ↓
HTTP请求
 ↓
URL
```

---

# 4 重构策略

不需要一次性重构整个项目，可以 **逐步迁移**：

1. 新功能全部使用 API 层
2. 旧代码保持不动
3. 有时间再逐步替换旧 URL

---

# 5 当前优先级

当前阶段仍然优先开发功能，例如：

* 拖动标签组
* 分区功能
* UI 交互完善

API 层重构可以作为 **中期代码整理任务**，不阻塞当前功能开发。

---

# 备注

核心原则：

**Vue 页面不直接写 URL，统一通过 API 层调用接口。**
