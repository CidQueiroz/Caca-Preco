#!/bin/bash
# CDK TECK - wait_for_db.sh
# Aguarda o banco de dados estar pronto antes de rodar as migrações

echo "⏳ Verificando disponibilidade do banco de dados..."

for i in {1..30}; do
  if python manage.py check --database default 2>/dev/null; then
    echo "✅ Database ready!"
    exit 0
  fi
  echo "⏳ Waiting for database... attempt $i/30"
  sleep 2
done

echo "❌ Database connection failed!"
exit 1
