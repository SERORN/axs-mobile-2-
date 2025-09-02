# AXS Mobile App

Aplicación móvil AXS para gestión de accesos con QR estáticos, flujos configurables, multitenencia y **sistema de trazabilidad para concesionarias de vehículos**.

## 🚀 Características Implementadas

### ✅ Funcionalidades Completadas
- **Sistema AXS Completo** - Según brief técnico oficial
- **QR Estáticos por Access Point** - No QR por usuario
- **Flujos Configurables** - JSON-based DSL para forms dinámicos  
- **Check-in/Check-out** - Con timestamp y fotos obligatorias
- **Multitenencia** - Separación por tenant/cliente
- **Autenticación OTP** - Sistema de verificación por SMS
- **Integración completa con Stripe** - PaymentSheet nativo + webhooks
- **Cola de Operador** - Interface en tiempo real para aprobaciones
- **Facturación CFDI** - Preparado para México con TimbrApp
- **Multi-moneda** - Soporte para MXN, USD, etc.
- **Internacionalización** - es-MX preparado
- **Configuración EAS** - Listo para build y deploy
- **🚗 Trazabilidad para Concesionarias** - Sistema completo de compras y órdenes de servicio

### 🎯 **Casos de Uso Implementados**
1. **Agencia/Taller Automotriz**: VIN, placas, km, fotos, motivo (servicio/siniestro/garantía)
2. **Hotel/Estacionamiento**: Placas, habitación, tipo estancia, pago condicional
3. **Residencial/Corporativo**: Control de visitantes con invitaciones
4. **Lounges VIP**: Compra de pases con diferentes tiers
5. **🚗 Concesionarias**: Trazabilidad completa de vehículos desde compra hasta servicio

### 🛠 Stack Tecnológico

**Frontend:**
- React Native + Expo 50
- TypeScript con tipos estrictos
- React Navigation 6
- Stripe PaymentSheet
- Expo Camera/ImagePicker para QR y fotos

**Backend:**
- NestJS + TypeScript (Puerto 3001)
- PostgreSQL + Prisma ORM
- JWT + Passport auth
- Stripe Connect para pagos + webhooks
- Swagger/OpenAPI docs automática

**Arquitectura AXS:**
```
Tenant → Sites → AccessPoints (QR estático)
                      ↓
                 Flow (JSON config)
                      ↓
              Visit (check-in/out + photos)
```

**Arquitectura Trazabilidad:**
```
Dealership → Salesperson → Purchase → OwnershipHistory
                              ↓
                         ServiceOrder → Stripe Payment
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

### Base de Datos y Backend
```bash
# Backend (Puerto 3001)
cd backend
npm install
docker-compose up -d        # PostgreSQL + Redis
npx prisma generate        # Generar cliente
npx prisma db push        # Deploy schema
npm run db:seed-axs       # Datos de demo AXS
npm run dev               # API en :3001

# Stripe CLI (webhooks)
npm run stripe:listen:3001  # Conectar webhooks a puerto 3001

# Frontend  
npm install --legacy-peer-deps
npm start                 # Expo dev server
```

### 🚗 **Configuración de Trazabilidad**
```bash
# 1. Asegurar que Prisma tenga las nuevas entidades
npx prisma format
npx prisma generate

# 2. Ejecutar migración (cuando esté listo)
npm run prisma:migrate

# 3. Verificar endpoints de trazabilidad
curl http://localhost:3001/api/docs  # Swagger docs
curl http://localhost:3001/api/dealerships -H "Authorization: Bearer TOKEN"
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

## 🔧 API Endpoints

### Core AXS APIs (Puerto 3001)
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

### 🚗 **Trazabilidad APIs (Nuevos)**
```
# Concesionarias
GET|POST|PATCH|DELETE /api/dealerships
GET  /api/dealerships/code/:code

# Clientes
GET|POST|PATCH|DELETE /api/customers
GET  /api/customers/email/:email
GET  /api/customers/phone/:phone

# Vendedores
GET|POST|PATCH|DELETE /api/salespeople
GET  /api/salespeople/dealership/:dealershipId

# Compras y Propiedad
POST /api/vehicles/:id/purchases      # Crea compra + historial propiedad
GET  /api/vehicles/:id/ownerships     # Historial completo de propiedad
GET|POST|PATCH|DELETE /api/purchases

# Órdenes de Servicio
GET|POST|PATCH|DELETE /api/service-orders
PATCH /api/service-orders/:id/status
POST  /api/service-orders/:id/pay     # Crear Payment Intent Stripe

# Webhooks (mejorados)
POST /api/webhooks/stripe             # Soporta serviceOrderId y purchaseId
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

### 🚗 **Entidades de Trazabilidad (Nuevas)**
- **dealerships**: Concesionarias con código único
- **salespeople**: Vendedores por concesionaria  
- **customers**: Clientes (individuales/empresas)
- **purchases**: Compras de vehículos + Stripe
- **ownership_history**: Historial de propietarios
- **service_orders**: Órdenes de servicio + Stripe

### Flujo Técnico
1. **QR Estático** → `axs://ap/agencia-lomas-vehicular-1`
2. **App resuelve** → `GET /access-points/agencia-lomas-vehicular-1`
3. **Carga Flow** → `GET /flows/by-access-point/agencia-lomas-vehicular-1`
4. **User completa** → Forms dinámicos + fotos + reglas
5. **Check-in** → `POST /visits/checkin` (crea Visit con timestamp)
6. **Operador ve** → `GET /queue` (tiempo real)
7. **Aprobación** → `POST /visits/:id/approve`

### 🚗 **Flujo de Trazabilidad**
1. **Compra** → `POST /vehicles/:id/purchases` (crea Purchase + OwnershipHistory)
2. **Servicio** → `POST /service-orders` (crea ServiceOrder)
3. **Pago** → `POST /service-orders/:id/pay` (Stripe con metadata.serviceOrderId)
4. **Webhook** → Stripe actualiza status automáticamente

## Requisitos

- Node 18+
- Expo CLI `npm i -g expo-cli`
- Docker para PostgreSQL
- Cuenta EAS configurada para builds

## 📚 Documentación

### 🚗 **Trazabilidad para Concesionarias**
- **[Guía Completa](docs/trazabilidad-concesionarias.md)** - Diagrama ER, flujos, ejemplos de API
- **[Checklist Técnico](docs/checklist-revision-tecnica.md)** - Mejores prácticas y troubleshooting

### Swagger/OpenAPI  
```bash
# Iniciar backend
npm run dev  # Puerto 3001

# Ver documentación automática
open http://localhost:3001/api/docs
```

### Comandos Rápidos
```bash
# Desarrollo (scripts PowerShell)
./scripts/start-backend.ps1      # Inicio completo con verificaciones
./scripts/stripe-listen.ps1      # Webhook listener  

# Prisma
npm run prisma:format           # Formatear schema
npm run prisma:generate        # Generar cliente
npm run prisma:migrate         # Ejecutar migración (cuando esté listo)

# VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- Backend: start (3001)
- Stripe: listen → 3001  
- Prisma: migrate+generate
```

## Instalación

```bash
git clone <repo>
cd axs-mobile-2-

# Backend
cd backend
npm install
cp .env.example .env  # Configurar DATABASE_URL, STRIPE_*, etc.
npm run dev           # Puerto 3001

# Frontend
npm install --legacy-peer-deps
npm start
```

## Build producción

```bash
eas build -p android --profile production  
eas build -p ios --profile production
```

_Generado 2025-01-02 - Sistema AXS completo + Trazabilidad para Concesionarias (Puerto 3001)_
