# frontend/Dockerfile
# (CORRIGIDO)

# --- Estágio 1: Build (Compilar o app) ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Estágio 2: Serve (Servir os arquivos estáticos) ---
FROM nginx:1.23-alpine
# Copia os arquivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# --- CORREÇÃO AQUI ---
# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Copia a nossa configuração customizada (que entende React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]