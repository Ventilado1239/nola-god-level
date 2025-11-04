# backend/main.py
# (CORRIGIDO - PONTO 16: Adicionado endpoint /api/insights/rfm-analysis)
# (CORREÇÃO DE BUG: Lógica de RFM > 60 dias e >= 3 pedidos era muito rígida)

import os
import json
import datetime as dt
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum

from dotenv import load_dotenv
import psycopg2
import psycopg2.extras
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080").split(",")

MV_KPIS = "mv_kpis_daily"
MV_HEATMAP = "mv_heatmap"
MV_PRODUCTS = "mv_top_products_daily"
TABLE_RAW_SALES = os.getenv("TABLE_RAW_SALES", "sales")
TABLE_RAW_ITEMS = os.getenv("TABLE_RAW_ITEMS", "items")
TABLE_RAW_ITEM_SALES = os.getenv("TABLE_RAW_ITEM_SALES", "item_product_sales")
TABLE_RAW_DELIVERY = os.getenv("TABLE_RAW_DELIVERY", "delivery_addresses")
# Adiciona a tabela de Clientes
TABLE_RAW_CUSTOMERS = os.getenv("TABLE_RAW_CUSTOMERS", "customers")

# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
app = FastAPI(title="Nola Analytics API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# DB utils
# -----------------------------------------------------------------------------
def get_conn():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL não foi definida no ambiente.")
    return psycopg2.connect(DATABASE_URL)

def fetchall(sql: str, params: Tuple[Any, ...]) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]

def fetchone(sql: str, params: Tuple[Any, ...]) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return dict(row) if row else None

# -----------------------------------------------------------------------------
# Helpers de data
# -----------------------------------------------------------------------------
def parse_date(s: str) -> dt.date:
    try:
        return dt.datetime.strptime(s.strip(), "%Y-%m-%d").date()
    except Exception as e:
        print(f"ERRO DE PARSE DE DATA: |{s}|, {e}")
        raise e

def get_previous_period(date_from: str, date_to: str) -> Tuple[str, str]:
    d1 = parse_date(date_from)
    d2 = parse_date(date_to)
    delta = d2 - d1
    prev_to = d1 - dt.timedelta(days=1)
    prev_from = prev_to - delta
    return (prev_from.strftime("%Y-%m-%d"), prev_to.strftime("%Y-%m-%d"))

def _calculate_pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0 
    change = ((current - previous) / previous) * 100
    return round(change, 2)

def _get_kpis_for_period(
    date_from: str,
    date_to: str,
    store_id: Optional[int] = None,
    channel_id: Optional[int] = None,
    store_name: Optional[str] = None,
    channel_name: Optional[str] = None,
) -> Dict[str, Any]:
    
    base_where = ["created_at_date BETWEEN %s AND %s"]
    params: List[Any] = [date_from, date_to]

    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)

    where = " AND ".join(base_where)
    kpis = { "total_sales": 0, "net_revenue": 0.0, "ticket": 0.0 }

    try:
        row = fetchone(f"""
            SELECT
                SUM(total_orders)::numeric AS total_sales,
                COALESCE(SUM(total_revenue), 0)::numeric AS net_revenue
            FROM {MV_KPIS}
            WHERE {where};
        """, tuple(params))
        
        if row:
            kpis["total_sales"] = int(row.get("total_sales", 0))
            kpis["net_revenue"] = float(row.get("net_revenue", 0))
            if kpis["total_sales"] > 0:
                kpis["ticket"] = kpis["net_revenue"] / kpis["total_sales"]
        return kpis
        
    except Exception as e:
        print(f"[DEBUG] ERRO em _get_kpis_for_period: {e}")
        return kpis

# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/healthz")
def api_healthz():
    try:
        fetchone("SELECT 1;", ())
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail={"status": "error", "database": "disconnected", "error": str(e)}
        )

