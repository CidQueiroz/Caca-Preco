from django.core.management.base import BaseCommand
from scraper.models import Dominio, Seletor

# Os dados que estavam hardcoded na função get_specific_selectors
HARDCODED_SELECTORS = {
    'b2w': {
        'dominios': ['americanas.com.br', 'submarino.com.br', 'shoptime.com.br'],
        'nome': [
            'h1[class*="Title"]',
            'h1.product-title__Title-sc-1hlrxcw-0'
        ],
        'preco': [
            'div[class*="BestPrice"]',
            'div[class*="price__SalesPrice"]'
        ]
    },
    'via': {
        'dominios': ['casasbahia.com.br', 'pontofrio.com.br', 'extra.com.br'],
        'nome': [
            'h1.css-1j4z0b6',
            'h1.product-title'
        ],
        'preco': [
            '.product-price-value',
            '.product-price'
        ]
    },
    'mercadolivre': {
        'dominios': ['mercadolivre.com.br'],
        'nome': ['h1.ui-pdp-title'],
        'preco': [
            'div.ui-pdp-price__main-container span.andes-money-amount__fraction',
            'span.andes-money-amount__fraction'
        ]
    },
    'amazon': {
        'dominios': ['amazon.com.br'],
        'nome': ['span#productTitle'],
        'preco': [
            'span.a-price-whole',
            'div[data-cy="price-recipe"] .a-price-whole',
            '#corePrice_feature_div span.a-offscreen',
            '#price_inside_buybox'
        ]
    },
    'magazineluiza': {
        'dominios': ['magazineluiza.com.br'],
        'nome': [
            'h1[data-testid="heading-product-title"]',
            'h1.header-product__title'
        ],
        'preco': [
            'p[data-testid="price-value"]',
            'span.price-template__text'
        ]
    },
    'kabum': {
        'dominios': ['kabum.com.br'],
        'nome': ['h1[class*="nameProduct"]'],
        'preco': ['h4[class*="finalPrice"]']
    },
    'pichau': {
        'dominios': ['pichau.com.br'],
        'nome': ['h1[class*="productName"]'],
        'preco': ['div[class*="productPrice"]']
    },
    'aliexpress': {
        'dominios': ['aliexpress.com'],
        'nome': [
            'h1[data-pl="product-title"]',
            'h1.product-title-text'
        ],
        'preco': [
            'div.product-price-value',
            'span.uniform-banner-box-price'
        ]
    },
    'shopee': {
        'dominios': ['shopee.com.br'],
        'nome': ['div._44qCZd > span'],
        'preco': ['div.flex.items-center > div._9_6_3J']
    }
}


class Command(BaseCommand):
    help = 'Popula o banco de dados com os seletores de scraping que estavam hardcoded.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Iniciando a população de domínios e seletores ---'))
        
        total_dominios = 0
        total_seletores = 0

        for group, data in HARDCODED_SELECTORS.items():
            self.stdout.write(self.style.HTTP_INFO(f'\nProcessando grupo: {group}'))
            for domain_name in data['dominios']:
                dominio, created = Dominio.objects.get_or_create(nome_dominio=domain_name)
                if created:
                    self.stdout.write(f'  [+] Domínio criado: {domain_name}')
                    total_dominios += 1
                else:
                    self.stdout.write(f'  [*] Domínio já existe: {domain_name}')

                # Adiciona seletores de NOME
                for i, seletor_str in enumerate(data['nome']):
                    seletor, s_created = Seletor.objects.get_or_create(
                        dominio=dominio,
                        tipo=Seletor.TipoSeletor.NOME,
                        prioridade=i,
                        defaults={'seletor': seletor_str}
                    )
                    if s_created:
                        total_seletores += 1

                # Adiciona seletores de PREÇO
                for i, seletor_str in enumerate(data['preco']):
                    seletor, s_created = Seletor.objects.get_or_create(
                        dominio=dominio,
                        tipo=Seletor.TipoSeletor.PRECO,
                        prioridade=i,
                        defaults={'seletor': seletor_str}
                    )
                    if s_created:
                        total_seletores += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\n--- POPULAÇÃO CONCLUÍDA ---\n{total_dominios} novos domínios e {total_seletores} novos seletores foram criados.'
        ))
