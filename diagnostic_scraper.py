"""
Script de diagnóstico para testar scraping do Mercado Livre
Salve como: diagnostic_scraper.py
Execute: docker exec -it cacapreco_backend python diagnostic_scraper.py
"""

import requests
from bs4 import BeautifulSoup

# URLs de teste (produtos populares que provavelmente existem)
URLS_TESTE = [
    "https://www.mercadolivre.com.br/adesivo-skin-notebook-capa-milhares-imagens-personalizado/up/MLBU1757866260",
    "https://produto.mercadolivre.com.br/MLB-3096419977-kit-5-camisetas-regatas-masculina-lisa-basica-academia-dry-_JM?searchVariation=176251638071",
    "https://www.mercadolivre.com.br/bateria-para-notebook-dell-inspiron-15-3542-type-xcmrd-148v-bateria-preto/p/MLB47349023",
    "https://www.mercadolivre.com.br/disco-rigido-k-nup-hd-externo-slim-para-computador-playstation-slim-portatil-500gb-preto/p/MLB19938399"
]

def test_url_accessibility(url):
    """Testa se a URL está acessível"""
    print(f"\n{'='*80}")
    print(f"🔍 Testando: {url}")
    print('='*80)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📏 Tamanho Resposta: {len(response.content)} bytes")
        print(f"🔑 Headers Resposta:")
        for key, value in list(response.headers.items())[:5]:
            print(f"   {key}: {value}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Tenta encontrar título
            title = soup.find('h1')
            if title:
                print(f"\n✅ Título encontrado: {title.text.strip()[:100]}")
            else:
                print("\n⚠️ Nenhum <h1> encontrado")
            
            # Tenta encontrar preço
            price_selectors = [
                'span.andes-money-amount__fraction',
                'span[class*="price"]',
                'div[class*="price"]'
            ]
            
            for selector in price_selectors:
                price = soup.select_one(selector)
                if price:
                    print(f"💰 Preço encontrado ({selector}): {price.text.strip()}")
                    break
            else:
                print("⚠️ Nenhum preço encontrado")
            
            # Verifica bloqueios
            if 'robot' in response.text.lower() or 'captcha' in response.text.lower():
                print("\n🚫 BLOQUEIO DETECTADO: Página contém referências a robot/captcha")
            
            return True
            
        elif response.status_code == 404:
            print("\n❌ ERRO 404: Produto não encontrado (URL inválida)")
            return False
            
        elif response.status_code == 403:
            print("\n🚫 ERRO 403: Acesso negado (bloqueio ativo)")
            return False
            
        else:
            print(f"\n⚠️ Status inesperado: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("\n⏱️ TIMEOUT: Servidor não respondeu em 15 segundos")
        return False
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n🔌 ERRO DE CONEXÃO: {str(e)[:200]}")
        return False
        
    except Exception as e:
        print(f"\n💥 ERRO INESPERADO: {type(e).__name__}: {str(e)[:200]}")
        return False

def main():
    print("🔬 DIAGNÓSTICO DO SCRAPER - MERCADO LIVRE")
    print("="*80)
    
    # Teste 1: URL original do usuário
    print("\n\n📍 TESTE 1: URL ORIGINAL DO USUÁRIO")
    test_url_accessibility("https://www.mercadolivre.com.br/adesivo-skin-notebook-capa-milhares-imagens-personalizado/p/MLB17578662")
    
    # Teste 2: URLs populares
    print("\n\n📍 TESTE 2: URLs DE PRODUTOS POPULARES")
    sucessos = 0
    for url in URLS_TESTE:
        if test_url_accessibility(url):
            sucessos += 1
    
    # Resumo
    print("\n\n" + "="*80)
    print("📊 RESUMO DO DIAGNÓSTICO")
    print("="*80)
    print(f"✅ URLs acessíveis: {sucessos}/{len(URLS_TESTE) + 1}")
    
    if sucessos == 0:
        print("\n🚨 PROBLEMA CRÍTICO:")
        print("   Nenhuma URL funcionou. Possíveis causas:")
        print("   1. IP do container está bloqueado pelo Mercado Livre")
        print("   2. Problema de rede no container Docker")
        print("   3. Necessário usar proxy/VPN")
    elif sucessos < len(URLS_TESTE):
        print("\n⚠️ PROBLEMA PARCIAL:")
        print("   Algumas URLs funcionaram. A URL original pode estar inválida.")
        print("   Teste com uma URL de produto que você viu no site agora.")
    else:
        print("\n✅ TUDO OK!")
        print("   O scraper deveria funcionar. Teste o orchestrator novamente.")

if __name__ == "__main__":
    main()
