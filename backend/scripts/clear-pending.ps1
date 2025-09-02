# Confirma y/o reinyecta eventos para todos los PIs que queden PENDING

param(
  [string]$Base = "http://localhost:3001/api"
)

$login = Invoke-RestMethod -Uri "$Base/auth/verify-otp" -Method POST -ContentType "application/json" -Body '{"phone":"+525512345678","code":"123456"}'
$headers = @{ Authorization = "Bearer " + $login.access_token }
$hist = Invoke-RestMethod -Uri "$Base/payments/history" -Method GET -Headers $headers

$pendingPis = $hist.value | Where-Object { $_.status -eq "PENDING" -and $_.stripePaymentId } | Select-Object -ExpandProperty stripePaymentId -Unique
if (-not $pendingPis) { "No hay pendientes."; exit }

foreach ($pi in $pendingPis) {
  "Procesando $pi ..."
  & "C:\Users\clvme\Desktop\Tools\stripe.exe" payment_intents confirm $pi --payment-method pm_card_visa --return-url "http://localhost:3001/return"
  $events = & "C:\Users\clvme\Desktop\Tools\stripe.exe" events list --type payment_intent.succeeded --limit 100 | ConvertFrom-Json
  $evtId  = ($events.data | Where-Object { $_.data.object.id -eq $pi } | Select-Object -First 1).id
  if ($evtId) { & "C:\Users\clvme\Desktop\Tools\stripe.exe" events resend $evtId }
}

# Verifica
Invoke-RestMethod -Uri "$Base/payments/history" -Method GET -Headers $headers | ConvertTo-Json -Depth 6
