# AXS Mobile App

Aplicación móvil AXS para gestión de estacionamientos, accesos residenciales, corporativos y otros servicios.

## 🚀 Características Implementadas

### ✅ Funcionalidades Completadas
- **Autenticación OTP** - Sistema de verificación por SMS
- **Navegación por industrias** - Parking, Residencial, Corporativo, etc.
- **Estacionamiento completo**:
  - Escáner QR para entrada/salida
  - Cálculo automático de tarifas con período de gracia
  - Integración completa con Stripe para pagos
  - Generación y visualización de pases QR
- **Pagos con Stripe** - PaymentSheet nativo integrado
- **Multi-moneda** - Soporte para MXN y ARS
- **Internacionalización** - es-MX y es-AR
- **Configuración EAS** - Listo para build y deploy
- **CI/CD** - GitHub Actions configurado

### 🛠 Stack Tecnológico

## Requisitos

- Node 18+
- Expo CLI `npm i -g expo-cli`
- Cuenta EAS configurada para builds

## Instalación

```bash
git clone <repo>
cd axs-mobile
cp .env.example .env
npm install
npm run start
```

## Build producción

```bash
eas build -p android --profile production
eas build -p ios --profile production
```

_Auto‑generado 2025-08-05T00:52:40.462795_
