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
