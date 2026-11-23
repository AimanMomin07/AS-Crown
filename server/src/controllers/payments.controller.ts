import { Request, Response } from "express";
import pool from "../config/database.js";

import {
  createUserNotification
} from "../utils/notification.js";

async function refreshBillStatus(billId: number) {
  const [billRows] = await pool.execute(
    "SELECT total_amount FROM maintenance_bills WHERE id = ? LIMIT 1",
    [billId]
  );
  const bill = (billRows as any[])[0];
  if (!bill) return;

  const [paymentRows] = await pool.execute(
    `SELECT COALESCE(SUM(amount), 0) AS paid
     FROM payments
     WHERE bill_id = ? AND payment_status = 'success'`,
    [billId]
  );

  const paid = Number((paymentRows as any[])[0]?.paid || 0);
  const total = Number(bill.total_amount || 0);
  const status = paid <= 0 ? "pending" : paid >= total ? "paid" : "partially_paid";

  await pool.execute(
    "UPDATE maintenance_bills SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, billId]
  );
}

export async function getPayments(req: Request, res: Response) {
  try {
    const status = String(req.query.status || "").trim();
    const userId = String(req.query.userId || "").trim();
    const billId = String(req.query.billId || "").trim();

    const conditions = ["1=1"];
    const params: unknown[] = [];

    if (status) {
      conditions.push("p.payment_status = ?");
      params.push(status);
    }

    if (userId) {
      conditions.push("p.user_id = ?");
      params.push(Number(userId));
    }

    if (billId) {
      conditions.push("p.bill_id = ?");
      params.push(Number(billId));
    }

    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        mb.bill_number,
        mb.total_amount AS bill_total,
        f.flat_number,
        b.name AS building_name,
        b.building_code,
        u.first_name,
        u.last_name,
        u.email,
        u.mobile
      FROM payments p
      INNER JOIN maintenance_bills mb
        ON mb.id = p.bill_id
      LEFT JOIN flats f
        ON f.id = mb.flat_id
      LEFT JOIN buildings b
        ON b.id = f.building_id
      LEFT JOIN users u
        ON u.id = p.user_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.created_at DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: { payments: rows }
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payments"
    });
  }
}

export async function recordPayment(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const billId = Number(body.billId);
    const userId = Number(body.userId);
    const amount = Number(body.amount);
    const method = body.paymentMethod || "upi";

    const methods = [
      "cash",
      "upi",
      "card",
      "net_banking",
      "bank_transfer",
      "other"
    ];

    if (
      !Number.isInteger(billId) ||
      !Number.isInteger(userId) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !methods.includes(method)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid bill, user, amount and payment method are required"
      });
    }

    const [billRows] = await pool.execute(
      `
      SELECT
        id,
        bill_number,
        total_amount
      FROM maintenance_bills
      WHERE id = ?
      LIMIT 1
      `,
      [billId]
    );

    if (!(billRows as any[]).length) {
      return res.status(404).json({
        success: false,
        message: "Bill not found"
      });
    }

    const paymentNumber = `PAY-${Date.now()}`;

    const [result] = await pool.execute(
      `INSERT INTO payments
       (payment_number, bill_id, user_id, amount, payment_method, transaction_id, payment_status, paid_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'success', CURRENT_TIMESTAMP, ?)`,
      [
        paymentNumber,
        billId,
        userId,
        amount,
        method,
        body.transactionId || null,
        body.notes || null
      ]
    );

    await refreshBillStatus(billId);

    await createUserNotification(
      userId,
      "Payment received",
      `Your payment of ₹${amount.toFixed(2)} for bill ${
        (billRows as any[])[0]?.bill_number || billId
      } was recorded successfully.`,
      "payment"
    );

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        id: (result as any).insertId,
        paymentNumber
      }
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to record payment"
    });
  }
}

export async function updatePaymentStatus(req: Request, res: Response) {
  try {
    const paymentId = Number(req.params.id);
    const status = String(req.body?.status || "");
    const allowed = ["pending", "success", "failed", "refunded"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        bill_id,
        user_id,
        amount,
        payment_number
      FROM payments
      WHERE id = ?
      LIMIT 1
      `,
      [paymentId]
    );

    const payment = (rows as any[])[0];

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    await pool.execute(
      "UPDATE payments SET payment_status = ?, paid_at = CASE WHEN ? = 'success' THEN COALESCE(paid_at, CURRENT_TIMESTAMP) ELSE paid_at END WHERE id = ?",
      [status, status, paymentId]
    );

    await refreshBillStatus(Number(payment.bill_id));

    if (status === "success") {
      await createUserNotification(
  Number(payment.user_id),
  "Payment confirmed",
  `Payment ${payment.payment_number} of ₹${Number(
          payment.amount
        ).toFixed(2)} has been confirmed.`,
  "payment"
);
    }

    return res.json({
      success: true,
      message: "Payment status updated successfully"
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update payment status"
    });
  }
}