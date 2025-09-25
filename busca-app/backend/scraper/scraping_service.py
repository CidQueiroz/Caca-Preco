import requests
from bs4 import BeautifulSoup
import json
import logging
import subprocess
import os
import re
from django.conf import settings
from django.utils import timezone
from api.models import Vendedor
from urllib.parse import urlparse
from .models import Dominio, Seletor, ProdutosMonitoradosExternos, HistoricoPrecos, get_canonical_url

import hashlib

LOG_FILE_PATH = '/mnt/c/users/cydyq/documents/python/testecacapreco/cacapreco_ai/busca-app/backend/scrapy_output.log'

def log_to_file(url, name, price, user_id, error):
    """
    Salva os dados de scraping em um arquivo de log em caso de falha no banco de dados.
    """
    try:
        with open(LOG_FILE_PATH, 'a', encoding='utf-8') as f:
            log_entry = {
                'timestamp': timezone.now().isoformat(),
                'url': url,
                'name': name,
                'price': price,
                'user_id': user_id,
                'error': str(error)
            }
            f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        logging.info(f"SAVE DATA FALLBACK: Dados para a URL {url} salvos no arquivo de log.")
    except Exception as e:
        logging.error(f"SAVE DATA FALLBACK: Falha ao escrever no arquivo de log: {e}")

def save_monitoring_data(url_produto, nome_produto, preco_atual, usuario_id):
    """
    Salva os dados de monitoramento no banco de dados.
    Retorna o objeto de monitoramento em caso de sucesso, None em caso de falha.
    """
    try:
        vendedor = Vendedor.objects.get(usuario_id=usuario_id)

        url_canonico = get_canonical_url(url_produto)
        url_hash = hashlib.sha256(url_canonico.encode()).hexdigest()

        # Usa o url_hash para encontrar ou criar o produto, garantindo unicidade.
        monitoramento, created = ProdutosMonitoradosExternos.objects.get_or_create(
            vendedor=vendedor,
            url_hash=url_hash,
            defaults={
                'url_produto': url_canonico,
                'nome_produto': nome_produto,
                'preco_atual': preco_atual,
            }
        )

        # Se o produto já existia, atualiza os dados.
        if not created:
            monitoramento.nome_produto = nome_produto
            monitoramento.preco_atual = preco_atual
            monitoramento.save() # ultima_coleta é atualizado automaticamente pelo auto_now=True

        # Salva a nova entrada no histórico de preços
        HistoricoPrecos.objects.create(
            produto_monitorado=monitoramento, # Nome correto do campo
            preco=preco_atual,
            # data_coleta é preenchido automaticamente pelo auto_now_add=True
        )
        
        logging.info(f"SAVE DATA: Dados de monitoramento salvos com sucesso para a URL: {url_produto}")
        return monitoramento
        
    except Exception as e:
        logging.error(f"SAVE DATA: Erro ao salvar dados para a URL {url_produto}: {e}")
        # Fallback para logar em arquivo
        log_to_file(url_produto, str(nome_produto), float(preco_atual), usuario_id, e)
        return None

