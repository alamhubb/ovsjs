import * as fs from 'fs'
import * as path from 'path'
import {fileURLToPath} from 'url'
import JsonUtil from "./utils/JsonUtil";

export class LogUtil {
    private static logFilePath: string

    static {
        // 获取当前文件的目录
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        this.logFilePath = path.join(__dirname, 'templog.txt')

        // 确保文件存在
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, '=== Log Started ===\n')
        }
    }

    static log(data?: any, msg = null) {
        // JsonUtil.log(data)
        try {
            const timestamp = new Date().toISOString()
            // let logMessage = `\n[${timestamp}]`
            let logMessage = ``

            if (data !== undefined) {
                if (typeof data === 'object') {
                    logMessage += '\n' + JSON.stringify(data, null, 2)
                } else {
                    logMessage += '\n' + String(data)
                }
            }

            // logMessage += '\n' + '='.repeat(80) + '\n'

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
