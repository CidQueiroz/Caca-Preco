# Usar uma imagem base do Node.js
FROM node:18

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala as dependências do Node.js
# Usamos CI para uma instalação mais rápida e determinística a partir do lockfile
RUN npm ci

# Copia o resto do código do frontend para o diretório de trabalho
COPY . .

# Expõe a porta 3001 para que o servidor de desenvolvimento do React possa ser acessado
EXPOSE 3001

# Comando para iniciar o servidor de desenvolvimento do React
CMD ["npm", "start"]
