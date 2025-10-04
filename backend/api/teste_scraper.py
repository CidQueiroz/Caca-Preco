# test_scraper.py

from scraper import extract_product_info # Importa a função do outro arquivo

# Cole aqui a URL exata que você está testando
url_para_testar = "https://www.amazon.com.br/Smart-Brit%C3%A2nia-Dolby-Audio-BTV40M9GR2CGB/dp/B0DPGKCKL9/?_encoding=UTF8&pd_rd_w=sAndk&content-id=amzn1.sym.9d4cd3f8-955c-4000-9b8a-43f9dce62737%3Aamzn1.symc.050ea944-f1cf-4610-b462-3b604f2f4082&pf_rd_p=9d4cd3f8-955c-4000-9b8a-43f9dce62737&pf_rd_r=RARFS6W4GNNSQ2NY5KVK&pd_rd_wg=GMUEC&pd_rd_r=fdb94086-ccf2-4c95-935c-87eca12dc300&ref_=pd_hp_d_btf_ci_mcx_mr_ca_id_hp_d" # Exemplo de URL da Amazon

if __name__ == "__main__":
    print("--- INICIANDO TESTE DE SCRAPING ISOLADO ---")
    dados = extract_product_info(url_para_testar)
    
    if dados:
        print("\n--- RESULTADO ---")
        print(f"Nome do Produto: {dados['nome_produto']}")
        print(f"Preço Atual: R$ {dados['preco_atual']:.2f}")
        print("-----------------")
    else:
        print("\n--- TESTE FALHOU ---")
        print("A função não conseguiu extrair os dados.")
        print("Verifique os logs de AVISO/ERRO acima.")
        print("--------------------")