@app.get("/api/overview")
def api_overview(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store_name: Optional[str] = Query(default=None, alias="store"),
    channel_name: Optional[str] = Query(default=None, alias="channel"),
    product: Optional[str] = Query(default=None),
):
    
    kpis_current = _get_kpis_for_period(start_date, end_date, store_id, channel_id, store_name, channel_name)
    pp_from, pp_to = get_previous_period(start_date, end_date)
    kpis_previous = _get_kpis_for_period(pp_from, pp_to, store_id, channel_id, store_name, channel_name)
    
    revenue_change_pct = _calculate_pct_change(kpis_current["net_revenue"], kpis_previous["net_revenue"])
    orders_change_pct = _calculate_pct_change(kpis_current["total_sales"], kpis_previous["total_sales"])
    ticket_change_pct = _calculate_pct_change(kpis_current["ticket"], kpis_previous["ticket"])
    
    base_where = ["created_at_date BETWEEN %s AND %s"]
    params: List[Any] = [start_date, end_date]
    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)
    where = " AND ".join(base_where)
    
    try:
        top_channels = fetchall(f"""
            SELECT channel_name AS label, SUM(total_orders)::numeric AS value
            FROM {MV_KPIS} WHERE {where} AND channel_name IS NOT NULL
            GROUP BY channel_name ORDER BY value DESC LIMIT 5;
        """, tuple(params))
    except Exception:
        top_channels = []

    try:
        top_stores = fetchall(f"""
            SELECT store_name AS label, SUM(total_orders)::numeric AS value
            FROM {MV_KPIS} WHERE {where} AND store_name IS NOT NULL
            GROUP BY store_name ORDER BY value DESC LIMIT 5;
        """, tuple(params))
    except Exception:
        top_stores = []

    try:
        conversions_by_day = fetchall(f"""
            SELECT created_at_date AS date, SUM(total_orders)::numeric AS total_events
            FROM {MV_KPIS} WHERE {where}
            GROUP BY created_at_date ORDER BY created_at_date;
        """, tuple(params))
    except Exception:
        conversions_by_day = []

    try:
        heatmap_where_parts = []
        heatmap_params: List[Any] = []
        if store_id is not None:
            heatmap_where_parts.append("store_id = %s")
            heatmap_params.append(store_id)
        if channel_id is not None:
            heatmap_where_parts.append("channel_id = %s")
            heatmap_params.append(channel_id)
        if store_name is not None:
            heatmap_where_parts.append("store_name = %s")
            heatmap_params.append(store_name)
        if channel_name is not None:
            heatmap_where_parts.append("channel_name = %s")
            heatmap_params.append(channel_name)

        heatmap_where = " AND ".join(heatmap_where_parts)
        if not heatmap_where: heatmap_where = "1=1"

        peak_hour_row = fetchone(f"""
            SELECT hour,
                   SUM(total_orders)::numeric AS total_sales,
                   SUM(total_revenue)::numeric AS revenue
            FROM {MV_HEATMAP} WHERE {heatmap_where}
            GROUP BY hour
            ORDER BY total_sales DESC LIMIT 1;
        """, tuple(heatmap_params))
        peak_hour = {
            "hour": int(peak_hour_row.get("hour", 0)) if peak_hour_row else 0,
            "total_sales": int(peak_hour_row.get("total_sales", 0)) if peak_hour_row else 0,
            "revenue": float(peak_hour_row.get("revenue", 0)) if peak_hour_row else 0,
        }
    except Exception:
        peak_hour = {"hour": 0, "total_sales": 0, "revenue": 0}

    try:
        product_where_parts = ["created_at_date BETWEEN %s AND %s"]
        product_params: List[Any] = [start_date, end_date]
        if store_id is not None:
            product_where_parts.append("store_id = %s")
            product_params.append(store_id)
        if channel_id is not None:
            product_where_parts.append("channel_id = %s")
            product_params.append(channel_id)
        if store_name is not None:
             product_where_parts.append("store_name = %s")
             product_params.append(store_name)
        if channel_name is not None:
             product_where_parts.append("channel_name = %s")
             product_params.append(channel_name)
        if product is not None:
             product_where_parts.append("product_name = %s")
             product_params.append(product)
             
        product_where = " AND ".join(product_where_parts)

        top_products = fetchall(f"""
            SELECT product_name AS product,
                   SUM(total_quantity)::numeric AS quantity,
                   SUM(total_revenue)::numeric AS revenue
            FROM {MV_PRODUCTS}
            WHERE {product_where} AND product_name IS NOT NULL
            GROUP BY product_name ORDER BY revenue DESC LIMIT 10;
        """, tuple(product_params))
    except Exception:
        top_products = []

    return {
        "revenue": kpis_current["net_revenue"],
        "revenue_change_pct": revenue_change_pct,
        "orders": kpis_current["total_sales"],
        "orders_change_pct": orders_change_pct,
        "ticket": kpis_current["ticket"],
        "ticket_change_pct": ticket_change_pct,
        "top_channel": top_channels[0] if top_channels else None,
        "top_channels": top_channels,
        "top_stores": top_stores,
        "top_products": top_products,
        "conversions_by_day": conversions_by_day,
        "peak_hour": peak_hour if peak_hour["total_sales"] > 0 else None,
        "insights": [] 
    }


