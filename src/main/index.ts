// src/main/index.ts
import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染进程热更新
  // 开发环境加载远程 URL，生产环境加载本地 html 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 此方法将在 Electron 完成初始化并准备创建浏览器窗口时调用
// 某些 API 只能在此事件发生后使用
app.whenReady().then(() => {
  // 设置 Windows 应用的用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  const backendPorts = [5068, 7085]

  // 定义允许的后端地址列表
  const allowedOrigins = backendPorts.flatMap((port) => [
    `http://localhost:${port}`,
    `https://localhost:${port}`
  ])

  // 2. 为所有会话设置 Content-Security-Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      // 动态拼接生成的 URL 列表
      `connect-src 'self' ${allowedOrigins.join(' ')}`
    ]

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives.join('; ')]
      }
    })
  })

  // 3. 忽略这些端口的证书错误
  app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
    // 检查请求的 URL 是否在我们的允许列表内
    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin))

    if (isAllowed) {
      event.preventDefault()
      callback(true) // 信任证书
    } else {
      callback(false)
    }
  })

  // 开发环境默认按 F12 打开或关闭 DevTools
  // 生产环境忽略 CommandOrControl + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，点击 Dock 图标且没有其他窗口打开时
    // 通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都关闭时退出应用，macOS 除外
// 在 macOS 上，应用和菜单栏通常会保持活动状态
// 直到用户使用 Cmd + Q 显式退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在此文件中，你可以包含应用特定的主进程代码
// 也可以将它们放在单独的文件中，然后在这里引入
