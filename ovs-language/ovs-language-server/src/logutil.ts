import * as fs from 'fs'
import * as path from 'path'

export class LogUtil {
    private static logFilePath: string

    static {
        // 兼容 CJS 和 ESM：使用 __dirname（CJS 提供）
        // @ts-ignore - __dirname 在 CJS 中可用
        const dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
        this.logFilePath = path.join(dir, 'templog.txt')

        // 确保文件存在
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, '=== Log Started ===\n')
        }
    }

    static log(...datas) {
        // JsonUtil.log(data)
        try {
            const timestamp = new Date().toISOString()
            let logMessage = `\n[${timestamp}]`

          for (const data of datas) {
            if (data !== undefined) {
              if (typeof data === 'object') {
                logMessage += '\n' + JSON.stringify(data, null, 2)
              } else {
                logMessage += '\n' + String(data)
              }
            }
          }
            logMessage += '\n' + '='.repeat(80) + '\n'

            fs.appendFileSync(this.logFilePath, logMessage)
        } catch (error) {
            console.error('Failed to write log:', error)
        }
    }

    static clear() {
        try {
            fs.writeFileSync(this.logFilePath, '=== Log Cleared ===\n')
        } catch (error) {
            console.error('Failed to clear log:', error)
        }
    }
}
