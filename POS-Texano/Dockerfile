FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema (gcc para compilar algunas dependencias)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Crear carpeta uploads
RUN mkdir -p /app/uploads

# Copiar y dar permisos al script de inicio
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Exponer puerto
EXPOSE 8000

# Script de inicio: migraciones + uvicorn
ENTRYPOINT ["./entrypoint.sh"]


