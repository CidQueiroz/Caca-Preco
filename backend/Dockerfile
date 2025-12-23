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

# Script de wait for db SIMPLES e FUNCIONAL
RUN echo '#!/bin/bash\n\
for i in {1..30}; do\n\
  if python manage.py check --database default 2>/dev/null; then\n\
    echo "✅ Database ready!"\n\
    exit 0\n\
  fi\n\
  echo "⏳ Waiting for database... attempt $i/30"\n\
  sleep 2\n\
done\n\
echo "❌ Database connection failed!"\n\
exit 1' > /app/wait_for_db.sh && chmod +x /app/wait_for_db.sh

EXPOSE 8000

CMD ["/bin/bash", "-c", "./wait_for_db.sh && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]