FROM node:18-alpine as builder

WORKDIR /app

# 1. Copia apenas os arquivos necessários para instalação
COPY package*.json ./

# 2. Instala TODAS as dependências (públicas e privadas)
RUN npm ci --legacy-peer-deps --silent

# 3. Copia o código fonte
COPY . .

# 4. Build da aplicação
RUN npm run build

# 5. Estágio final - imagem mínima
FROM node:18-alpine

WORKDIR /app

# 6. Copia apenas os arquivos built do estágio anterior
COPY --from=builder /app/dist ./dist

# 7. Instala apenas o serve globalmente
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]