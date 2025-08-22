import requests
from bs4 import BeautifulSoup
import re
import random # Importamos a biblioteca random

# Lista de User-Agents para simular diferentes navegadores/sistemas
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/117.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
]

def scrape_product_data(url):
    """
    Função de scraping aprimorada com headers completos e rotação de User-Agent.
    """
    headers = {
        'User-Agent': random.choice(USER_AGENTS), # Escolhe um User-Agent aleatório da lista
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        print(f"Tentando acessar {url} com User-Agent: {headers['User-Agent']}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Seletores específicos para Casas Bahia (inspecionei a página para você)
        nome_produto = soup.select_one('h1.dsvia-h1')
        preco_produto_str = soup.select_one('span.dsvia-price-value')

        if nome_produto:
            nome_produto = nome_produto.get_text(strip=True)
        
        if preco_produto_str:
            preco_produto_str = preco_produto_str.get_text(strip=True)

        if not preco_produto_str:
             # Se os seletores específicos falharem, tentamos os genéricos
            selectors_preco = ['span.price-tag-fraction', 'span.price', 'div.product-price', '.price', 'span.andes-money-amount__fraction']
            for selector in selectors_preco:
                element = soup.select_one(selector)
                if element:
                    preco_produto_str = element.get_text(strip=True)
                    break

        if not preco_produto_str:
            print("Não foi possível encontrar o seletor de preço.")
            return None

        # Limpeza do preço
        preco_limpo = re.sub(r'[^\d,]', '', str(preco_produto_str)).replace(',', '.')
        preco_final = float(preco_limpo)

        return {
            'nome_produto': nome_produto,
            'preco_atual': preco_final
        }

    except requests.RequestException as e:
        print(f"Erro ao acessar a URL {url}: {e}")
        return None
    except (AttributeError, ValueError, TypeError) as e:
        print(f"Erro ao parsear os dados da URL {url}: {e}")
        return None