# PowerShell script to generate self-signed SSL certificate for local HTTPS testing
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$certPath = Join-Path $PSScriptRoot "cert.pem"
$keyPath = Join-Path $PSScriptRoot "key.pem"

Write-Host "Generating local self-signed SSL certificate for school-platform..." -ForegroundColor Cyan

if (Get-Command openssl -ErrorAction SilentlyContinue) {
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $keyPath `
        -out $certPath `
        -subj "/C=IN/ST=Delhi/L=NewDelhi/O=AlgionsAILabs/OU=DevOpsAssessment/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    Write-Host "SSL certificate generated successfully via OpenSSL." -ForegroundColor Green
} else {
    Write-Host "OpenSSL not detected. The Nginx Docker container automatically generates this certificate upon build." -ForegroundColor Yellow
}
