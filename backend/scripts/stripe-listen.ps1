# AXS Stripe CLI Listener - Port 3001
# Run from backend directory: ./scripts/stripe-listen.ps1

Write-Host "🎣 Starting Stripe CLI listener for port 3001..." -ForegroundColor Green
Write-Host "🎯 Forwarding to: http://localhost:3001/api/webhooks/stripe" -ForegroundColor Cyan
Write-Host ""

# Try to find Stripe CLI in common locations
$StripePaths = @(
    "stripe",
    "stripe.exe", 
    "C:\Users\$env:USERNAME\AppData\Local\stripe\stripe.exe",
    "C:\Program Files\stripe\stripe.exe",
    "C:\Tools\stripe.exe",
    "$env:USERPROFILE\Tools\stripe.exe"
)

$StripeExe = $null
foreach ($path in $StripePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $StripeExe = $path
        break
    }
}

if ($null -eq $StripeExe) {
    Write-Host "❌ Stripe CLI not found. Please install it from: https://stripe.com/docs/stripe-cli" -ForegroundColor Red
    Write-Host "   Or update the path in this script to point to your stripe.exe location" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Using Stripe CLI: $StripeExe" -ForegroundColor Green

# Start listening
& $StripeExe listen --forward-to localhost:3001/api/webhooks/stripe