def get_specific_selectors(url: str):
    """
    Busca no banco de dados os seletores para o domínio da URL fornecida,
    de forma dinâmica e escalável.
    """
    hostname = urlparse(url).hostname
    if not hostname:
        logging.warning(f"URL inválida ou sem hostname: {url}")
        return None

    # Gera uma lista de possíveis domínios a serem buscados, do mais específico ao mais genérico.
    # Ex: para 'm.americanas.com.br', tentará: 
    # 1. 'm.americanas.com.br'
    # 2. 'americanas.com.br'
    parts = hostname.split('.')
    domain_candidates = ['.'.join(parts[i:]) for i in range(len(parts) - 1)]
    
    dominio_obj = None
    for domain_name in domain_candidates:
        try:
            # Busca por um domínio ativo que corresponda ao candidato
            dominio_obj = Dominio.objects.get(ativo=True, nome_dominio=domain_name)
            logging.info(f"Domínio correspondente encontrado no DB: {domain_name}")
            break  # Para no primeiro que encontrar
        except Dominio.DoesNotExist:
            continue # Tenta o próximo candidato (mais genérico)

    if not dominio_obj:
        logging.warning(f"Nenhum domínio de scraping ativo encontrado no DB para o hostname: {hostname}")
        return None

    # Busca todos os seletores para o domínio encontrado, ordenados por prioridade
    seletores_db = dominio_obj.seletores.all().order_by('prioridade')
    if not seletores_db.exists():
        logging.warning(f"Nenhum seletor encontrado no DB para o domínio: {dominio_obj.nome_dominio}")
        return None

    # Monta o dicionário de seletores no formato esperado pelo pipeline
    selectors_dict = {
        'nome': [],
        'preco': [],
        'api_url': None,
    }
    for s in seletores_db:
        if s.tipo == Seletor.TipoSeletor.NOME:
            selectors_dict['nome'].append(s.seletor)
        elif s.tipo == Seletor.TipoSeletor.PRECO:
            selectors_dict['preco'].append(s.seletor)
        elif s.tipo == Seletor.TipoSeletor.API_URL:
            # Assume que haverá apenas uma URL de API por domínio, a de maior prioridade
            if selectors_dict['api_url'] is None:
                selectors_dict['api_url'] = s.seletor

    logging.info(f"Usando {len(seletores_db)} seletores do banco de dados para o domínio: {dominio_obj.nome_dominio}")
    return selectors_dict

