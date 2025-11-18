/**
 * Subhuti Validation Logger - 统一的日志工具
 * 
 * 功能：
 * 1. 提供统一的日志接口
 * 2. 支持日志级别控制
 * 3. 支持按规则名过滤日志
 * 4. 性能优化：日志关闭时零开销
 * 
 * @version 1.0.0
 */

/**
 * 日志级别
 */
export enum LogLevel {
    NONE = 0,    // 不输出任何日志
    ERROR = 1,   // 只输出错误
    WARN = 2,    // 输出警告和错误
    INFO = 3,    // 输出信息、警告和错误
    DEBUG = 4    // 输出所有日志（包括调试信息）
}

/**
 * 日志配置
 */
export interface LoggerConfig {
    /** 日志级别 */
    level: LogLevel
    
    /** 启用日志的规则名列表（为空表示所有规则） */
    enabledRules?: string[]
    
    /** 是否输出到文件 */
    outputToFile?: boolean
    
    /** 文件路径 */
    filePath?: string
}

/**
 * 验证日志工具
 */
export class SubhutiValidationLogger {
    private static config: LoggerConfig = {
        level: LogLevel.NONE,  // 默认关闭所有日志
        enabledRules: []
    }
    
    /**
     * 配置日志
     * 
     * @param config 日志配置
     */
    static configure(config: Partial<LoggerConfig>): void {
        this.config = {
            ...this.config,
            ...config
        }
    }
    
    /**
     * 检查是否应该输出日志
     * 
     * @param level 日志级别
     * @param ruleName 规则名（可选）
     * @returns 是否应该输出
     */
    private static shouldLog(level: LogLevel, ruleName?: string): boolean {
        // 检查日志级别
        if (this.config.level < level) {
            return false
        }
        
        // 检查规则名过滤
        if (ruleName && this.config.enabledRules && this.config.enabledRules.length > 0) {
            if (!this.config.enabledRules.includes(ruleName)) {
                return false
            }
        }
        
        return true
    }
    
    /**
     * 输出调试日志
     * 
     * @param message 消息
     * @param ruleName 规则名（可选）
     */
    static debug(message: string, ruleName?: string): void {
        if (!this.shouldLog(LogLevel.DEBUG, ruleName)) {
            return
        }
        console.log(`[DEBUG] ${message}`)
    }
    
    /**
     * 输出信息日志
     * 
     * @param message 消息
     * @param ruleName 规则名（可选）
     */
    static info(message: string, ruleName?: string): void {
        if (!this.shouldLog(LogLevel.INFO, ruleName)) {
            return
        }
        console.log(`[INFO] ${message}`)
    }
    
    /**
     * 输出警告日志
     * 
     * @param message 消息
     * @param ruleName 规则名（可选）
     */
    static warn(message: string, ruleName?: string): void {
        if (!this.shouldLog(LogLevel.WARN, ruleName)) {
            return
        }
        console.warn(`[WARN] ${message}`)
    }
    
    /**
     * 输出错误日志
     * 
     * @param message 消息
     * @param ruleName 规则名（可选）
     */
    static error(message: string, ruleName?: string): void {
        if (!this.shouldLog(LogLevel.ERROR, ruleName)) {
            return
        }
        console.error(`[ERROR] ${message}`)
    }
    
    /**
     * 获取当前配置
     */
    static getConfig(): LoggerConfig {
        return { ...this.config }
    }
    
    /**
     * 重置配置为默认值
     */
    static reset(): void {
        this.config = {
            level: LogLevel.NONE,
            enabledRules: []
        }
    }
}

