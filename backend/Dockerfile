# Usar uma imagem base do Python
FROM python:3.11-slim

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Instala dependências do sistema, incluindo o cliente MySQL, gcc, xvfb para headless browser e chromium
RUN apt-get update && apt-get install -y default-libmysqlclient-dev gcc pkg-config xvfb chromium && \
    # Limpa o cache do apt
    rm -rf /var/lib/apt/lists/*

# Copia o arquivo de dependências
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir --verbose -r requirements.txt

# Copia o resto do código do backend para o diretório de trabalho
COPY . .

# Expõe a porta 8000 para que o servidor de desenvolvimento do Django possa ser acessado
EXPOSE 8000

# Comando para iniciar o servidor de desenvolvimento do Django
# O servidor será acessível de fora do contêiner em 0.0.0.0
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
