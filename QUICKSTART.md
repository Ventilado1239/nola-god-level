# Quick start

## Ambiente completo com Docker

```bash
git clone https://github.com/Ventilado1239/nola-god-level.git
cd nola-god-level

docker compose up -d postgres
docker compose run --rm data-generator
docker compose up -d backend frontend
```

A geração do conjunto sintético de aproximadamente 500 mil vendas pode levar alguns minutos.

## Verificação

```bash
docker compose exec postgres psql -U challenge challenge_db -c "SELECT COUNT(*) FROM sales;"
```

Depois da carga:

- interface: `http://localhost:8080`;
- API: `http://localhost:8000`;
- documentação: `http://localhost:8000/docs`;
- health check: `http://localhost:8000/api/healthz`.

## Reiniciar do zero

Este comando remove somente os contêineres e o volume de dados deste projeto:

```bash
docker compose down -v
```

Depois, repita os passos do ambiente completo.
