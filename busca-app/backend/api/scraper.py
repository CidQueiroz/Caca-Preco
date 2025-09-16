import requests
from bs4 import BeautifulSoup
import re

def extract_product_info(url: str) -> dict:
    """
    Extrai o nome e o preço do produto de uma URL da Amazon com múltiplos fallbacks.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

    try:
        print(f"INFO: Enviando requisição para {url}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # --- Extração do Nome do Produto com Fallbacks ---
        nome_produto = None
        # Tentativa 1: O seletor mais comum
        nome_tag = soup.find('span', {'id': 'productTitle'})
        if nome_tag:
            nome_produto = nome_tag.get_text(strip=True)
            print("INFO: Nome encontrado via #productTitle.")
        else:
            # Tentativa 2: Um seletor alternativo
            nome_tag = soup.find('h1', {'id': 'title'})
            if nome_tag:
                nome_produto = nome_tag.get_text(strip=True)
                print("INFO: Nome encontrado via #title.")

        # --- Extração do Preço com Fallbacks ---
        preco_atual = None
        # Tentativa 1: Padrão de preço com parte inteira e fração
        preco_inteiro_tag = soup.find('span', {'class': 'a-price-whole'})
        preco_fracao_tag = soup.find('span', {'class': 'a-price-fraction'})
        if preco_inteiro_tag and preco_fracao_tag:
            preco_str = f"{preco_inteiro_tag.get_text(strip=True)}{preco_fracao_tag.get_text(strip=True)}"
            print(f"INFO: Preço encontrado via 'a-price-whole': {preco_str}")
        else:
            # Tentativa 2: Preço completo dentro de um único span (comum em ofertas)
            preco_tag = soup.select_one('#corePrice_feature_div span.a-offscreen, #price_inside_buybox')
            if preco_tag:
                preco_str = preco_tag.get_text(strip=True)
                print(f"INFO: Preço encontrado via seletor alternativo: {preco_str}")
            else:
                preco_str = None

        if preco_str:
            # Limpa a string de preço (remove 'R$', espaços, e usa '.' como decimal)
            preco_limpo = re.sub(r'[^\d,]', '', preco_str).replace(',', '.')
            if preco_limpo:
                preco_atual = float(preco_limpo)

        if not nome_produto or preco_atual is None:
            print(f"AVISO: Falha ao extrair nome ou preço. Nome: {nome_produto}, Preço: {preco_atual}")
            return None

        print(f"SUCESSO: Nome='{nome_produto}', Preço={preco_atual}")
        return {'nome_produto': nome_produto, 'preco_atual': preco_atual}

    except requests.RequestException as e:
        print(f"ERRO: Falha na requisição para {url}: {e}")
        return None
    except Exception as e:
        print(f"ERRO: Ocorreu um erro inesperado ao processar {url}: {e}")
        return None