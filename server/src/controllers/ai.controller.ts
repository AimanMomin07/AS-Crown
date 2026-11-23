import { Request, Response } from "express";
import pool from "../config/database.js";

async function buildSocietyContext() {
  const [residentRows] = await pool.execute(`
    SELECT COUNT(*) AS total FROM users u INNER JOIN roles r ON r.id = u.role_id
    WHERE LOWER(r.name) = 'resident' AND u.status = 'active'
  `);
  const [flatRows] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN occupancy_status = 'vacant' THEN 1 ELSE 0 END) AS vacant,
      SUM(CASE WHEN occupancy_status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
      SUM(CASE WHEN occupancy_status = 'rented' THEN 1 ELSE 0 END) AS rented
    FROM flats WHERE status = 'active'
  `);
  const [billRows] = await pool.execute(`
    SELECT
      COALESCE(SUM(total_amount),0) AS billed,
      COALESCE(SUM(CASE WHEN status IN ('pending','partially_paid','overdue') THEN total_amount ELSE 0 END),0) AS pending,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END),0) AS paid
    FROM maintenance_bills
  `);
  const [complaintRows] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) AS urgent
    FROM complaints
  `);
  const [visitorRows] = await pool.execute(`
    SELECT
      SUM(CASE WHEN status = 'inside' THEN 1 ELSE 0 END) AS inside,
      SUM(CASE WHEN status = 'expected' THEN 1 ELSE 0 END) AS expected
    FROM visitors
  `);
  return {
    residents: (residentRows as any[])[0],
    flats: (flatRows as any[])[0],
    bills: (billRows as any[])[0],
    complaints: (complaintRows as any[])[0],
    visitors: (visitorRows as any[])[0]
  };
}

export async function askAssistant(req: Request, res: Response) {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ success: false, message: "Question is required" });

    const context = await buildSocietyContext();
    const q = question.toLowerCase();
    let answer = "";

    if (q.includes("vacant") || q.includes("empty flat")) {
      answer = `AS CROWN currently has ${Number(context.flats.vacant || 0)} vacant flats out of ${Number(context.flats.total || 0)} active flats.`;
    } else if (q.includes("occupied")) {
      answer = `There are ${Number(context.flats.occupied || 0)} occupied flats and ${Number(context.flats.rented || 0)} rented flats.`;
    } else if (q.includes("resident")) {
      answer = `AS CROWN currently has ${Number(context.residents.total || 0)} active residents.`;
    } else if (q.includes("bill") || q.includes("maintenance")) {
      answer = `Total billed is ₹${Number(context.bills.billed || 0).toLocaleString("en-IN")}, with ₹${Number(context.bills.pending || 0).toLocaleString("en-IN")} currently pending and ₹${Number(context.bills.paid || 0).toLocaleString("en-IN")} marked paid.`;
    } else if (q.includes("complaint")) {
      answer = `There are ${Number(context.complaints.total || 0)} complaints, ${Number(context.complaints.open || 0)} open, ${Number(context.complaints.in_progress || 0)} in progress, and ${Number(context.complaints.urgent || 0)} urgent.`;
    } else if (q.includes("visitor") || q.includes("gate")) {
      answer = `Security currently shows ${Number(context.visitors.inside || 0)} visitors inside and ${Number(context.visitors.expected || 0)} expected visitors.`;
    } else {
      answer = `AS CROWN snapshot: ${Number(context.residents.total || 0)} active residents, ${Number(context.flats.total || 0)} active flats, ₹${Number(context.bills.pending || 0).toLocaleString("en-IN")} pending bills, ${Number(context.complaints.open || 0)} open complaints, and ${Number(context.visitors.inside || 0)} visitors inside.`;
    }

    return res.json({ success: true, data: { answer, context } });
  } catch (error) {
    console.error("AI assistant error:", error);
    return res.status(500).json({ success: false, message: "Unable to process assistant request" });
  }
}
