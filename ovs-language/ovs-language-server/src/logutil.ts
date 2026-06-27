import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logPath = path.join(__dirname, 'templog.txt')

export class LogUtil {
  static log(...values: unknown[]) {
    const line = values
      .map(value => typeof value === 'string' ? value : JSON.stringify(value))
      .join(' ')
    fs.appendFileSync(logPath, line + '\n', 'utf8')
  }
}
