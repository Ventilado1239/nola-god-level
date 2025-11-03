# Dockerfile (na raiz nola-god-level/)
# (CORRIGIDO)

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- CORREÇÃO AQUI ---
# Copia os DOIS scripts para dentro do container
COPY generate_data.py .
COPY etl.py .

# O CMD não importa, pois o docker-compose.yml o substitui
CMD ["python", "generate_data.py"]