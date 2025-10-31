$ErrorActionPreference = "Continue"

Write-Host "开始测试，超时时间15秒..." -ForegroundColor Yellow

$job = Start-Job -ScriptBlock {
    Set-Location "D:\project\qkyproject\test-volar\ovs"
    npx tsx test-hang-debug.ts 2>&1
}

$completed = Wait-Job -Job $job -Timeout 15

if ($completed) {
    Write-Host "`n测试完成:" -ForegroundColor Green
    Receive-Job -Job $job
    Remove-Job -Job $job
} else {
    Write-Host "`n⏱️  测试超时（>15秒）- 编译卡死" -ForegroundColor Red
    Stop-Job -Job $job
    Remove-Job -Job $job
}





