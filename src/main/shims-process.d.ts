declare namespace NodeJS {
  interface Process {
    env: NodeJS.ProcessEnv
    platform: NodeJS.Platform
  }
}
