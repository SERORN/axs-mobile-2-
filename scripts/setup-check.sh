#!/bin/bash

echo "🚀 AXS Mobile - Verificación de Configuración"
echo "============================================="

# Verificar Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js $(node --version) instalado"
else
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm $(npm --version) instalado"
else
    echo "❌ npm no está instalado"
    exit 1
fi

# Verificar Expo CLI
if command -v expo >/dev/null 2>&1; then
    echo "✅ Expo CLI instalado"
else
    echo "⚠️  Expo CLI no está instalado globalmente"
    echo "   Instálalo con: npm install -g @expo/cli"
fi

# Verificar dependencias
if [ -d "node_modules" ]; then
    echo "✅ Dependencias instaladas"
else
    echo "⚠️  Dependencias no instaladas"
    echo "   Ejecuta: npm install"
fi

# Verificar archivo .env
if [ -f ".env" ]; then
    echo "✅ Archivo .env configurado"
else
    echo "⚠️  Archivo .env no encontrado"
    echo "   Copia .env.example a .env y configura las variables"
fi

# Verificar configuración EAS
if [ -f "eas.json" ]; then
    echo "✅ Configuración EAS lista"
else
    echo "❌ Configuración EAS no encontrada"
fi

echo ""
echo "📱 Comandos disponibles:"
echo "  npm start          - Iniciar en desarrollo"
echo "  npm run android    - Ejecutar en Android"
echo "  npm run ios        - Ejecutar en iOS"
echo "  npm test           - Ejecutar tests"
echo ""
echo "🏗  Comandos EAS:"
echo "  npx eas build --profile preview    - Build preview"
echo "  npx eas build --profile production - Build producción"
echo "  npx eas submit --platform all      - Subir a stores"
echo ""
echo "🔧 Para completar la configuración:"
echo "1. Configura variables en .env"
echo "2. Instala dependencias: npm install"
echo "3. Configura EAS: npx eas login"
echo "4. Inicia desarrollo: npm start"
