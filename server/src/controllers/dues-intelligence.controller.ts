import { Response } from "express";

import pool from "../config/database.js";

/* =========================================================
   RISK SCORING

   A rule-based predictive model (no external ML service
   required) that turns each flat's billing + payment
   history into a 0-100 default-risk score:

     +10 for every currently overdue bill   (cap 40)
     +1  per 3 days of the oldest overdue    (cap 30)
     +up to 30 based on historical late-payment ratio

   0-29  = low risk
   30-59 = medium risk
   60+   = high risk
========================================================= */

function scoreFlat(overdueCount: number, maxDaysOverdue: number, lateRatio: number) {
  const overdueScore = Math.min(40, overdueCount * 10);
  const agingScore = Math.min(30, Math.floor(maxDaysOverdue / 3));
  const historyScore = Math.min(30, Math.round(lateRatio * 30));
  const score = Math.min(100, overdueScore + agingScore + historyScore);

  let riskLevel: "low" | "medium" | "high" = "low";
  if (score >= 60) riskLevel = "high";
  else if (score >= 30) riskLevel = "medium";

  return { score, riskLevel };
}

export async function getDuesIntelligence(_req: any, res: Response) {
  try {
    // Current outstanding position per flat
    const [currentRows] = await pool.execute(`
      SELECT
        f.id AS flat_id,
        f.flat_number,
        b.name AS building_name,
        u.first_name,
        u.last_name,
        u.mobile,
        COALESCE(SUM(CASE WHEN mb.status IN ('pending','partially_paid','overdue') THEN mb.total_amount ELSE 0 END), 0) AS outstanding,
        SUM(CASE WHEN mb.status = 'overdue' OR (mb.status != 'paid' AND mb.due_date < CURDATE()) THEN 1 ELSE 0 END) AS overdue_count,
        COALESCE(MAX(CASE WHEN mb.status != 'paid' AND mb.due_date < CURDATE() THEN DATEDIFF(CURDATE(), mb.due_date) ELSE 0 END), 0) AS max_days_overdue
      FROM flats f
      LEFT JOIN buildings b ON b.id = f.building_id
      LEFT JOIN users u ON u.id = COALESCE(f.tenant_id, f.owner_id)
      LEFT JOIN maintenance_bills mb ON mb.flat_id = f.id
      WHERE f.status = 'active'
      GROUP BY f.id, f.flat_number, b.name, u.first_name, u.last_name, u.mobile
    `);

    // Historical lateness ratio per flat (paid bills vs how late the payment landed)
    const [historyRows] = await pool.execute(`
      SELECT
        mb.flat_id,
        COUNT(*) AS paid_count,
        SUM(CASE WHEN p.paid_at IS NOT NULL AND DATEDIFF(p.paid_at, mb.due_date) > 0 THEN 1 ELSE 0 END) AS late_count
      FROM maintenance_bills mb
      INNER JOIN payments p ON p.bill_id = mb.id AND p.payment_status = 'success'
      WHERE mb.status = 'paid'
      GROUP BY mb.flat_id
    `);

    const historyMap: Record<number, { paid: number; late: number }> = {};
    for (const row of historyRows as any[]) {
      historyMap[row.flat_id] = { paid: Number(row.paid_count), late: Number(row.late_count) };
    }

    const flats = (currentRows as any[]).map(row => {
      const history = historyMap[row.flat_id] || { paid: 0, late: 0 };
      const lateRatio = history.paid > 0 ? history.late / history.paid : 0;
      const { score, riskLevel } = scoreFlat(
        Number(row.overdue_count),
        Number(row.max_days_overdue),
        lateRatio
      );

      return {
        flatId: row.flat_id,
        flatNumber: row.flat_number,
        buildingName: row.building_name,
        residentName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unassigned",
        residentPhone: row.mobile,
        outstanding: Number(row.outstanding),
        overdueCount: Number(row.overdue_count),
        maxDaysOverdue: Number(row.max_days_overdue),
        lateRatio: Number(lateRatio.toFixed(2)),
        riskScore: score,
        riskLevel
      };
    });

    flats.sort((a, b) => b.riskScore - a.riskScore);

    const summary = {
      totalOutstanding: flats.reduce((sum, f) => sum + f.outstanding, 0),
      highRiskFlats: flats.filter(f => f.riskLevel === "high").length,
      mediumRiskFlats: flats.filter(f => f.riskLevel === "medium").length,
      lowRiskFlats: flats.filter(f => f.riskLevel === "low").length,
      highRiskOutstanding: flats.filter(f => f.riskLevel === "high").reduce((sum, f) => sum + f.outstanding, 0),
      projectedNextMonthDefault: Math.round(
        flats.reduce((sum, f) => sum + f.outstanding * (f.riskScore / 100), 0)
      )
    };

    return res.json({ success: true, data: { summary, flats: flats.slice(0, 200) } });
  } catch (error) {
    console.error("Dues intelligence error:", error);
    return res.status(500).json({ success: false, message: "Unable to compute dues intelligence" });
  }
}
