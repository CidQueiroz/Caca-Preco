@echo off
setlocal enabledelayedexpansion

REM --- Configuração ---
set BUCKET_NAME=cdkteck.com.br
set DISTRIBUTION_ID=E1E24NF10EBG7S
set COUNTER_FILE=contador_mensal_deploys.txt
set TEMP_COUNTER_FILE=temp_counter.txt

REM --- Lógica do Contador Mensal ---
REM Pega o ano e mês atual. Formato esperado no Brasil: DD/MM/YYYY.
REM ATENCAO: Se o formato da data do seu sistema for diferente, ajuste os números abaixo.
set YEAR=%date:~6,4%
set MONTH=%date:~3,2%
set CURRENT_MONTH_KEY=%YEAR%-%MONTH%

set COUNT=0
set MONTH_FOUND=false

REM Se o arquivo de contagem não existe, cria um novo para o mês atual.
if not exist "%COUNTER_FILE%" (
    echo %CURRENT_MONTH_KEY%=1 > "%COUNTER_FILE%"
    set COUNT=1
) else (
    REM O arquivo existe, vamos ler e atualizar usando um arquivo temporário.
    if exist "%TEMP_COUNTER_FILE%" del "%TEMP_COUNTER_FILE%"

    REM Itera sobre cada linha do arquivo de contagem (ex: 2025-09=5).
    for /f "tokens=1,2 delims==" %%a in (%COUNTER_FILE%) do (
        set "LINE_KEY=%%a"
        set "LINE_COUNT=%%b"

        REM Verifica se a chave da linha é a do mês atual.
        if "!LINE_KEY!"=="%CURRENT_MONTH_KEY%" (
            REM Encontrou o mês atual, incrementa o contador.
            set /a LINE_COUNT+=1
            set "COUNT=!LINE_COUNT!"
            set MONTH_FOUND=true
            echo !LINE_KEY!=!LINE_COUNT! >> "%TEMP_COUNTER_FILE%"
        ) else (
            REM Não é o mês atual, apenas copia a linha como está para o arquivo temporário.
            echo !LINE_KEY!=!LINE_COUNT! >> "%TEMP_COUNTER_FILE%"
        )
    )

    REM Se após ler o arquivo inteiro o mês atual não foi encontrado,
    REM significa que é o primeiro deploy deste mês. Adiciona a nova entrada.
    if not !MONTH_FOUND! == true (
        set COUNT=1
        echo %CURRENT_MONTH_KEY%=1 >> "%TEMP_COUNTER_FILE%"
    )

    REM Substitui o arquivo de contagem original pelo temporário atualizado.
    move /y "%TEMP_COUNTER_FILE%" "%COUNTER_FILE%" > nul
)


REM --- Exibição e Passos do Deploy ---
echo "=========================================================="
echo " Executando DEPLOY #%COUNT% para o mes de %CURRENT_MONTH_KEY%"
echo "=========================================================="
echo.

REM Passo 1: Sincronizar com o S3
echo ">>> Sincronizando arquivos com o S3..."
aws s3 sync ./public s3://%BUCKET_NAME% --delete
echo.

REM Passo 2: Invalidar o cache do CloudFront
echo ">>> Criando invalidacao no CloudFront..."
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
echo.

REM O arquivo de contagem já foi atualizado na lógica acima.
echo ">>> Deploy #%COUNT% (%CURRENT_MONTH_KEY%) concluido com sucesso!"
echo.

endlocal

pause