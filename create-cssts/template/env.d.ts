/// <reference types="vite/client" />

// CssTs 文件类型声明
declare module '*.cssts' {
  const styles: Record<string, string | string[]>
  export default styles
}
