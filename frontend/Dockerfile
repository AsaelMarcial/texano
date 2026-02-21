# ── Etapa 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ── Etapa 2: Servir con Nginx ──
FROM nginx:alpine

# Copiar config de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

