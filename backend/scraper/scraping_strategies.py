import requests
from requests_html import HTMLSession
import json
from playwright.async_api import async_playwright
from playwright_stealth import Stealth
import asyncio

def scrape_with_internal_api(api_url: str, headers: dict = None):
    """
    Tenta extrair dados diretamente de uma API interna do site alvo.

    Args:
        api_url: A URL da API interna descoberta.
        headers: Cabeçalhos HTTP opcionais para simular uma requisição de navegador.

    Returns:
        Um dicionário com os dados extraídos ou None se falhar.
    """
    print(f"--- Estratégia: Análise de API Interna ---")
    try:
        response = requests.get(api_url, headers=headers, timeout=15)
        response.raise_for_status()  # Lança exceção para status de erro (4xx ou 5xx)
        
        data = response.json()
        
        # Aqui, você precisaria de uma lógica para mapear a resposta da API 
        # para a estrutura de dados que seu sistema espera (ex: preço, nome, estoque).
        # Por enquanto, retornamos os dados brutos.
        print("--- Sucesso: API interna respondeu com dados JSON. ---")
        return {"success": True, "data": data, "strategy": "internal_api"}

    except requests.exceptions.RequestException as e:
        print(f"Erro ao chamar API interna: {e}")
        return None
    except json.JSONDecodeError:
        print("Erro: A resposta da API não é um JSON válido.")
        return None

def scrape_with_requests_html(url: str, price_selector: str, name_selector: str):
    """
    Usa a biblioteca requests-html para renderizar JavaScript básico e extrair dados.
    É mais leve que o Selenium/Playwright.

    Args:
        url: A URL da página do produto.
        price_selector: O seletor CSS para encontrar o preço.
        name_selector: O seletor CSS para encontrar o nome do produto.

    Returns:
        Um dicionário com os dados extraídos ou None se falhar.
    """
    print(f"--- Estratégia: requests-html ---")
    session = HTMLSession()
    loop = None # Initialize loop outside try
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        response = session.get(url, timeout=20)
        
        # Renderiza o JavaScript. O timeout é crucial para não ficar preso indefinidamente.
        response.html.render(sleep=2, timeout=20)
        
        price_element = response.html.find(price_selector, first=True)
        name_element = response.html.find(name_selector, first=True)
        
        if price_element and name_element:
            price = price_element.text
            name = name_element.text
            print(f"--- Sucesso: Dados encontrados com requests-html: {name} - {price} ---")
            return {
                "success": True,
                "data": {"price": price, "name": name},
                "strategy": "requests_html"
            }
        else:
            print("--- Falha: Não foi possível encontrar os elementos com os seletores fornecidos. ---")
            return None
            
    except Exception as e:
        print(f"Erro durante a execução do requests-html: {e}")
        return None
    finally:
        if loop:
            loop.close()
        session.close()

async def scrape_with_playwright_stealth(url: str, price_selector: str, name_selector: str):
    """
    Usa Playwright com playwright-stealth para evitar detecção de bot.
    É uma estratégia de long-path, robusta mas mais lenta.

    Args:
        url: A URL da página do produto.
        price_selector: O seletor CSS para encontrar o preço.
        name_selector: O seletor CSS para encontrar o nome do produto.

    Returns:
        Um dicionário com os dados extraídos ou None se falhar.
    """
    print(f"--- Estratégia: Playwright-Stealth ---")
    async with Stealth().use_async(async_playwright()) as p:
        browser = None
        try:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            await page.goto(url, wait_until='networkidle', timeout=120000) # Increased Timeout
            
            # Espera explícita pode ser necessária em alguns sites
            await page.wait_for_load_state('domcontentloaded')
            
            price_element = page.locator(price_selector).first
            name_element = page.locator(name_selector).first

            price = await price_element.text_content(timeout=5000)
            name = await name_element.text_content(timeout=5000)

            if price and name:
                print(f"--- Sucesso: Dados encontrados com Playwright: {name.strip()} - {price.strip()} ---")
                return {
                    "success": True,
                    "data": {"price": price.strip(), "name": name.strip()},
                    "strategy": "playwright_stealth"
                }
            else:
                print("--- Falha: Não foi possível encontrar os elementos com Playwright. ---")
                return None

        except Exception as e:
            print(f"Erro durante a execução do Playwright: {e}")
            return None
        finally:
            if browser:
                await browser.close()
