#!/bin/bash

echo "🚀 Iniciando entorno de desarrollo AXS"
echo "====================================="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "📋 Verificando dependencias..."

if ! command_exists docker; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Todas las dependencias están instaladas"

# Iniciar servicios de base de datos
echo ""
echo "🐘 Iniciando PostgreSQL y Redis..."
docker-compose -f docker-compose.dev.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar conexión a PostgreSQL
echo "🔍 Verificando conexión a PostgreSQL..."
until docker exec $(docker-compose -f docker-compose.dev.yml ps -q postgres) pg_isready -U axs_user -d axs_db; do
    echo "   Esperando PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL está listo"

# Verificar conexión a Redis
echo "🔍 Verificando conexión a Redis..."
until docker exec $(docker-compose -f docker-compose.dev.yml ps -q redis) redis-cli ping; do
    echo "   Esperando Redis..."
    sleep 2
done

echo "✅ Redis está listo"

echo ""
echo "🎉 Entorno de desarrollo listo!"
echo ""
echo "📊 Servicios disponibles:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Adminer (DB Admin): http://localhost:8080"
echo ""
echo "📱 Para el proyecto móvil:"
echo "   cd axs-mobile && npm start"
echo ""
echo "🖥  Para el backend:"
echo "   cd axs-backend && npm run start:dev"
echo ""
echo "🛑 Para detener los servicios:"
echo "   docker-compose -f docker-compose.dev.yml down"
