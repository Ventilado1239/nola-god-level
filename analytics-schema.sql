-- analytics-schema.sql
-- (CORRIGIDO: mv_kpis_daily AGORA INCLUI customer_id)

-- Tabela Fato Principal
CREATE TABLE analytics_sales (
    sale_id INTEGER PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    created_at_date DATE NOT NULL,
    created_at_hour INTEGER,
    created_at_weekday INTEGER,
    sale_status VARCHAR(100),
    store_id INTEGER,
    store_name VARCHAR(255),
    store_city VARCHAR(100),
    store_state VARCHAR(2),
    channel_id INTEGER,
    channel_name VARCHAR(100),
    channel_type CHAR(1),
    customer_id INTEGER,
    total_amount DECIMAL(10,2),
    total_discount DECIMAL(10,2),
    delivery_fee DECIMAL(10,2),
    total_amount_items DECIMAL(10,2),
    value_paid DECIMAL(10,2),
    production_seconds INTEGER,
    delivery_seconds INTEGER,
    item_count INTEGER,
    item_quantity_count FLOAT
);

-- Tabela Fato Secundária
CREATE TABLE analytics_product_sales (
    product_sale_id INTEGER PRIMARY KEY,
    sale_id INTEGER,
    created_at_date DATE NOT NULL,
    store_id INTEGER,
    channel_id INTEGER,
    product_id INTEGER,
    product_name VARCHAR(500),
    category_id INTEGER,
    category_name VARCHAR(200),
    quantity FLOAT NOT NULL,
    base_price FLOAT NOT NULL,
    total_price FLOAT NOT NULL
);

-- Índices
CREATE INDEX idx_analytics_sales_created_at_date ON analytics_sales(created_at_date);
CREATE INDEX idx_analytics_sales_store_id ON analytics_sales(store_id);
CREATE INDEX idx_analytics_sales_channel_id ON analytics_sales(channel_id);
CREATE INDEX idx_analytics_product_sales_date_prod_cat ON analytics_product_sales(created_at_date, product_id, category_id);
-- Adicionado índice para RFM (vai acelerar o JOIN do etl.py)
CREATE INDEX idx_analytics_sales_customer_id ON analytics_sales(customer_id);

---
--- MATERIALIZED VIEWS
---

-- MV para KPIs diários (CORRIGIDO)
CREATE MATERIALIZED VIEW mv_kpis_daily AS
SELECT
    created_at_date,
    store_id,
    store_name,
    channel_id,
    channel_name,
    customer_id, -- <-- ADICIONADO
    COUNT(*) AS total_orders,
    COALESCE(SUM(total_amount), 0) AS total_revenue,
    COALESCE(SUM(total_amount) / NULLIF(COUNT(*), 0), 0) AS avg_ticket
FROM analytics_sales
WHERE sale_status = 'COMPLETED'
GROUP BY created_at_date, store_id, store_name, channel_id, channel_name, customer_id -- <-- ADICIONADO
WITH NO DATA; -- Cria vazia, o ETL popula

-- Índices para a MV (CORRIGIDO)
CREATE UNIQUE INDEX idx_mv_kpis_daily_unique ON mv_kpis_daily(created_at_date, store_id, store_name, channel_id, channel_name, customer_id);
CREATE INDEX idx_mv_kpis_daily_date ON mv_kpis_daily(created_at_date);
CREATE INDEX idx_mv_kpis_daily_customer ON mv_kpis_daily(customer_id); -- Para RFM


-- MV para o Heatmap
CREATE MATERIALIZED VIEW mv_heatmap AS
SELECT
    EXTRACT(DOW FROM created_at)::int AS dow,
    EXTRACT(HOUR FROM created_at)::int AS hour,
    store_id,
    store_name,
    channel_id,
    channel_name,
    COUNT(*) AS total_orders,
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM analytics_sales
WHERE sale_status = 'COMPLETED'
GROUP BY dow, hour, store_id, store_name, channel_id, channel_name
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_heatmap_unique ON mv_heatmap(dow, hour, store_id, store_name, channel_id, channel_name);


-- MV para Top Produtos
CREATE MATERIALIZED VIEW mv_top_products_daily AS
SELECT
    ps.created_at_date,
    ps.store_id,
    s.store_name,
    ps.channel_id,
    s.channel_name,
    ps.product_id,
    ps.product_name,
    SUM(ps.quantity) AS total_quantity,
    COALESCE(SUM(ps.total_price), 0) AS total_revenue
FROM analytics_product_sales ps
JOIN analytics_sales s ON ps.sale_id = s.sale_id
GROUP BY ps.created_at_date, ps.store_id, s.store_name, ps.channel_id, s.channel_name, ps.product_id, ps.product_name
WITH NO DATA;

CREATE INDEX idx_mv_top_products_daily_date ON mv_top_products_daily(created_at_date);
CREATE INDEX idx_mv_top_products_daily_product ON mv_top_products_daily(product_id, total_revenue DESC);
CREATE UNIQUE INDEX idx_mv_top_products_daily_composite ON mv_top_products_daily(created_at_date, store_id, store_name, channel_id, channel_name, product_id, product_name);