# PowerShell辅助函数 - AI直接调用
# 自动处理base64编码
# 使用方式: .\tests\ai\log-helper.ps1 "中文消息"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# 转换为base64
$bytes = [Text.Encoding]::UTF8.GetBytes($Message)
$base64 = [Convert]::ToBase64String($bytes)

# 调用Node.js脚本
node tests/ai/log.js $base64

