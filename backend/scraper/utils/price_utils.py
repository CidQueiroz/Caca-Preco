"""
Funções utilitárias para manipulação de preços
"""
import re
from decimal import Decimal, InvalidOperation
import logging

logger = logging.getLogger(__name__)


def parse_brazilian_price(price_str):
    """
    Converte string de preço BR (R$ 1.234,56) para float (1234.56).
    Ignora valores riscados/antigos se vierem misturados, focando na formatação.
    """
    if not price_str:
        return None
        
    # Remove R$, espaços e caracteres invisíveis
    clean_str = re.sub(r'[^\d.,]', '', str(price_str)).strip()
    
    if not clean_str:
        return None

    # Lógica para distinguir milhar de decimal
    # Caso 1: 1.234,56 (Padrão BR correto)
    if ',' in clean_str and '.' in clean_str:
        clean_str = clean_str.replace('.', '').replace(',', '.')
    
    # Caso 2: 1.234 (Apenas milhar, sem centavos - comum em promoções redondas)
    elif clean_str.count('.') >= 1 and ',' not in clean_str:
        # Se tem ponto, assumimos que é milhar se for iPhone/eletrônico
        # (Ninguém vende algo por 8.599 reais com 3 casas decimais)
        clean_str = clean_str.replace('.', '')
        
    # Caso 3: 1234,56 (Sem ponto de milhar)
    elif ',' in clean_str:
        clean_str = clean_str.replace(',', '.')

    try:
        return float(clean_str)
    except ValueError:
        return None

def format_price_brl(price: float) -> str:
    """Formata float para string de preço brasileiro."""
    if price >= 1000:
        return f"R$ {price:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    else:
        return f"R$ {price:.2f}".replace('.', ',')