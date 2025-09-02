# AXS Backend Startup Script - Port 3001
# Run from backend directory: ./scripts/start-backend.ps1

param(
  [string]$ProjectPath = $PWD.Path
)

Write-Host "🚀 Starting AXS Backend on port 3001..." -ForegroundColor Green

Set-Location $ProjectPath

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating template..." -ForegroundColor Yellow
    @"
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/axs_mobile?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe (optional - webhook will work in mock mode if not set)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (optional - OTP will work in mock mode if not set)
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env template created. Please fill in your credentials." -ForegroundColor Green
}

# Set environment variables
$env:NODE_ENV = "development"
$env:PORT = "3001"

Write-Host "🎯 Backend will start on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "🎣 Webhook endpoint: http://localhost:3001/api/webhooks/stripe" -ForegroundColor Cyan
Write-Host "🏪 Dealership endpoints: http://localhost:3001/api/dealerships" -ForegroundColor Cyan
Write-Host ""

# Start the backend
npm run start:dev
