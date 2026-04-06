FROM node:22-alpine as builder

WORKDIR /app

# 1. Argumentos de build para pacotes privados
ARG GH_PAT

# 2. Configura a autenticação para o GitHub Packages
RUN echo "@cidqueiroz:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GH_PAT}" >> .npmrc

# 3. Copia apenas os arquivos necessários para instalação
COPY package*.json ./

# 4. Instala TODAS as dependências (públicas e privadas)
RUN npm install --legacy-peer-deps && rm .npmrc

# 3. Copia o código fonte
COPY . .

# 4. Build da aplicação
RUN npm run build

# 5. Estágio final - imagem mínima
FROM node:22-alpine

WORKDIR /app

# 6. Copia apenas os arquivos built do estágio anterior
COPY --from=builder /app/dist ./dist

# 7. Instala apenas o serve globalmente
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]