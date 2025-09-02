# AXS Mobile App

Aplicación móvil AXS para gestión de accesos con QR estáticos, flujos configurables y multitenencia.

## 🚀 Características Implementadas

### ✅ Funcionalidades Completadas
- **Sistema AXS Completo** - Según brief técnico oficial
- **QR Estáticos por Access Point** - No QR por usuario
- **Flujos Configurables** - JSON-based DSL para forms dinámicos  
- **Check-in/Check-out** - Con timestamp y fotos obligatorias
- **Multitenencia** - Separación por tenant/cliente
- **Autenticación OTP** - Sistema de verificación por SMS
- **Integración completa con Stripe** - PaymentSheet nativo
- **Cola de Operador** - Interface en tiempo real para aprobaciones
- **Facturación CFDI** - Preparado para México con TimbrApp
- **Multi-moneda** - Soporte para MXN, USD, etc.
- **Internacionalización** - es-MX preparado
- **Configuración EAS** - Listo para build y deploy

### 🎯 **Casos de Uso Implementados**
1. **Agencia/Taller Automotriz**: VIN, placas, km, fotos, motivo (servicio/siniestro/garantía)
2. **Hotel/Estacionamiento**: Placas, habitación, tipo estancia, pago condicional
3. **Residencial/Corporativo**: Control de visitantes con invitaciones
4. **Lounges VIP**: Compra de pases con diferentes tiers

### 🛠 Stack Tecnológico

**Frontend:**
- React Native + Expo 50
- TypeScript con tipos estrictos
- React Navigation 6
- Stripe PaymentSheet
- Expo Camera/ImagePicker para QR y fotos

**Backend:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT + Passport auth
- Stripe Connect para pagos
- Swagger/OpenAPI docs

**Arquitectura AXS:**
```
Tenant → Sites → AccessPoints (QR estático)
                      ↓
                 Flow (JSON config)
                      ↓
              Visit (check-in/out + photos)
```

## 🎯 Demo y Pruebas

### Acceso Rápido
1. **Abrir app** → Autenticarse con `+525512345678` (cualquier OTP)
2. **Seleccionar "Demo AXS"** → Ver casos de uso con QR codes
3. **Escanear QR** → Seguir flujo de check-in
4. **Cola de Operador** → Ver visitas pendientes de aprobación

### QR Codes de Prueba
```
🚗 Agencia Vehicular: axs://ap/agencia-lomas-vehicular-1
🚶 Agencia Peatonal:  axs://ap/agencia-lomas-peatonal-1  
🏨 Hotel Parking:     axs://ap/hotel-presidente-parking-1
```

### Base de Datos
```bash
# Backend
cd backend
npm install
docker-compose up -d        # PostgreSQL + Redis
npx prisma generate        # Generar cliente
npx prisma db push        # Deploy schema
npm run db:seed-axs       # Datos de demo AXS
npm run start:dev         # API en :3000

# Frontend  
npm install --legacy-peer-deps
npm start                 # Expo dev server
```

## 📱 Navegación de la App

```
AuthScreen
    ↓
IndustrySelectScreen
    ├── Demo AXS → DemoScreen (QR codes + info)
    ├── Estacionamiento → ParkingScreen (legacy)
    ├── Residencial → ResidentialScreen (legacy)
    └── Lounges → LoungeScreen (legacy)

QRScannerScreen → AccessPointFlowScreen → PaymentScreen (si aplica)
                                      ↓
OperatorQueueScreen (cola en tiempo real)
```

## 🔧 API Endpoints (Brief Compliance)

### Core AXS APIs
```
GET  /api/v1/tenants/:slug
GET  /api/v1/sites?tenant=:id  
GET  /api/v1/access-points/:publicId
GET  /api/v1/flows/by-access-point/:publicId

POST /api/v1/visits/checkin
POST /api/v1/visits/:id/checkout
GET  /api/v1/visits/:id
POST /api/v1/visits/:id/approve
POST /api/v1/visits/:id/deny

GET  /api/v1/queue?site=:id&state=PENDING,CHECKED_IN
```

### Legacy APIs (compatibilidad)
```
POST /api/v1/auth/verify-otp
GET  /api/v1/pricing
POST /api/v1/payments/create-intent
POST /api/v1/passes/:id/consume
```

## 🏗️ Modelo de Datos (Brief Técnico)

### Entidades Core AXS
- **tenants**: Clientes/empresas (multitenencia)
- **sites**: Sedes/ubicaciones físicas  
- **access_points**: Puntos de acceso con QR estático
- **flows**: Flujos configurables (JSON DSL)
- **visits**: Visitas con check-in/out + fotos
- **operators**: Staff con permisos RBAC
- **visit_forms**: Respuestas de formularios dinámicos

### Flujo Técnico
1. **QR Estático** → `axs://ap/agencia-lomas-vehicular-1`
2. **App resuelve** → `GET /access-points/agencia-lomas-vehicular-1`
3. **Carga Flow** → `GET /flows/by-access-point/agencia-lomas-vehicular-1`
4. **User completa** → Forms dinámicos + fotos + reglas
5. **Check-in** → `POST /visits/checkin` (crea Visit con timestamp)
6. **Operador ve** → `GET /queue` (tiempo real)
7. **Aprobación** → `POST /visits/:id/approve`

## Requisitos

- Node 18+
- Expo CLI `npm i -g expo-cli`
- Docker para PostgreSQL
- Cuenta EAS configurada para builds

## Instalación

```bash
git clone <repo>
cd axs-mobile
cp .env.example .env
npm install --legacy-peer-deps
npm run start
```

## Build producción

```bash
eas build -p android --profile production  
eas build -p ios --profile production
```

_Generado 2025-01-02 - Sistema AXS completo según brief técnico_
