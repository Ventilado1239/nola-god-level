# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# 8000 é a porta padrão do FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]