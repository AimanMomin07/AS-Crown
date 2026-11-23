import { Response } from "express";

import pool from "../config/database.js";

const METRIC_TYPES = [
  "water_tank",
  "electricity",
  "waste_segregation",
  "ev_charging",
  "rainwater_harvest",
  "solar_generation"
];

/* =========================================================
   RECORD A METRIC  (admin / staff)
========================================================= */

export async function recordMetric(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const { metricType, buildingId, value, unit, recordedAt, notes } = req.body || {};

    if (!METRIC_TYPES.includes(metricType)) {
      return res.status(400).json({ success: false, message: "Invalid metric type" });
    }
    if (value === undefined || isNaN(Number(value))) {
      return res.status(400).json({ success: false, message: "A numeric value is required" });
    }
    if (!unit) {
      return res.status(400).json({ success: false, message: "Unit is required (e.g. %, kL, kWh)" });
    }

    await pool.execute(
      `INSERT INTO sustainability_metrics (metric_type, building_id, value, unit, recorded_by, recorded_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        metricType,
        buildingId || null,
        Number(value),
        String(unit).trim(),
        userId,
        recordedAt || new Date().toISOString().slice(0, 10),
        notes || null
      ]
    );

    return res.status(201).json({ success: true, message: "Metric recorded" });
  } catch (error) {
    console.error("Record metric error:", error);
    return res.status(500).json({ success: false, message: "Unable to record metric" });
  }
}

/* =========================================================
   DASHBOARD  (all roles — residents see read-only view)
========================================================= */

export async function getDashboard(_req: any, res: Response) {
  try {
    // Latest reading per metric type
    const [latestRows] = await pool.execute(`
      SELECT sm.metric_type, sm.value, sm.unit, sm.recorded_at
      FROM sustainability_metrics sm
      INNER JOIN (
        SELECT metric_type, MAX(recorded_at) AS max_date
        FROM sustainability_metrics
        GROUP BY metric_type
      ) latest ON latest.metric_type = sm.metric_type AND latest.max_date = sm.recorded_at
      GROUP BY sm.metric_type, sm.value, sm.unit, sm.recorded_at
    `);

    // 30-day trend per metric type
    const [trendRows] = await pool.execute(`
      SELECT metric_type, value, unit, recorded_at
      FROM sustainability_metrics
      WHERE recorded_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY metric_type, recorded_at ASC
    `);

    const trends: Record<string, { date: string; value: number }[]> = {};
    for (const row of trendRows as any[]) {
      if (!trends[row.metric_type]) trends[row.metric_type] = [];
      trends[row.metric_type].push({ date: row.recorded_at, value: Number(row.value) });
    }

    const latest: Record<string, { value: number; unit: string; recordedAt: string }> = {};
    for (const row of latestRows as any[]) {
      latest[row.metric_type] = { value: Number(row.value), unit: row.unit, recordedAt: row.recorded_at };
    }

    return res.json({ success: true, data: { latest, trends } });
  } catch (error) {
    console.error("Sustainability dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch dashboard" });
  }
}

/* =========================================================
   HISTORY FOR ONE METRIC  (all roles)
========================================================= */

export async function getMetricHistory(req: any, res: Response) {
  try {
    const metricType = String(req.params.metricType || "");
    if (!METRIC_TYPES.includes(metricType)) {
      return res.status(400).json({ success: false, message: "Invalid metric type" });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM sustainability_metrics WHERE metric_type = ? ORDER BY recorded_at DESC LIMIT 90`,
      [metricType]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Metric history error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch history" });
  }
}
