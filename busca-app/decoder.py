import base64

# Nome do arquivo de entrada (o arquivo de texto com os dados da imagem)
input_file_name = "unicorn.txt"

# Nome do arquivo de saída (a imagem decodificada)
output_file_name = "unicorn_decoded.png"

try:
    # Abre o arquivo de texto para leitura
    with open(input_file_name, "r") as input_file:
        encoded_data = input_file.read()

    # O Base64 está com um prefixo, então removemos
    # O prefixo pode ser "data:image/png;base64," ou algo similar.
    # No seu caso, parece ser "iVBORw0KGgo".
    # O Python base64.b64decode lida com isso, então podemos ignorar a remoção do prefixo.
    
    # Decodifica os dados de Base64
    decoded_data = base64.b64decode(encoded_data)

    # Abre o arquivo de imagem para escrita no modo binário
    with open(output_file_name, "wb") as output_file:
        output_file.write(decoded_data)
        
    print(f"Imagem decodificada com sucesso e salva como '{output_file_name}'")

except FileNotFoundError:
    print(f"Erro: O arquivo '{input_file_name}' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro: {e}")