@app.get("/api/heatmap")
def api_heatmap(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store_name: Optional[str] = Query(default=None, alias="store"),
    channel_name: Optional[str] = Query(default=None, alias="channel"),
):
    base_where = []
    params: List[Any] = []
    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)
        
    where = " AND ".join(base_where)
    if not where: where = "1=1"

    try:
        rows = fetchall(f"""
            SELECT
                dow, hour, SUM(total_orders)::numeric AS value
            FROM {MV_HEATMAP}
            WHERE {where}
            GROUP BY dow, hour
            ORDER BY 1, 2;
        """, tuple(params))
        return {"cells": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

# -----------------------------------------------------------------------------
# Endpoints de Exploração (Custom)
# -----------------------------------------------------------------------------

class MetricOptions(str, Enum):
    revenue = "revenue"
    orders = "orders"
    ticket = "ticket"

class GroupByOptions(str, Enum):
    channel = "channel"
    store = "store"
    date = "date"
    weekday = "weekday"
    hour = "hour"
    product = "product"
    top_items = "top_items"
    delivery_perf = "delivery_perf"
    rfm_at_risk = "rfm_at_risk"


def resolve_grouping(group_by: GroupByOptions) -> Tuple[str, str, str]:
    group_map = {
        "channel": (MV_KPIS, "channel_name", "channel_name"),
        "store":   (MV_KPIS, "store_name",  "store_name"),
        "date":    (MV_KPIS, "created_at_date::text", "created_at_date"),
        "weekday": (MV_HEATMAP, "dow::text", "dow"),
        "hour":    (MV_HEATMAP, "hour::text", "hour"),
        "product": (MV_PRODUCTS, "product_name", "product_name"),
        
        "top_items": (TABLE_RAW_ITEM_SALES, "label", "label"), 
        "delivery_perf": (TABLE_RAW_DELIVERY, "label", "label"),
        "rfm_at_risk": (MV_KPIS, "label", "label"), 
    }
    return group_map.get(group_by.value, (MV_KPIS, "channel_name", "channel_name"))

def resolve_metric(metric: MetricOptions, table: str) -> str:
    if table == MV_KPIS:
        if metric.value == "revenue": return "COALESCE(SUM(total_revenue)::numeric, 0)"
        if metric.value == "ticket":  return "COALESCE(SUM(total_revenue) / NULLIF(SUM(total_orders), 0), 0)::numeric"
        return "SUM(total_orders)::numeric"
    if table == MV_HEATMAP:
        if metric.value == "revenue": return "COALESCE(SUM(total_revenue)::numeric, 0)"
        return "SUM(total_orders)::numeric" 
    if table == MV_PRODUCTS:
        if metric.value == "revenue": return "COALESCE(SUM(total_revenue)::numeric, 0)"
        if metric.value == "ticket":  return "COALESCE(SUM(total_revenue) / NULLIF(SUM(total_quantity), 0), 0)::numeric"
        return "SUM(total_quantity)::numeric"
    return "COUNT(*)::numeric"


def run_custom_query(
    start_date: str,
    end_date: str,
    metric: MetricOptions,
    group_by: GroupByOptions,
    limit: int,
    store_id: Optional[int] = None,
    channel_id: Optional[int] = None,
    store_name: Optional[str] = None,
    channel_name: Optional[str] = None,
    product_name: Optional[str] = None,
) -> List[Dict[str, Any]]:
    
    table_to_use, label_expr, group_col = resolve_grouping(group_by)
    metric_expr = resolve_metric(metric, table_to_use)

    if table_to_use in (MV_KPIS, MV_PRODUCTS):
        base_where = ["created_at_date BETWEEN %s AND %s"]
        params: List[Any] = [start_date, end_date]
    else:
        base_where = []
        params: List[Any] = []

    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)
    if product_name is not None and table_to_use == MV_PRODUCTS:
        base_where.append("product_name = %s")
        params.append(product_name)

    where = " AND ".join(base_where)
    if not where: where = "1=1"

    sql = f"""
        SELECT
            {label_expr} AS label,
            {metric_expr} AS value
        FROM {table_to_use}
        WHERE {where} AND {label_expr} IS NOT NULL
        GROUP BY {group_col}
        ORDER BY value DESC
        LIMIT %s;
    """
    params.append(limit)

    try:
        return fetchall(sql, tuple(params))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

