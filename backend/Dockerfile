FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements primeiro (cache eficiente)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY . .

# Script de wait for db (oficializado no código fonte)
RUN chmod +x /app/wait_for_db.sh

EXPOSE 8000

CMD ["/bin/bash", "-c", "./wait_for_db.sh && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]