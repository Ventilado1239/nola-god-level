# etl.py
# (CORRIGIDO - À Prova de Erros)
# 1. Usa TRUNCATE em vez de 'replace' para não dropar as MVs.
# 2. Tenta o REFRESH CONCURRENTLY, mas se falhar (primeira execução),
#    usa o REFRESH normal.

import os
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
import sys

def run_etl():
    print("Starting ETL process...")
    db_url = os.environ.get("DATABASE_URL", "postgresql://challenge:challenge_2024@postgres:5432/challenge_db")

    try:
        engine = create_engine(db_url)

        # --- 1. ETL para analytics_sales (Fato de Vendas) ---
        print("Running ETL for: analytics_sales")
        sql_sales = """
            SELECT
                s.id AS sale_id, s.created_at, DATE(s.created_at) AS created_at_date,
                EXTRACT(HOUR FROM s.created_at) AS created_at_hour,
                EXTRACT(DOW FROM s.created_at) AS created_at_weekday,
                s.sale_status_desc AS sale_status,
                st.id AS store_id, st.name AS store_name, st.city AS store_city, st.state AS store_state,
                ch.id AS channel_id, ch.name AS channel_name, ch.type AS channel_type,
                s.customer_id, s.total_amount, s.total_discount, s.delivery_fee,
                s.total_amount_items, s.value_paid, s.production_seconds, s.delivery_seconds,
                COALESCE(ps_agg.item_count, 0) AS item_count,
                COALESCE(ps_agg.item_quantity_count, 0) AS item_quantity_count
            FROM sales s
            LEFT JOIN stores st ON s.store_id = st.id
            LEFT JOIN channels ch ON s.channel_id = ch.id
            LEFT JOIN (
                SELECT 
                    sale_id, 
                    COUNT(id) AS item_count, 
                    SUM(quantity) AS item_quantity_count
                FROM product_sales
                GROUP BY sale_id
            ) ps_agg ON ps_agg.sale_id = s.id;
        """
        df_sales = pd.read_sql(sql_sales, engine)
        
        with engine.connect() as conn:
            with conn.begin():
                print("  -> Truncating analytics_sales...")
                conn.execute(text("TRUNCATE TABLE analytics_sales;"))
        
        df_sales.to_sql('analytics_sales', engine, if_exists='append', index=False)
        print(f"  -> {len(df_sales)} rows inserted into analytics_sales")


        # --- 2. ETL para analytics_product_sales (Fato de Produtos) ---
        print("Running ETL for: analytics_product_sales")
        sql_products = """
            SELECT
                ps.id AS product_sale_id, ps.sale_id, DATE(s.created_at) AS created_at_date,
                s.store_id, s.channel_id,
                p.id AS product_id, p.name AS product_name,
                c.id AS category_id, c.name AS category_name,
                ps.quantity, ps.base_price, ps.total_price
            FROM product_sales ps
            JOIN sales s ON ps.sale_id = s.id
            JOIN products p ON ps.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id;
        """
        df_products = pd.read_sql(sql_products, engine)
        
        with engine.connect() as conn:
            with conn.begin():
                print("  -> Truncating analytics_product_sales...")
                conn.execute(text("TRUNCATE TABLE analytics_product_sales;"))
            
        df_products.to_sql('analytics_product_sales', engine, if_exists='append', index=False)
        print(f"  -> {len(df_products)} rows inserted into analytics_product_sales")

        # --- 3. REFRESH MATERIALIZED VIEWS ---
        print("Refreshing Materialized Views...")
        with engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            
            try:
                print("  -> Attempting REFRESH CONCURRENTLY (fast)...")
                conn.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpis_daily;"))
                conn.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_heatmap;"))
                conn.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_products_daily;"))
            
            except Exception as e:
                print(f"  -> CONCURRENTLY failed (likely first run). Falling back to standard REFRESH (slow)...")
                conn.execute(text("REFRESH MATERIALIZED VIEW mv_kpis_daily;"))
                conn.execute(text("REFRESH MATERIALIZED VIEW mv_heatmap;"))
                conn.execute(text("REFRESH MATERIALIZED VIEW mv_top_products_daily;"))

        print("  -> Materialized Views refreshed.")
        print("ETL process completed successfully.")

    except Exception as e:
        print(f"Error during ETL: {e}")
        print("ETL failed.")
        sys.exit(1)

if __name__ == "__main__":
    start_time = datetime.now()
    run_etl()
    end_time = datetime.now()
    print(f"Total ETL duration: {end_time - start_time}")