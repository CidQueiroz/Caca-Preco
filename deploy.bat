@echo off
REM Define as variáveis
set BUCKET_NAME=cdkteck.com.br
set DISTRIBUTION_ID=E1E24NF10EBG7S

REM Passo 1: Sincronizar com o S3
echo ">>> Sincronizando arquivos com o S3..."
aws s3 sync ./public s3://%BUCKET_NAME% --delete

REM Passo 2: Invalidar o cache do CloudFront
echo ">>> Criando invalidacao no CloudFront..."
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"

echo ">>> Deploy concluido!"