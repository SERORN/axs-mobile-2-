#!/usr/bin/env pwsh
# AXS Backend Smoke Tests - PowerShell (ASCII only)

$ErrorActionPreference = 'Stop'
$base  = "http://localhost:3000/api"
$phone = "+525555555555"

function Invoke-JsonPost([string]$url, [hashtable]$body, [hashtable]$headers=@{}) {
  $json = ($body | ConvertTo-Json -Depth 8)
  return Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -Headers $headers -Body $json
}

Write-Host ""
Write-Host "== 1) HEALTH =="
$health = Invoke-RestMethod -Uri "$base/health" -Method GET
$health | ConvertTo-Json -Depth 8

Write-Host "`n== 2) SEND OTP (mock) =="
$otp = Invoke-JsonPost "$base/auth/send-otp" @{ phone = $phone }
$otp | ConvertTo-Json -Depth 8

Write-Host "`n== 3) VERIFY OTP (123456) =="
$login = Invoke-JsonPost "$base/auth/verify-otp" @{ phone = $phone; code = "123456" }
$jwt = $login.token
if (-not $jwt) { throw "No JWT token returned from verify-otp." }
$prefix = $jwt.Substring(0, [Math]::Min(24, $jwt.Length))
Write-Host ("JWT prefix: " + $prefix + "...")

$headers = @{ Authorization = ("Bearer " + $jwt) }

Write-Host "`n== 4) GET PROFILE =="
$userProfile = Invoke-RestMethod -Uri "$base/auth/profile" -Method GET -Headers $headers
$userProfile | ConvertTo-Json -Depth 8

Write-Host "`n== 5) CREATE PAYMENT INTENT =="
$pi = Invoke-JsonPost "$base/payments/create-intent" @{
  amount      = 2500
  currency    = "mxn"
  passType    = "DAILY"
  plazaId     = "plaza-parking-001"
  description = "Smoke test payment"
} $headers
$pi | ConvertTo-Json -Depth 8

Write-Host "`n== DONE =="
Write-Host "Swagger: http://localhost:3000/api/docs"
