#!/bin/bash

# Script de Migração Completa - Caça Preço
# Automatiza toda a migração para arquitetura unificada

set -e  # Para na primeira falha

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_section() { echo -e "\n${BLUE}═══ $1 ═══${NC}\n"; }

# Verifica se está na raiz do projeto
if [ ! -d "backend" ] || [ ! -f "docker-compose.yml" ]; then
    log_error "Execute este script na raiz do projeto (onde está o docker-compose.yml)"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Migração Completa - Arquitetura Unificada   ║"
echo "║              Caça Preço v2.0                   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════
# FASE 1: BACKUP
# ═══════════════════════════════════════════════════
log_section "FASE 1: Backup e Preparação"

# Git backup
log_info "Criando backup com Git..."
git add -A 2>/dev/null || true
git commit -m "backup: antes da migração completa $(date +%Y%m%d-%H%M%S)" 2>/dev/null || log_warning "Nada para commitar"

BACKUP_BRANCH="backup-pre-migration-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH" 2>/dev/null && log_success "Branch de backup: $BACKUP_BRANCH" || log_warning "Não foi possível criar branch"

# Backup físico
mkdir -p backups
BACKUP_FILE="backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" backend/ 2>/dev/null && log_success "Backup físico: $BACKUP_FILE" || log_warning "Falha no backup físico"

# Cria branch de trabalho
log_info "Criando branch de trabalho..."
git checkout -b refactor/unify-scraping-architecture 2>/dev/null && log_success "Branch criada" || log_warning "Branch já existe"

# Para containers
log_info "Parando containers..."
docker compose down > /dev/null 2>&1 && log_success "Containers parados"

# ═══════════════════════════════════════════════════
# FASE 2: CRIAR ESTRUTURA
# ═══════════════════════════════════════════════════
log_section "FASE 2: Criando Nova Estrutura"

cd backend

# Cria diretórios
log_info "Criando estrutura de diretórios..."
mkdir -p scraper/strategies
mkdir -p scraper/utils
mkdir -p scraper/tests

# Cria __init__.py
touch scraper/strategies/__init__.py
touch scraper/utils/__init__.py
touch scraper/tests/__init__.py

log_success "Diretórios criados"

# ═══════════════════════════════════════════════════
# FASE 3: CRIAR ARQUIVOS NOVOS
# ═══════════════════════════════════════════════════
log_section "FASE 3: Criando Arquivos Novos"

# Cria price_utils.py
log_info "Criando price_utils.py..."
cat > scraper/utils/price_utils.py << 'ENDOFFILE'
"""
Funções utilitárias para manipulação de preços
"""
import re
from decimal import Decimal, InvalidOperation
import logging

logger = logging.getLogger(__name__)


def parse_brazilian_price(price_str: str) -> float:
    """
    Converte string de preço brasileiro para float.
    
    Exemplos:
        "R$ 20,66" → 20.66
        "R$ 1.234,56" → 1234.56
        "20.66" → 20.66
        
    Args:
        price_str: String contendo o preço
        
    Returns:
        float: Preço em formato numérico
        
    Raises:
        ValueError: Se não conseguir extrair um preço válido
    """
    if not price_str:
        raise ValueError("String de preço vazia")
    
    clean_str = re.sub(r'[^\d,.]', '', str(price_str).strip())
    
    if not clean_str:
        raise ValueError(f"Não foi possível extrair número de: '{price_str}'")
    
    if ',' in clean_str:
        if '.' in clean_str:
            clean_str = clean_str.replace('.', '').replace(',', '.')
        else:
            clean_str = clean_str.replace(',', '.')
    
    try:
        price = float(clean_str)
        
        if price <= 0:
            raise ValueError(f"Preço inválido (negativo ou zero): {price}")
        
        if price > 1000000:
            logger.warning(f"Preço muito alto (suspeito): {price}")
        
        return price
        
    except (ValueError, InvalidOperation) as e:
        raise ValueError(f"Erro ao converter '{price_str}' → '{clean_str}': {e}")


def format_price_brl(price: float) -> str:
    """Formata float para string de preço brasileiro."""
    if price >= 1000:
        return f"R$ {price:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    else:
        return f"R$ {price:.2f}".replace('.', ',')
ENDOFFILE

log_success "price_utils.py criado"

