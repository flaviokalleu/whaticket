# Reinicia o backend em desenvolvimento encerrando TODA a árvore de processos.
#
# Por que existe: `npm run dev` sobe o ts-node-dev em dois níveis (supervisor +
# servidor filho). Matar só quem escuta a porta 8080 deixa o supervisor vivo, e
# ele respawna um novo filho. Os órfãos continuam carregando a sessão do
# WhatsApp e disputam as mesmas credenciais, o que faz o servidor do WhatsApp
# derrubar as conexões em loop com `conflict: replaced` (código 440).
#
# Uso:  npm run dev:restart

$ErrorActionPreference = "Stop"
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-BackendProcesses {
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
        Where-Object {
            $_.CommandLine -match 'whaticket-1\\backend' -or
            $_.CommandLine -match 'ts-node-dev-hook'
        }
}

$existing = @(Get-BackendProcesses)

if ($existing.Count -gt 0) {
    Write-Host "Encerrando $($existing.Count) processo(s) do backend..." -ForegroundColor Yellow
    foreach ($p in $existing) {
        try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {}
    }
    Start-Sleep -Seconds 3

    $remaining = @(Get-BackendProcesses)
    if ($remaining.Count -gt 0) {
        Write-Host "Aviso: $($remaining.Count) processo(s) resistiram ao encerramento." -ForegroundColor Red
        $remaining | Select-Object ProcessId, CommandLine | Format-Table -AutoSize
    } else {
        Write-Host "Todos encerrados." -ForegroundColor Green
    }
} else {
    Write-Host "Nenhum processo do backend em execucao." -ForegroundColor Green
}

Write-Host "Iniciando backend..." -ForegroundColor Cyan
Set-Location $backendPath
npm run dev
