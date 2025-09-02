# AXS Mobile Application

> **🚀 Comprehensive mobile parking and access management solution built with React Native, Expo, and NestJS.**

## 🏗️ Project Overview

AXS Mobile is a full-stack mobile application that provides parking management, residential access control, VIP lounge booking, and QR-based entry/exit systems. The project includes both a React Native mobile app and a NestJS backend API.

### ✨ Key Features

- **🔐 OTP Authentication** - Secure phone-based login with Twilio
- **🚗 Parking Management** - Find, book, and pay for parking spots
- **🏠 Residential Access** - Guest invitation and access control system
- **🎯 QR Code Integration** - Scanner and generator for seamless entry/exit
- **💳 Payment Processing** - Stripe integration with multiple payment methods
- **🏨 VIP Lounge Booking** - Premium lounge access and management
- **📱 Push Notifications** - Real-time updates and alerts
- **💾 Offline Support** - Local storage for passes and pending operations
- **🌐 Multi-language Support** - i18n implementation ready

## 🎯 MVP Completion Status

### ✅ Completed Features

#### **Frontend (React Native + Expo)**
- [x] Authentication system with OTP verification
- [x] Industry selection screen (Parking, Residential, Corporate, Lounges, Tollbooths)
- [x] Parking screen with pricing and booking
- [x] Payment integration with Stripe PaymentSheet
- [x] QR Scanner with camera integration
- [x] QR Viewer for displaying passes
- [x] Residential guest management system
- [x] VIP Lounge booking with multiple tiers
- [x] Navigation stack with modal presentations
- [x] Offline storage service with SecureStore
- [x] Push notification service
- [x] Environment configuration management
- [x] API service layer with comprehensive endpoints
- [x] Testing framework setup (Jest + React Testing Library)

#### **Backend (NestJS + Prisma + PostgreSQL)**
- [x] Complete database schema with all entities
- [x] Authentication module with JWT and OTP
- [x] Payment module with Stripe integration
- [x] Health check endpoints
- [x] Prisma ORM integration
- [x] Docker Compose setup for local development
- [x] Environment configuration
- [x] Database seeding scripts
- [x] API documentation with Swagger

#### **DevOps & Infrastructure**
- [x] EAS Build configuration for iOS/Android
- [x] GitHub Actions CI/CD pipeline
- [x] Docker containerization
- [x] Environment management (dev/staging/prod)
- [x] Database migrations and seeding

### 🚧 In Progress / Next Steps

- [ ] Complete backend API endpoints implementation
- [ ] Frontend-backend integration testing
- [ ] Unit and E2E test coverage
- [ ] Production deployment configuration
- [ ] Performance optimization

## 🛠️ Tech Stack

### **Mobile App**
- **Framework**: React Native with Expo 50
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context
- **Payments**: Stripe React Native SDK
- **Storage**: Expo SecureStore
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications
- **Testing**: Jest + React Testing Library

### **Backend API**
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport
- **OTP Service**: Twilio Verify
- **Payments**: Stripe
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### **Infrastructure**
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Mobile Builds**: EAS Build
- **Environment**: Multi-stage (dev/staging/prod)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g @eas/cli`)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd axs-mobile

# Install mobile dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp .env.example .env

# Update backend/.env with your configuration:
# - Database credentials
# - JWT secret
# - Twilio credentials (optional for development)
# - Stripe keys (optional for development)
```

### 3. Start Backend Services

```bash
# Start PostgreSQL and Redis with Docker
cd backend
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional)
npm run db:seed

# Start backend server
npm run start:dev
```

### 4. Start Mobile App

```bash
# In the root directory
npm start

# Or use specific platforms
npm run ios
npm run android
npm run web
```

### 5. Verify Setup

- **Backend API**: http://localhost:3000/api/docs (Swagger UI)
- **Mobile App**: Expo Dev Tools will open automatically
- **Database UI**: http://localhost:5050 (pgAdmin) - admin@axsmobile.com / admin123
- **Redis UI**: http://localhost:8081 (Redis Commander)

## 📱 Mobile App Architecture

### Screen Flow
```
AuthScreen (OTP Login)
    ↓
IndustrySelectScreen
    ├── ParkingScreen → PaymentScreen
    ├── ResidentialScreen → QRViewerScreen
    ├── LoungeScreen → PaymentScreen → QRViewerScreen
    └── QRScannerScreen (Modal)
```

### Key Services
- **API Service** (`src/services/api.ts`) - HTTP client with auth
- **Offline Service** (`src/services/offline.ts`) - Local storage management
- **Notification Service** (`src/services/notifications.ts`) - Push notifications
- **Environment Config** (`src/config/env.ts`) - Multi-environment setup

## 🔧 Backend API Architecture

### Module Structure
```
src/
├── modules/
│   ├── auth/          # JWT + OTP authentication
│   ├── payment/       # Stripe integration
│   ├── user/          # User management
│   ├── pass/          # Pass/ticket management
│   ├── pricing/       # Dynamic pricing
│   └── notification/  # Push notifications
├── shared/
│   └── prisma/        # Database service
└── main.ts           # Application bootstrap
```

### Database Schema
- **Users** - Authentication and profile data
- **Vehicles** - User vehicle registration
- **Plazas** - Parking/residential locations
- **Passes** - QR-based access tickets
- **Transactions** - Payment records
- **PassEvents** - Entry/exit tracking

## 🧪 Testing

### Mobile App Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Backend Testing
```bash
cd backend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage
npm run test:cov
```

## 📦 Building & Deployment

### Mobile App Builds

```bash
# Configure EAS
eas login
eas build:configure

# Build for development
eas build --profile development --platform all

# Build for staging
eas build --profile staging --platform all

# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --profile production --platform all
```

### Backend Deployment

```bash
cd backend

# Build for production
npm run build

# Start production server
npm run start:prod

# Deploy database migrations
npm run migration:deploy
```

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **OTP Verification** via Twilio for phone-based auth
- **Secure Storage** using Expo SecureStore for sensitive data
- **API Rate Limiting** to prevent abuse
- **Input Validation** with class-validator
- **CORS Configuration** for secure API access
- **Environment Variables** for sensitive configuration

## 🌐 API Documentation

The backend API is fully documented with Swagger/OpenAPI. Once the backend is running, visit:

**http://localhost:3000/api/docs**

### Key Endpoints

#### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile

#### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

#### Passes
- `GET /api/passes` - Get user passes
- `POST /api/passes` - Create new pass
- `PUT /api/passes/:id/use` - Use/scan pass

## 🔧 Development Tools

### Available Scripts

#### Mobile App
- `npm start` - Start Expo development server
- `npm run ios` - Start iOS simulator
- `npm run android` - Start Android emulator
- `npm run web` - Start web development server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

#### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run migration:generate` - Generate new Prisma migration
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Database Management

```bash
# Access PostgreSQL
docker exec -it axs-postgres psql -U axs_user -d axs_mobile

# View logs
docker-compose logs -f postgres

# Reset database
npx prisma migrate reset

# Prisma Studio (Database GUI)
npx prisma studio
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Code Style
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write unit tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

#### "Cannot find module" errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Database connection issues
```bash
# Restart database services
cd backend
docker-compose down
docker-compose up -d

# Reset database
npx prisma db push --force-reset
```

#### Expo development issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler cache
npx expo start --reset-cache
```

### Getting Help

- **📚 Documentation**: Check the inline code documentation
- **🐛 Issues**: Report bugs via GitHub Issues
- **💬 Discussions**: Use GitHub Discussions for questions
- **📧 Support**: Contact the development team

---

**Built with ❤️ by the AXS Development Team**
