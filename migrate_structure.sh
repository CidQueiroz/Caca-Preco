#!/bin/bash

# Script de Migração da Estrutura do Caça Preço
# Reorganiza o projeto para a estrutura ideal

set -e  # Para na primeira falha

echo "🚀 Iniciando migração da estrutura..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função auxiliar
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verifica se está na raiz do projeto
if [ ! -d "backend" ]; then
    log_error "Execute este script na raiz do projeto (onde está o docker-compose.yml)"
    exit 1
fi

# ============= FASE 1: BACKUP =============
echo ""
echo "�� FASE 1: Criando backup..."

# Cria backup com git
git add -A 2>/dev/null || true
git commit -m "backup: estrutura antes da reorganização" 2>/dev/null || log_warning "Nada para commitar"
git branch backup-estrutura-$(date +%Y%m%d-%H%M%S) 2>/dev/null && log_success "Branch de backup criado" || log_warning "Não foi possível criar branch"

# Backup físico
if [ ! -d "backups" ]; then
    mkdir backups
fi
BACKUP_FILE="backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" backend/ 2>/dev/null && log_success "Backup físico criado: $BACKUP_FILE" || log_warning "Falha no backup físico"

# ============= FASE 2: CRIAR ESTRUTURA =============
echo ""
echo "🏗️  FASE 2: Criando nova estrutura..."

# Cria diretórios
mkdir -p backend/scraper/strategies
mkdir -p backend/scraper/spiders
mkdir -p backend/scraper/utils
mkdir -p backend/scraper/tests

# Cria __init__.py
touch backend/scraper/strategies/__init__.py
touch backend/scraper/spiders/__init__.py
touch backend/scraper/utils/__init__.py
touch backend/scraper/tests/__init__.py

log_success "Diretórios criados"

# ============= FASE 3: MOVER ARQUIVOS DO SCRAPY =============
echo ""
echo "📁 FASE 3: Reorganizando arquivos do Scrapy..."

# Remove aninhamento se existir
if [ -d "backend/cacapreco_scraper/cacapreco_scraper" ]; then
    log_warning "Removendo aninhamento duplicado..."
    
    # Move arquivos do aninhamento para o nível correto
    if [ -f "backend/cacapreco_scraper/cacapreco_scraper/pipelines.py" ]; then
        cp backend/cacapreco_scraper/cacapreco_scraper/pipelines.py backend/scraper/
        log_success "pipelines.py movido"
    fi
    
    if [ -f "backend/cacapreco_scraper/cacapreco_scraper/settings.py" ]; then
        cp backend/cacapreco_scraper/cacapreco_scraper/settings.py backend/scraper/scrapy_settings.py
        log_success "settings.py movido para scrapy_settings.py"
    fi
    
    if [ -f "backend/cacapreco_scraper/cacapreco_scraper/middlewares.py" ]; then
        cp backend/cacapreco_scraper/cacapreco_scraper/middlewares.py backend/scraper/
        log_success "middlewares.py movido"
    fi
    
    # Move spiders
    if [ -d "backend/cacapreco_scraper/cacapreco_scraper/spiders" ]; then
        cp backend/cacapreco_scraper/cacapreco_scraper/spiders/*.py backend/scraper/spiders/ 2>/dev/null || true
        log_success "Spiders movidos"
    fi
fi

# ============= FASE 4: LIMPAR ARQUIVOS DE TESTE =============
echo ""
echo "🧹 FASE 4: Limpando arquivos de teste/debug..."

CLEANED=0

# Lista de extensões para limpar
for ext in html png log json; do
    if ls backend/cacapreco_scraper/*.$ext 1> /dev/null 2>&1; then
        rm -f backend/cacapreco_scraper/*.$ext
        CLEANED=$((CLEANED + 1))
    fi
done

# Remove screenshots de falha
rm -f backend/screenshot*.png 2>/dev/null
rm -f backend/cacapreco_scraper/screenshot*.png 2>/dev/null

if [ $CLEANED -gt 0 ]; then
    log_success "$CLEANED tipos de arquivos de teste removidos"
else
    log_warning "Nenhum arquivo de teste encontrado"
fi

# ============= FASE 5: CRIAR .GITIGNORE E .DOCKERIGNORE =============
echo ""
echo "📝 FASE 5: Atualizando .gitignore e .dockerignore..."

# Adiciona ao .gitignore
cat >> .gitignore << 'EOF'

# Arquivos de scraping/debug
backend/**/*.html
backend/**/*.png
backend/**/*.log
backend/**/output.json
backend/**/scrapy_output.log
backend/**/screenshot*.png

