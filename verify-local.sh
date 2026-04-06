#!/bin/bash

# CDK TECK - Script de Verificação Local (Caça-Preço Backend)
# Este script levanta o ambiente de desenvolvimento local para validação antes do push.

echo "🚀 Iniciando ambiente local para validação..."

# Buscar GH_PAT para build do frontend (GitHub Packages)
if [ -z "$GH_PAT" ]; then
    if [ -f "../tokens_secretos" ]; then
        echo "🔍 Buscando token em tokens_secretos..."
        # Tentar primeiro GH_PACKAGES_TOKEN, depois GH_PAT
        TOKEN=$(grep "GH_PACKAGES_TOKEN" ../tokens_secretos | cut -d' ' -f3 | tr -d '"')
        if [ -z "$TOKEN" ]; then
            TOKEN=$(grep "GH_PAT" ../tokens_secretos | cut -d' ' -f3 | tr -d '"')
        fi
        export GH_PAT=$TOKEN
        echo "✅ Token extraído com sucesso."
    else
        echo "❌ Erro: GH_PAT não definido e ../tokens_secretos não encontrado."
        exit 1
    fi
fi

# Navegar para o diretório do backend
cd backend

# Garantir que os arquivos .env básicos existem (se não, copiar builds/backups se disponíveis)
if [ ! -f .env ]; then
    echo "⚠️  Aviso: Arquivo .env não encontrado em backend/. Criando template básico..."
    cat > .env <<EOF
DEBUG=True
SECRET_KEY=local-dev-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
EOF
fi

# Subir containers (Build se necessário)
echo "📦 Construindo e iniciando containers..."
docker compose build --no-cache
docker compose up -d

# Aguardar o banco de dados (Heathcheck simples)
echo "⏳ Aguardando serviços ficarem online..."
sleep 5

# Rodar Migrações e Healthcheck da API
echo "🔍 Executando Healthcheck e Migrations..."
docker compose exec web python manage.py migrate
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/ || echo "Failed")

if [ "$RESPONSE" == "200" ]; then
    echo "✅ Backend rodando com sucesso na porta 8000!"
else
    echo "❌ Erro: Backend respondeu com status $RESPONSE. Verifique os logs com 'docker compose logs'."
fi

echo "---"
echo "Para encerrar: cd backend && docker compose down"
