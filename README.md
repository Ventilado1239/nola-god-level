# Nola Analytics

Plataforma de análise operacional para restaurantes, construída sobre um conjunto sintético de mais de **500 mil vendas**, distribuídas por **50 lojas** e **6 meses**.

O projeto transforma dados transacionais em indicadores, segmentação RFM, comparações de período e análises exploratórias que podem ser usadas sem escrever SQL.

> Os números de vendas deste repositório são dados sintéticos gerados para um desafio técnico. Não representam clientes ou faturamento reais.

## O que foi implementado

- dashboard com receita, pedidos, ticket médio, clientes em risco e variações por período;
- filtros por loja, canal e intervalo de datas;
- heatmap de vendas por dia e hora;
- análise RFM e lista acionável de clientes em risco;
- comparação de períodos e análises personalizadas;
- exportação de resultados para Excel (`.xlsx`);
- visualizações salvas no navegador;
- API REST com **10 endpoints**;
- pipeline ETL e **3 views materializadas** no PostgreSQL;
- interface responsiva com tema claro/escuro, estados de carregamento e tratamento de erros.

## Arquitetura

```text
Dados sintéticos (Python)
        │
        ▼
PostgreSQL 15 ── ETL ── 3 views materializadas
        │
        ▼
FastAPI + psycopg2 (10 endpoints)
        │
        ▼
React + TypeScript + React Query + Recharts
```

As views materializadas reduzem o custo das consultas recorrentes do dashboard:

- `mv_kpis_daily`: indicadores diários e suporte a comparações;
- `mv_heatmap`: agregação por dia da semana e hora;
- `mv_top_products_daily`: ranking diário de produtos.

O script `etl.py` atualiza essas estruturas após a geração ou carga dos dados.

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Query, Recharts, Zod |
| Backend | Python, FastAPI, Uvicorn, Pydantic, psycopg2 |
| Dados | PostgreSQL 15, SQL, ETL em Python, views materializadas |
| Infra local | Docker e Docker Compose |

## Execução com Docker

Pré-requisitos: Docker Desktop ou Docker Engine com Compose.

```bash
git clone https://github.com/Ventilado1239/nola-god-level.git
cd nola-god-level

# Sobe o banco e gera o conjunto sintético de dados.
docker compose up -d postgres
docker compose run --rm data-generator

# Sobe API e interface.
docker compose up -d backend frontend
```

Serviços locais:

- interface: `http://localhost:8080`;
- API: `http://localhost:8000`;
- documentação OpenAPI: `http://localhost:8000/docs`;
- health check: `http://localhost:8000/api/healthz`.

A primeira geração de 500 mil vendas pode levar alguns minutos, dependendo da máquina.

## Execução sem Docker

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
# source .venv/bin/activate

pip install -r requirements.txt
set DATABASE_URL=postgresql://challenge:challenge_2024@localhost:5432/challenge_db
uvicorn main:app --reload --port 8000
```

No Linux/macOS, use `export DATABASE_URL=...` no lugar de `set`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estrutura principal

```text
nola-god-level/
├── backend/                 # API FastAPI
├── frontend/                # SPA React/TypeScript
├── analytics-schema.sql     # views e índices analíticos
├── database-schema.sql      # modelo transacional
├── generate_data.py         # geração dos dados sintéticos
├── etl.py                   # atualização das estruturas analíticas
└── docker-compose.yml       # banco, geração, API e frontend
```

## Decisões técnicas

- **Agregação no banco:** cálculos recorrentes ficam próximos dos dados e evitam transferir grandes volumes para o frontend.
- **Filtros na API:** a interface envia somente os parâmetros da análise e recebe respostas já agregadas.
- **React Query:** centraliza cache, carregamento e invalidação das consultas.
- **Virtualização:** tabelas extensas usam renderização virtual para preservar a responsividade.
- **Dados reproduzíveis:** o gerador permite reconstruir o ambiente sem depender de uma base privada.

## Documentação adicional

- [Problema e persona](PROBLEMA.md)
- [Modelo e volume de dados](DADOS.md)
- [Quick start](QUICKSTART.md)
- [Critérios do desafio](AVALIACAO.md)
- [Declaração de uso de IA](DECLARACAO_IA.md)

## Próximos passos

- adicionar testes automatizados para endpoints e consultas analíticas;
- medir tempo de resposta antes e depois das views materializadas;
- publicar uma demonstração e capturas da interface;
- criar pipeline de CI para build do frontend e validação do backend.
