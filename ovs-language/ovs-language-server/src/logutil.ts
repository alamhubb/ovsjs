import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const logPath = path.join(os.tmpdir(), 'ovs-language-server.log')

export class LogUtil {
  static log(...values: unknown[]) {
    const line = values
      .map(value => typeof value === 'string' ? value : JSON.stringify(value))
      .join(' ')
    fs.appendFileSync(logPath, line + '\n', 'utf8')
  }
}