# Cache Python
**/__pycache__/
**/*.pyc
**/.pytest_cache/
**/.coverage
EOF

log_success ".gitignore atualizado"

# Cria/atualiza .dockerignore
cat > backend/.dockerignore << 'EOF'
# Arquivos de teste
**/*.html
**/*.png
**/*.log
output.json
scrapy_output.log
screenshot_*.png

# Cache e testes
**/__pycache__/
**/*.pyc
**/.pytest_cache/
.coverage
*.db

# Git
.git/
.gitignore

# Ambientes
.env
.env.*
venv/
env/

# Docs
README.md
docs/
*.md
EOF

log_success ".dockerignore criado"

# ============= FASE 6: MOVER SCRAPERS DUPLICADOS =============
echo ""
echo "🔄 FASE 6: Removendo scrapers duplicados..."

MOVED=0

# Backup dos scrapers antigos antes de remover
if [ -d "backend/api" ]; then
    mkdir -p backups/old_scrapers
    
    if [ -f "backend/api/scraper.py" ]; then
        cp backend/api/scraper.py backups/old_scrapers/
        rm backend/api/scraper.py
        MOVED=$((MOVED + 1))
        log_success "api/scraper.py removido (backup em backups/old_scrapers/)"
    fi
    
    if [ -f "backend/api/playwright_scraper.py" ]; then
        cp backend/api/playwright_scraper.py backups/old_scrapers/
        rm backend/api/playwright_scraper.py
        MOVED=$((MOVED + 1))
        log_success "api/playwright_scraper.py removido (backup em backups/old_scrapers/)"
    fi
    
    if [ -f "backend/api/teste_scraper.py" ]; then
        cp backend/api/teste_scraper.py backups/old_scrapers/
        rm backend/api/teste_scraper.py
        MOVED=$((MOVED + 1))
        log_success "api/teste_scraper.py removido (backup em backups/old_scrapers/)"
    fi
fi

if [ $MOVED -gt 0 ]; then
    log_success "$MOVED scrapers duplicados removidos"
else
    log_warning "Nenhum scraper duplicado encontrado"
fi

# ============= FASE 7: CRIAR ARQUIVO DE EXEMPLO .ENV =============
echo ""
echo "⚙️  FASE 7: Criando .env.example..."

cat > .env.example << 'EOF'
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=core.settings

# Database
MYSQL_HOST=db
MYSQL_DATABASE=testecacapreco_django
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_ROOT_PASSWORD=rootpassword

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Playwright
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# API
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3001
EOF

log_success ".env.example criado"

# ============= RESUMO =============
echo ""
echo "✅ MIGRAÇÃO CONCLUÍDA!"
echo ""
echo "📊 Resumo das mudanças:"
echo "   - Estrutura reorganizada em backend/scraper/"
echo "   - Arquivos de teste removidos"
echo "   - .gitignore e .dockerignore atualizados"
echo "   - Scrapers duplicados removidos (backup em backups/old_scrapers/)"
echo "   - Backup completo salvo em: $BACKUP_FILE"
echo ""
echo "⚠️  PRÓXIMOS PASSOS:"
echo "   1. Revisar os arquivos movidos"
echo "   2. Atualizar imports em views.py e tasks.py:"
echo "      Trocar: from api.scraper import scrape"
echo "      Por:    from scraper.orchestrator import ScraperOrchestrator"
echo "   3. Rodar testes: pytest backend/"
echo "   4. Rebuild Docker: docker-compose build"
echo "   5. Testar scraping manualmente"
echo ""
echo "🔙 Para reverter: git checkout backup-estrutura-*"
echo ""
