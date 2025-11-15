"""
Funções utilitárias para manipulação de preços
"""
import re
from decimal import Decimal, InvalidOperation


def parse_brazilian_price(price_str: str) -> float:
    """
    Converte string de preço brasileiro para float.
    
    Exemplos:
        "R$ 20,66" → 20.66
        "R$ 1.234,56" → 1234.56
        "20.66" → 20.66
        "1,234.56" → 1234.56
        
    Args:
        price_str: String contendo o preço
        
    Returns:
        float: Preço em formato numérico
        
    Raises:
        ValueError: Se não conseguir extrair um preço válido
    """
    if not price_str:
        raise ValueError("String de preço vazia")
    
    # Remove caracteres indesejados (mantém números, vírgula e ponto)
    clean_str = re.sub(r'[^\d,.]', '', str(price_str).strip())
    
    if not clean_str:
        raise ValueError(f"Não foi possível extrair número de: '{price_str}'")
    
    # Detecta formato brasileiro (vírgula como decimal)
    # Formato: 1.234,56 ou 1234,56 ou 20,66
    if ',' in clean_str:
        # Se tem ponto E vírgula: ponto é separador de milhares
        if '.' in clean_str:
            # Remove pontos (milhares) e troca vírgula por ponto (decimal)
            clean_str = clean_str.replace('.', '').replace(',', '.')
        else:
            # Só tem vírgula: é o separador decimal
            clean_str = clean_str.replace(',', '.')
    
    # Converte para float
    try:
        price = float(clean_str)
        
        # Validações de sanidade
        if price <= 0:
            raise ValueError(f"Preço inválido (negativo ou zero): {price}")
        
        if price > 1000000:
            raise ValueError(f"Preço suspeito (muito alto): {price}")
        
        return price
        
    except (ValueError, InvalidOperation) as e:
        raise ValueError(f"Erro ao converter '{price_str}' → '{clean_str}': {e}")


def format_price_brl(price: float) -> str:
    """
    Formata float para string de preço brasileiro.
    
    Args:
        price: Preço em float
        
    Returns:
        str: Preço formatado "R$ 1.234,56"
    """
    if price >= 1000:
        return f"R$ {price:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    else:
        return f"R$ {price:.2f}".replace('.', ',')


def compare_prices(old_price: float, new_price: float) -> dict:
    """
    Compara dois preços e retorna informações sobre a mudança.
    
    Returns:
        dict com: difference, percentage, status ('up', 'down', 'same')
    """
    difference = new_price - old_price
    
    if old_price == 0:
        percentage = 0
    else:
        percentage = (difference / old_price) * 100
    
    if difference > 0:
        status = 'up'
    elif difference < 0:
        status = 'down'
    else:
        status = 'same'
    
    return {
        'difference': abs(difference),
        'percentage': abs(percentage),
        'status': status,
        'old_price': old_price,
        'new_price': new_price,
    }


# Testes
if __name__ == '__main__':
    test_cases = [
        ("R$ 20,66", 20.66),
        ("R$ 1.234,56", 1234.56),
        ("20.66", 20.66),
        ("1,234.56", 1234.56),
        ("  R$  2.999,90  ", 2999.90),
        ("5000", 5000.0),
        ("R$49,90", 49.90),
    ]
    
    print("Testando conversão de preços:\n")
    for price_str, expected in test_cases:
        try:
            result = parse_brazilian_price(price_str)
            status = "✓" if abs(result - expected) < 0.01 else "✗"
            print(f"{status} '{price_str}' → {result:.2f} (esperado: {expected:.2f})")
        except Exception as e:
            print(f"✗ '{price_str}' → ERRO: {e}")