def fast_path_scrape(url: str):
    """
    Tenta extrair dados de produtos de forma rápida (requests + BeautifulSoup).
    Retorna (nome, preco) em caso de sucesso, ou None em caso de falha.
    """
    logging.info(f"FAST PATH: Tentando para a URL: {url}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        nome_produto = None
        preco_produto_str = None

        # --- TENTATIVA 1: JSON-LD (O Padrão Ouro) ---
        json_ld_script = soup.find('script', type='application/ld+json')
        if json_ld_script:
            try:
                data = json.loads(json_ld_script.string)
                if isinstance(data, list): # Alguns sites colocam o JSON-LD em uma lista
                    data = data[0]
                
                if data.get('@type') == 'Product':
                    nome_produto = data.get('name')
                    offers = data.get('offers', {})
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    
                    price = offers.get('price') or offers.get('lowPrice')
                    if price:
                        preco_produto_str = str(price)
                        logging.info("FAST PATH: Dados encontrados via JSON-LD.")
            except (json.JSONDecodeError, AttributeError):
                logging.warning("FAST PATH: JSON-LD encontrado, mas com formato inválido. Tentando HTML.")

        # --- TENTATIVA 2 e 3: Seletores HTML (Planos B e C) ---
        if not nome_produto or not preco_produto_str:
            logging.info("FAST PATH: JSON-LD falhou ou incompleto. Tentando seletores HTML.")
            
            # Tenta seletores específicos do domínio primeiro
            specific_selectors = get_specific_selectors(url)
            if specific_selectors:
                logging.info(f"FAST PATH: Usando seletores específicos para o domínio.")
                if not nome_produto:
                    for selector in specific_selectors['nome']:
                        el = soup.select_one(selector)
                        if el: nome_produto = el.text.strip(); break
                if not preco_produto_str:
                    for selector in specific_selectors['preco']:
                        el = soup.select_one(selector)
                        if el: preco_produto_str = el.text.strip(); break
            
            # Se ainda faltar, tenta seletores genéricos (fallback)
            if not nome_produto:
                generic_name_selectors = ['h1', 'h1[class*="title"]', 'h1[class*="name"]']
                for selector in generic_name_selectors:
                    el = soup.select_one(selector)
                    if el: nome_produto = el.text.strip(); break
            
            if not preco_produto_str:
                generic_price_selectors = ['span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]']
                for selector in generic_price_selectors:
                    el = soup.select_one(selector)
                    if el: preco_produto_str = el.text.strip(); break
        
        # --- ETAPA FINAL: LIMPEZA E VALIDAÇÃO ---
        if nome_produto and preco_produto_str:
            # Regex robusta para limpar o preço, removendo tudo exceto dígitos, vírgulas e pontos
            preco_limpo_str = re.search(r'(\d[\d,.]*\d)', preco_produto_str)
            if preco_limpo_str:
                # Converte para o formato americano (ponto decimal) e depois para float
                preco_final = float(preco_limpo_str.group(0).replace('.', '').replace(',', '.'))
                logging.info(f"FAST PATH: Sucesso! Produto: '{nome_produto}', Preço: {preco_final}")
                return nome_produto, preco_final
            else:
                logging.error(f"FAST PATH: Regex não conseguiu limpar o preço: '{preco_produto_str}'")

        # Se chegamos aqui, a extração falhou. Salva o HTML para depuração.
        logging.error(f"FAST PATH: Falha ao extrair dados para a URL: {url}. Nome: {nome_produto}, Preço: {preco_produto_str}")
        try:
            file_path = '/tmp/fast_path_failure.html'
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            logging.info(f"FAST PATH: HTML da falha salvo em: {file_path}")
        except Exception as e:
            logging.error(f"FAST PATH: Falha ao salvar o HTML de depuração: {e}")
        return None

    except requests.exceptions.RequestException as e:
        logging.error(f"FAST PATH: Erro de requisição para a URL: {url} - {e}")
        return None
    except Exception as e:
        logging.error(f"FAST PATH: Erro inesperado para a URL: {url} - {e}")
        return None

def medium_path_scrape(url: str):
    """
    Placeholder para uma tentativa de scraping de complexidade média.
    """
    logging.info(f"MEDIUM PATH: Tentativa para a URL: {url} (atualmente um placeholder)")
    return None

def long_path_scrape(url: str, usuario_id: str):
    """
    Executa o spider Scrapy/Selenium como um subprocesso e captura sua saída.
    Retorna (nome, preco) em caso de sucesso, ou None em caso de falha.
    """
    logging.info(f"LONG PATH: Iniciando para a URL: {url}")
    try:
        scrapy_project_path = os.path.join(settings.BASE_DIR, 'cacapreco_scraper')
        
        command = [
            'xvfb-run', '--auto-servernum', '--server-args', '-screen 0 1280x1024x24',
            'scrapy', 'crawl', 'selenium_spider',
            '-a', f'url={url}',
            '-a', f'usuario_id={usuario_id}',
            '-o', '-:json' # Sintaxe correta para output em JSON para stdout
        ]
        
        result = subprocess.run(
            command, 
            cwd=scrapy_project_path, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT,
            text=True, 
            check=True,
            timeout=300 # Timeout de 5 minutos para o processo do spider
        )

        # A saída do Scrapy pode conter múltiplos JSONs, um por linha, ou um array de JSON
        # Vamos pegar a última linha não vazia, que geralmente é o item raspado
        output_lines = [line for line in result.stdout.strip().split('\n') if line.strip()]
        if not output_lines:
            logging.error(f"LONG PATH: Spider executado, mas não produziu saída para a URL: {url}")
            return None
            
        # Tenta carregar a última linha como JSON
        try:
            # Scrapy com '-o - -t json' produz um array JSON.
            scraped_items = json.loads(result.stdout)
            if not scraped_items:
                logging.error(f"LONG PATH: A saída do spider era um array JSON vazio para a URL: {url}")
                return None
            
            data = scraped_items[0] # Pega o primeiro item do array
            nome = data.get('nome_produto')
            preco = data.get('preco_atual')

            if nome and preco:
                logging.info(f"LONG PATH: Sucesso! Produto: {nome}, Preço: {preco}")
                return nome, float(preco)
            else:
                logging.error(f"LONG PATH: JSON da saída do spider incompleto para a URL: {url}")
                return None
        except json.JSONDecodeError:
            logging.error(f"LONG PATH: Falha ao decodificar a saída JSON do spider para a URL: {url}. Saída: {result.stdout}")
            return None

    except subprocess.CalledProcessError as e:
        logging.error(f"LONG PATH: Erro ao executar o spider para a URL {url}. Output: {e.stdout}")
        return None
    except subprocess.TimeoutExpired:
        logging.error(f"LONG PATH: Timeout ao executar o spider para a URL {url}.")
        return None
    except Exception as e:
        logging.error(f"LONG PATH: Erro inesperado ao executar o spider para a URL {url}: {e}")
        return None