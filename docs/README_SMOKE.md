# AXS Backend Smoke Tests

## Objetivo
Verificar que los endpoints críticos del backend AXS funcionen correctamente en desarrollo local.

## Pre-requisitos

1. **Backend corriendo**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Base de datos**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed  # (opcional, si existe seed)
   ```

3. **Variables de entorno**:
   - Copiar `backend/.env.example` a `backend/.env`
   - Configurar Stripe test keys (opcional para mock)
   - Twilio vacío = modo mock (acepta código 123456)

## Métodos de Testing

### 1. PowerShell Script (Windows)
```powershell
cd backend
.\smoke.ps1
```

### 2. VS Code REST Client
1. Abrir `docs/SMOKE.http` en VS Code
2. Instalar extensión "REST Client"
3. Ejecutar cada request con Ctrl+Alt+R

### 3. Postman/Insomnia
Importar `docs/SMOKE.http` o usar collection exportada.

## Endpoints Críticos Verificados

| Endpoint | Método | Propósito | Resultado Esperado |
|----------|--------|-----------|-------------------|
| `/api/health` | GET | Health check | `{"status":"ok"}` |
| `/api/auth/send-otp` | POST | Enviar OTP | Mock: `{"sid":"mock_xxx","status":"pending"}` |
| `/api/auth/verify-otp` | POST | Verificar OTP | JWT token |
| `/api/auth/profile` | GET | Perfil usuario | Datos del usuario autenticado |
| `/api/payments/create-intent` | POST | Payment Intent | Stripe client_secret |
| `/api/docs` | GET | Swagger UI | Documentación interactiva |

## Evidencias de Éxito

### 1. OTP Mock Mode
```json
{
  "sid": "mock_1691234567890",
  "status": "pending"
}
```

### 2. Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm0abc123",
    "phone": "+5215555555555",
    "verified": true
  }
}
```

### 3. Payment Intent
```json
{
  "id": "pi_1Abc123...",
  "client_secret": "pi_1Abc123..._secret_xyz",
  "amount": 2500,
  "currency": "mxn"
}
```

## Configuración Stripe CLI (Webhooks)

1. **Instalar**: `npm install -g stripe`
2. **Login**: `stripe login`
3. **Túnel**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. **Trigger**: `stripe trigger payment_intent.succeeded`

## Troubleshooting

### ❌ Error: Connection refused
- Verificar que el backend esté corriendo en puerto 3000
- Comprobar con: `curl http://localhost:3000/api/health`

### ❌ Error: JWT invalid
- El token tiene expiración (7 días por defecto)
- Re-ejecutar login flow (send-otp → verify-otp)

### ❌ Error: Stripe key invalid
- Verificar STRIPE_SECRET_KEY en .env
- Para desarrollo, dejar vacío = modo mock

### ❌ Database errors
- Ejecutar: `npx prisma migrate dev`
- Verificar DATABASE_URL en .env

## Próximos Pasos

Una vez que smoke tests pasen:

1. **P0**: Probar pago E2E desde app móvil
2. **P1**: Configurar Sentry (SENTRY_DSN en .env)
3. **P1**: Implementar throttling OTP
4. **P1**: Deploy staging con DB administrada

## Comandos Útiles

```bash
# Ver logs del backend
npm run start:dev

# Reset database
npx prisma migrate reset

# Generar Prisma client
npx prisma generate

# Ver Swagger docs
open http://localhost:3000/api/docs
```
