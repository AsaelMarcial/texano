#!/bin/bash
set -e

echo "========================================"
echo "  POS-Texano - Iniciando backend..."
echo "========================================"

# Ejecutar migraciones de Alembic
echo ">> Aplicando migraciones de base de datos..."
alembic upgrade head

# Iniciar servidor
echo ">> Iniciando Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"

