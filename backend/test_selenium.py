import undetected_chromedriver as uc
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import shutil
import random
from cacapreco_scraper.cacapreco_scraper.settings import USER_AGENTS

def test_driver():
    print("--- Iniciando teste do driver Selenium ---")
    options = Options()
    
    chrome_executable_path = (
        shutil.which('google-chrome') or
        shutil.which('chromium-browser') or
        shutil.which('chrome')
    )

    if not chrome_executable_path:
        print("!!! ERRO: Navegador Chrome/Chromium não encontrado. !!!")
        return

    print(f"--- Usando Chrome em: {chrome_executable_path} ---")
    options.binary_location = chrome_executable_path
    options.add_argument(f'user-agent={random.choice(USER_AGENTS)}')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    options.add_argument('--start-maximized')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-notifications')
    options.add_argument('--disable-popup-blocking')
    options.add_argument('--headless') # Rodar em modo headless para o teste

    driver = None
    try:
        print("--- Tentando inicializar o driver uc.Chrome ---")
        driver = uc.Chrome(
            service=ChromeService(ChromeDriverManager().install()),
            options=options
        )
        print("--- Driver uc.Chrome inicializado com sucesso ---")
        
        test_url = 'http://example.com'
        print(f"--- Acessando URL de teste: {test_url} ---")
        driver.get(test_url)
        print(f"--- URL de teste acessada com sucesso ---")
        print(f"--- Título da página: {driver.title} ---")
        
        if "Example Domain" in driver.title:
            print("--- SUCESSO: O driver do Selenium parece estar funcionando corretamente! ---")
        else:
            print("--- FALHA: O título da página não era o esperado. ---")

    except Exception as e:
        print(f"!!! ERRO: Ocorreu um erro durante o teste do driver: {e} !!!")
    finally:
        if driver:
            try:
                print("--- Tentando finalizar o driver ---")
                driver.quit()
                print("--- Driver finalizado com sucesso ---")
            except Exception as e:
                print(f"!!! ERRO ao finalizar o driver: {e} !!!")

if __name__ == "__main__":
    test_driver()
