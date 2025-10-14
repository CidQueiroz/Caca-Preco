FROM node:20
WORKDIR /app

# Copia os arquivos de lock e package da raiz para o WORKDIR (/app)
COPY package.json package-lock.json ./

# Instala as dependências a partir do lockfile da raiz
RUN npm ci

# Copia o código-fonte do frontend para o WORKDIR
# O package.json do frontend vai sobrescrever o da raiz, o que é ok
# pois o comando start está nele.
COPY frontend/ .

# Expõe a porta 3001
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["npm", "start"]