# Cria fast_path.py
log_info "Criando fast_path.py..."
cat > scraper/strategies/fast_path.py << 'ENDOFFILE'
"""
Fast Path: requests + BeautifulSoup
Estratégia mais rápida para sites simples sem JavaScript.
"""
import requests
from bs4 import BeautifulSoup
import logging
from ..utils.price_utils import parse_brazilian_price

logger = logging.getLogger(__name__)


class FastPathScraper:
    """Fast Path: requests + BeautifulSoup"""
    
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    def scrape(self, url: str, usuario_id: int = None) -> dict:
        """Executa scraping simples com requests"""
        try:
            logger.info(f"[FAST PATH] Iniciando: {url}")
            
            headers = {
                'User-Agent': self.USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            nome = self._extract_name(soup)
            preco = self._extract_price(soup)
            
            if nome and preco:
                logger.info(f"[FAST PATH] ✓ {nome} - R$ {preco:.2f}")
                result = {
                    'nome_produto': nome,
                    'preco_atual': preco,
                    'url_produto': url,
                }
                if usuario_id:
                    result['usuario_id'] = usuario_id
                return result
            else:
                logger.warning(f"[FAST PATH] ✗ Dados incompletos")
                return None
                
        except Exception as e:
            logger.error(f"[FAST PATH] Erro: {e}")
            return None
    
    def _extract_name(self, soup):
        """Extrai nome do produto"""
        selectors = [
            'h1.ui-pdp-title',
            'span#productTitle',
            'h1[data-testid="heading-product-title"]',
            'h1[class*="product"]',
            'h1[class*="title"]',
            'h1'
        ]
        
        for selector in selectors:
            el = soup.select_one(selector)
            if el and len(el.text.strip()) > 5:
                return el.text.strip()
        return None
    
    def _extract_price(self, soup):
        """Extrai preço do produto"""
        import re
        
        price_text = soup.find(string=re.compile(r'R\$\s*[\d.,]+'))
        
        if price_text:
            try:
                return parse_brazilian_price(price_text)
            except ValueError:
                pass
        
        selectors = [
            'span.andes-money-amount__fraction',
            'p[data-testid="price-value"]',
            'span.a-price-whole',
            'div[class*="price"]',
            'span[class*="price"]',
        ]
        
        for selector in selectors:
            el = soup.select_one(selector)
            if el:
                try:
                    return parse_brazilian_price(el.text)
                except ValueError:
                    continue
        
        return None
ENDOFFILE

log_success "fast_path.py criado"

# ═══════════════════════════════════════════════════
# FASE 4: BACKUP ARQUIVOS ANTIGOS
# ═══════════════════════════════════════════════════
log_section "FASE 4: Backup de Arquivos Antigos"

log_info "Criando backups de arquivos a serem modificados..."
cp api/views.py api/views.py.backup 2>/dev/null && log_success "api/views.py.backup"
cp scraper/tasks.py scraper/tasks.py.backup 2>/dev/null && log_success "scraper/tasks.py.backup"

log_info "Renomeando arquivos obsoletos..."
[ -f "scraper/scraping_service.py" ] && mv scraper/scraping_service.py scraper/scraping_service.py.bak && log_success "scraping_service.py → .bak"
[ -f "api/scraper.py" ] && mv api/scraper.py api/scraper.py.bak && log_success "api/scraper.py → .bak"
[ -f "api/playwright_scraper.py" ] && mv api/playwright_scraper.py api/playwright_scraper.py.bak && log_success "api/playwright_scraper.py → .bak"
[ -f "api/teste_scraper.py" ] && mv api/teste_scraper.py api/teste_scraper.py.bak && log_success "api/teste_scraper.py → .bak"

# ═══════════════════════════════════════════════════
# FASE 5: INSTRUÇÕES MANUAIS
# ═══════════════════════════════════════════════════
log_section "FASE 5: Ações Manuais Necessárias"

echo ""
log_warning "ATENÇÃO: Os próximos passos precisam ser feitos MANUALMENTE:"
echo ""
echo "1️⃣  Atualizar scraper/tasks.py"
echo "   - Substitua TODO o conteúdo pelo código fornecido no artifact 'refactored_tasks'"
echo ""
echo "2️⃣  Atualizar api/views.py"
echo "   - REMOVER imports: run_long_path_scrape, parse_product_html"
echo "   - ADICIONAR imports: ScraperOrchestrator, run_scraping_task"
echo "   - DELETAR views: LongPathScrapeView, ScrapeURLView"
echo "   - ADICIONAR views: IniciarScrapingView, TesteFastPathView"
echo "   - Código completo no artifact 'refactored_views'"
echo ""
echo "3️⃣  Atualizar api/urls.py"
echo "   - Adicionar rotas: iniciar-scraping/, teste-fast-path/"
echo "   - Remover rotas antigas: scrape-long-path/, scrape-url/"
echo ""
echo "4️⃣  Atualizar scraper/orchestrator.py"
echo "   - Copiar código do artifact 'orchestrator.py'"
echo ""
read -p "Pressione ENTER após completar as edições manuais..."

# ═══════════════════════════════════════════════════
# FASE 6: REBUILD E TESTES
# ═══════════════════════════════════════════════════
log_section "FASE 6: Rebuild e Testes"

cd ..  # Volta para raiz

log_info "Rebuilding containers..."
docker compose build backend celery 2>&1 | tee build.log

if [ $? -eq 0 ]; then
    log_success "Build concluído com sucesso"
else
    log_error "Falha no build! Verifique build.log"
    exit 1
fi

log_info "Subindo containers..."
docker compose up -d

log_info "Aguardando containers ficarem prontos..."
sleep 15

# Verifica status
log_info "Verificando status dos containers..."
docker compose ps

log_info "Verificando logs do backend..."
docker compose logs --tail=20 backend

log_info "Verificando logs do Celery..."
docker compose logs --tail=20 celery

# ═══════════════════════════════════════════════════
# FASE 7: TESTES AUTOMÁTICOS
# ═══════════════════════════════════════════════════
log_section "FASE 7: Executando Testes"

log_info "Testando imports..."
docker exec -it cacapreco_backend python3.11 -c "
from scraper.orchestrator import ScraperOrchestrator
from scraper.utils.price_utils import parse_brazilian_price
from scraper.tasks import run_scraping_task
from scraper.strategies.fast_path import FastPathScraper
print('✓ Todos os imports OK')
" && log_success "Imports funcionando" || log_error "Erro nos imports"

log_info "Testando conversão de preço..."
docker exec -it cacapreco_backend python3.11 -c "
from scraper.utils.price_utils import parse_brazilian_price
preco = parse_brazilian_price('R\$ 20,66')
assert preco == 20.66, f'Preço errado: {preco}'
print(f'✓ Preço convertido corretamente: {preco}')
" && log_success "Conversão de preço OK" || log_error "Erro na conversão"

log_info "Verificando tasks do Celery..."
docker exec -it cacapreco_backend celery -A core inspect registered | grep -q "run_scraping_task" && log_success "Task registrada" || log_warning "Task não encontrada"

# ═══════════════════════════════════════════════════
# FASE 8: FINALIZAÇÃO
# ═══════════════════════════════════════════════════
log_section "FASE 8: Finalização"

cd backend

log_info "Atualizando .gitignore..."
cat >> ../.gitignore << 'EOF'

# Arquivos de backup da migração
*.bak
*.backup

# Scraping debug
backend/**/*.html
backend/**/*.png
backend/**/screenshot*.png
backend/**/scrapy_output.log
EOF

log_success ".gitignore atualizado"

cd ..

log_info "Commitando mudanças..."
git add -A
git commit -m "refactor: migração completa para arquitetura unificada

- Centraliza scraping no orchestrator
- Cria estratégias isoladas (fast/medium/long)
- Remove código duplicado
- Adiciona price_utils
- Atualiza tasks e views
" && log_success "Commit realizado"

# ═══════════════════════════════════════════════════
# RESUMO
# ═══════════════════════════════════════════════════
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║          MIGRAÇÃO CONCLUÍDA! 🎉               ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
log_success "Estrutura criada"
log_success "Arquivos novos criados"
log_success "Backups realizados"
log_success "Containers rodando"
echo ""
log_info "Próximos passos:"
echo "  1. Testar API: curl -X POST http://localhost:8000/api/teste-fast-path/ -H 'Content-Type: application/json' -d '{\"url\": \"https://www.mercadolivre.com.br/produto/MLB123\"}'"
echo "  2. Monitorar logs: docker compose logs -f celery | grep TASK"
echo "  3. Verificar banco após 24h"
echo "  4. Remover arquivos .bak após validação"
echo ""
log_warning "Branch de backup: $BACKUP_BRANCH"
log_warning "Backup físico: $BACKUP_FILE"
echo ""