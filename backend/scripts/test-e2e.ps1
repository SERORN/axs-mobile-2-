# Flujo completo: login mock -> crear PI -> confirmar -> (opcional) reenviar evento -> ver historial

param(
  [string]$Base = "http://localhost:3001/api",
  [int]$Monto = 25,
  [string]$Currency = "mxn",
  [string]$PassType = "DAILY",
  [string]$PlazaId = "plaza-parking-001"
)

# Login mock
$login = Invoke-RestMethod -Uri "$Base/auth/verify-otp" -Method POST -ContentType "application/json" -Body '{"phone":"+525512345678","code":"123456"}'
$headers = @{ Authorization = "Bearer " + $login.access_token }

# Crear PI
$body = @{ amount = $Monto; currency = $Currency; passType = $PassType; plazaId = $PlazaId } | ConvertTo-Json
$pi = Invoke-RestMethod -Uri "$Base/payments/create-intent" -Method POST -ContentType "application/json" -Headers $headers -Body $body
$piId = $pi.paymentIntent.id
"PI creado: $piId"

# Confirmar con tarjeta 4242
& "C:\Users\clvme\Desktop\Tools\stripe.exe" payment_intents confirm $piId --payment-method pm_card_visa --return-url "http://localhost:3001/return"

# (Opcional) Reenviar el evento payment_intent.succeeded
$events = & "C:\Users\clvme\Desktop\Tools\stripe.exe" events list --type payment_intent.succeeded --limit 100 | ConvertFrom-Json
$evtId = ($events.data | Where-Object { $_.data.object.id -eq $piId } | Select-Object -First 1).id
if ($evtId) {
  & "C:\Users\clvme\Desktop\Tools\stripe.exe" events resend $evtId
}

# Ver historial
Invoke-RestMethod -Uri "$Base/payments/history" -Method GET -Headers $headers | ConvertTo-Json -Depth 6