@app.get("/api/custom")
def api_custom(
    metric: MetricOptions,
    group_by: GroupByOptions = Query(..., alias="group_by"),
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    limit: int = Query(10, ge=1, le=100),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store: Optional[str] = Query(default=None),
    channel: Optional[str] = Query(default=None),
    product: Optional[str] = Query(default=None),
):
    try:
        # Roteia para os endpoints de insight se for o caso
        if group_by.value == "top_items":
            return api_top_items(start_date, end_date, store_id, channel_id, limit)
        if group_by.value == "delivery_perf":
            return api_delivery_performance(start_date, end_date, store_id, channel_id, limit)
        if group_by.value == "rfm_at_risk":
            return api_rfm_list(start_date, end_date, store_id, channel_id, store, channel, product, limit)

        data = run_custom_query(
            start_date, end_date, metric, group_by, limit, 
            store_id, channel_id, store, channel, product
        )
        return {"data": data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

@app.get("/api/custom-compare")
def api_custom_compare(
    metric: MetricOptions,
    group_by: GroupByOptions = Query(..., alias="group_by"),
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    limit: int = Query(10, ge=1, le=100),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store: Optional[str] = Query(default=None),
    channel: Optional[str] = Query(default=None),
    product: Optional[str] = Query(default=None),
):
    pp_from, pp_to = get_previous_period(start_date, end_date)
    try:
        data = run_custom_query(
            pp_from, pp_to, metric, group_by, limit, 
            store_id, channel_id, store, channel, product
        )
        return {"data": data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

# -----------------------------------------------------------------------------
# Endpoints de Insights (Raw Data)
# -----------------------------------------------------------------------------

def _build_raw_data_filters(
    date_from: str,
    date_to: str,
    store_id: Optional[int] = None,
    channel_id: Optional[int] = None,
) -> Tuple[str, List[Any]]:
    
    where_parts = [
        "s.sale_status_desc = 'COMPLETED'",
        "DATE(s.created_at) BETWEEN %s AND %s"
    ]
    params: List[Any] = [date_from.strip(), date_to.strip()]

    if store_id is not None:
        where_parts.append("s.store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        where_parts.append("s.channel_id = %s")
        params.append(channel_id)
    
    return " AND ".join(where_parts), params


@app.get("/api/insights/top-items")
def api_top_items(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    limit: int = Query(10, ge=1, le=50),
):
    where, params = _build_raw_data_filters(start_date, end_date, store_id, channel_id)
    sql = f"""
        SELECT
            i.name AS label,
            COUNT(ips.id)::numeric AS value,
            SUM(ips.additional_price)::numeric AS revenue
        FROM {TABLE_RAW_ITEM_SALES} ips
        JOIN {TABLE_RAW_ITEMS} i ON i.id = ips.item_id
        JOIN product_sales ps ON ps.id = ips.product_sale_id
        JOIN {TABLE_RAW_SALES} s ON s.id = ps.sale_id
        WHERE {where} AND i.name IS NOT NULL
        GROUP BY i.name
        ORDER BY value DESC
        LIMIT %s;
    """
    params.append(limit)
    try:
        data = fetchall(sql, tuple(params))
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")


@app.get("/api/insights/delivery-performance")
def api_delivery_performance(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    limit: int = Query(10, ge=1, le=50),
):
    where, params = _build_raw_data_filters(start_date, end_date, store_id, channel_id)
    where += " AND s.delivery_seconds IS NOT NULL AND da.neighborhood IS NOT NULL"
    sql = f"""
        SELECT 
            da.neighborhood AS label,
            COUNT(*)::numeric AS value,
            ROUND(AVG(s.delivery_seconds / 60.0), 2)::numeric AS avg_minutes
        FROM {TABLE_RAW_SALES} s
        JOIN {TABLE_RAW_DELIVERY} da ON da.sale_id = s.id
        WHERE {where}
        GROUP BY da.neighborhood
        HAVING COUNT(*) >= 5
        ORDER BY value DESC
        LIMIT %s;
    """
    params.append(limit)
    try:
        data = fetchall(sql, tuple(params))
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

# -----------------------------------------------------------------------------
# PONTO 9: ENDPOINT DE INSIGHTS AUTOMÁTICOS
# -----------------------------------------------------------------------------

def _get_product_movers(date_from: str, date_to: str, pp_from: str, pp_to: str, store_id: Optional[int], channel_id: Optional[int], store_name: Optional[str], channel_name: Optional[str]) -> List[str]:
    
    base_where = ["created_at_date BETWEEN %s AND %s"]
    pp_where = ["created_at_date BETWEEN %s AND %s"]
    
    params: List[Any] = [date_from, date_to]
    pp_params: List[Any] = [pp_from, pp_to]
    
    if store_id:
        base_where.append("store_id = %s")
        params.append(store_id)
        pp_where.append("store_id = %s")
        pp_params.append(store_id)
    if channel_id:
        base_where.append("channel_id = %s")
        params.append(channel_id)
        pp_where.append("channel_id = %s")
        pp_params.append(channel_id)
    if store_name:
        base_where.append("store_name = %s")
        params.append(store_name)
        pp_where.append("store_name = %s")
        pp_params.append(store_name)
    if channel_name:
        base_where.append("channel_name = %s")
        params.append(channel_name)
        pp_where.append("channel_name = %s")
        pp_params.append(channel_name)

    sql = f"""
        WITH current_period AS (
            SELECT product_name, SUM(total_revenue) as revenue
            FROM {MV_PRODUCTS}
            WHERE {' AND '.join(base_where)}
            GROUP BY product_name
        ),
        previous_period AS (
            SELECT product_name, SUM(total_revenue) as revenue
            FROM {MV_PRODUCTS}
            WHERE {' AND '.join(pp_where)}
            GROUP BY product_name
        ),
        combined AS (
            SELECT
                COALESCE(cp.product_name, pp.product_name) as product,
                COALESCE(cp.revenue, 0) as current_revenue,
                COALESCE(pp.revenue, 0) as previous_revenue,
                (COALESCE(cp.revenue, 0) - COALESCE(pp.revenue, 0)) as diff
            FROM current_period cp
            FULL OUTER JOIN previous_period pp ON cp.product_name = pp.product_name
        )
        (SELECT product, diff, current_revenue, previous_revenue
         FROM combined
         WHERE previous_revenue > 1000
         ORDER BY diff DESC
         LIMIT 2)
        UNION ALL
        (SELECT product, diff, current_revenue, previous_revenue
         FROM combined
         WHERE previous_revenue > 1000
         ORDER BY diff ASC
         LIMIT 2);
    """
    
    try:
        insights = []
        movers = fetchall(sql, tuple(params + pp_params))
        for item in movers:
            if item["diff"] > 0:
                insights.append(f"📈 **Crescimento:** O produto '{item['product']}' cresceu R$ {item['diff']:,.0f} em faturamento.")
            else:
                insights.append(f"📉 **Queda:** O produto '{item['product']}' caiu R$ {abs(item['diff']):,.0f} em faturamento.")
        return insights
    except Exception:
        return []


@app.get("/api/insights/auto")
def api_auto_insights(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store_name: Optional[str] = Query(default=None, alias="store"),
    channel_name: Optional[str] = Query(default=None, alias="channel"),
    product: Optional[str] = Query(default=None),
):
    insights = []
    
    pp_from, pp_to = get_previous_period(start_date, end_date)
    kpis_current = _get_kpis_for_period(start_date, end_date, store_id, channel_id, store_name, channel_name)
    kpis_previous = _get_kpis_for_period(pp_from, pp_to, store_id, channel_id, store_name, channel_name)
    
    rev_change = _calculate_pct_change(kpis_current["net_revenue"], kpis_previous["net_revenue"])
    if rev_change > 10:
        insights.append(f"🎉 **Ótima Notícia!** Seu faturamento cresceu {rev_change:.1f}% em comparação com o período anterior.")
    elif rev_change < -10:
        insights.append(f"⚠️ **Alerta de Faturamento:** Houve uma queda de {abs(rev_change):.1f}% no faturamento em comparação com o período anterior.")
    
    ticket_change = _calculate_pct_change(kpis_current["ticket"], kpis_previous["ticket"])
    if ticket_change < -5:
        insights.append(f"📉 **Atenção:** Seu ticket médio caiu {abs(ticket_change):.1f}%. Verifique se há excesso de descontos ou promoções.")

    product_insights = _get_product_movers(start_date, end_date, pp_from, pp_to, store_id, channel_id, store_name, channel_name)
    insights.extend(product_insights)
    
    return {"insights": insights}


# --- PONTO 16: RFM / ANÁLISE DE CHURN ---
@app.get("/api/insights/rfm-analysis")
def api_rfm_analysis(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store_name: Optional[str] = Query(default=None, alias="store"),
    channel_name: Optional[str] = Query(default=None, alias="channel"),
    product: Optional[str] = Query(default=None), # (Ignorado, mas mantém consistência)
):
    """
    Responde: "Quantos clientes de alto valor estão em risco de churn?"
    Define "Risco" como: Clientes com 2+ pedidos que não compram há 30 dias.
    """
    
    # Filtra por *todo o período* até a data final
    base_where = ["created_at_date <= %s", "customer_id IS NOT NULL"]
    params: List[Any] = [end_date] 

    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)

    where = " AND ".join(base_where)

    sql = f"""
        WITH rfm_base AS (
            SELECT
                customer_id,
                MAX(created_at_date) AS last_order_date,
                SUM(total_orders) AS frequency
            FROM {MV_KPIS} -- Lê da MV rápida!
            WHERE {where}
            GROUP BY customer_id
        ),
        rfm_analysis AS (
            SELECT
                *,
                ( %s::date - last_order_date ) AS recency
            FROM rfm_base
        )
        SELECT 
            COUNT(*) as at_risk_count
        FROM rfm_analysis
        WHERE 
            recency > 30 -- <-- CORRIGIDO (de 60 para 30)
            AND frequency >= 2 -- <-- CORRIGIDO (de 3 para 2)
    """
    params.append(end_date) 
    
    try:
        data = fetchone(sql, tuple(params))
        return {"at_risk_count": data.get("at_risk_count", 0) if data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")

# --- PONTO 17: LISTA DE CLIENTES RFM (ACIONÁVEL) ---
@app.get("/api/insights/rfm-list")
def api_rfm_list(
    start_date: str = Query(..., alias="start_date"),
    end_date: str = Query(..., alias="end_date"),
    store_id: Optional[int] = Query(default=None, alias="store_id"),
    channel_id: Optional[int] = Query(default=None, alias="channel_id"),
    store_name: Optional[str] = Query(default=None, alias="store"),
    channel_name: Optional[str] = Query(default=None, alias="channel"),
    product: Optional[str] = Query(default=None),
    limit: int = Query(100, ge=1, le=1000), 
):
    """
    Retorna a LISTA de clientes de alto valor em risco de churn.
    """
    
    base_where = ["created_at_date <= %s", "customer_id IS NOT NULL"]
    params: List[Any] = [end_date] 

    if store_id is not None:
        base_where.append("store_id = %s")
        params.append(store_id)
    if channel_id is not None:
        base_where.append("channel_id = %s")
        params.append(channel_id)
    if store_name is not None:
        base_where.append("store_name = %s")
        params.append(store_name)
    if channel_name is not None:
        base_where.append("channel_name = %s")
        params.append(channel_name)

    where = " AND ".join(base_where)

    sql = f"""
        WITH rfm_base AS (
            SELECT
                customer_id,
                MAX(created_at_date) AS last_order_date,
                SUM(total_orders) AS frequency,
                SUM(total_revenue) AS monetary
            FROM {MV_KPIS}
            WHERE {where}
            GROUP BY customer_id
        ),
        rfm_analysis AS (
            SELECT
                *,
                ( %s::date - last_order_date ) AS recency
            FROM rfm_base
        )
        SELECT 
            c.customer_name AS label, -- O 'label' que o frontend espera
            rfm.monetary AS value      -- O 'value' que o frontend espera
        FROM rfm_analysis rfm
        JOIN {TABLE_RAW_CUSTOMERS} c ON c.id = rfm.customer_id
        WHERE 
            rfm.recency > 30 -- <-- CORRIGIDO (de 60 para 30)
            AND rfm.frequency >= 2 -- <-- CORRIGIDO (de 3 para 2)
        ORDER BY
            rfm.monetary DESC
        LIMIT %s;
    """
    params.append(end_date) 
    params.append(limit)
    
    try:
        data = fetchall(sql, tuple(params))
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {e}")
