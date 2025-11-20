FROM oraclelinux:9

WORKDIR /app

# Instala Python e dependências básicas
RUN dnf --enablerepo=ol9_codeready_builder --enablerepo=ol9_appstream install -y \
    python3.11 \
    python3.11-pip \
    python3.11-devel \
    mariadb-devel \
    gcc \
    pkgconf \
    wget \
    tar \
    gzip \
    findutils \
    nmap-ncat && \
    dnf clean all

# Cria link simbólico de ncat para nc para compatibilidade com wait-for-it.sh
RUN ln -sf /usr/bin/ncat /usr/bin/nc

# Cria link simbólico para python3
RUN ln -sf /usr/bin/python3.11 /usr/bin/python3 && \
    ln -sf /usr/bin/pip3.11 /usr/bin/pip3

# Create a virtual environment
RUN python3 -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Instala TODAS as dependências do Playwright manualmente (Oracle Linux)
RUN dnf --enablerepo=ol9_codeready_builder --enablerepo=ol9_appstream install -y \
    # Fontes
    liberation-fonts \
    liberation-sans-fonts \
    liberation-serif-fonts \
    liberation-mono-fonts \
    # Bibliotecas gráficas
    nss \
    nspr \
    atk \
    at-spi2-atk \
    at-spi2-core \
    cups-libs \
    gtk3 \
    alsa-lib \
    # Dependências do Chromium
    libdrm \
    libxcb \
    libxkbcommon \
    mesa-libgbm \
    libX11 \
    libXcomposite \
    libXdamage \
    libXext \
    libXfixes \
    libXrandr \
    # Servidor X virtual
    xorg-x11-server-Xvfb \
    dbus-glib \
    dbus-libs && \
    dnf clean all

# Copia e instala requirements
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Instala apenas o Playwright (Python package)
RUN pip install playwright

# Baixa o navegador Chromium (SEM tentar instalar dependências)
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0 playwright install chromium

# Copia o código
COPY . .

# Copia o script wait-for-it.sh e o torna executável
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Variáveis de ambiente
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PYTHONUNBUFFERED=1

# Comando padrão
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]