import { Response } from "express";

import pool from "../config/database.js";
import { createUserNotification } from "../utils/notification.js";

/* =========================================================
   HELPERS
========================================================= */

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}

async function getResidentFlat(userId: number) {
  const [rows] = await pool.execute(
    `SELECT f.id FROM flats f WHERE (f.owner_id = ? OR f.tenant_id = ?) LIMIT 1`,
    [userId, userId]
  );
  return (rows as any[])[0]?.id || null;
}

/* =========================================================
   AVAILABLE SLOTS FOR A DATE
========================================================= */

export async function getAvailableSlots(req: any, res: Response) {
  try {
    const amenityId = Number(req.params.amenityId);
    const date = String(req.query.date || "");

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, message: "A valid date is required" });
    }

    const [amenityRows] = await pool.execute(`SELECT * FROM amenities WHERE id = ? LIMIT 1`, [amenityId]);
    const amenity = (amenityRows as any[])[0];

    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    const [bookingRows] = await pool.execute(
      `SELECT start_time, end_time, COUNT(*) AS booked
       FROM amenity_bookings
       WHERE amenity_id = ? AND booking_date = ? AND status = 'confirmed'
       GROUP BY start_time, end_time`,
      [amenityId, date]
    );

    const bookedCounts: Record<string, number> = {};
    for (const row of bookingRows as any[]) {
      bookedCounts[`${row.start_time}-${row.end_time}`] = row.booked;
    }

    const openMin = toMinutes(amenity.open_time);
    const closeMin = toMinutes(amenity.close_time);
    const slotLen = amenity.slot_minutes;

    const slots = [];
    for (let start = openMin; start + slotLen <= closeMin; start += slotLen) {
      const startTime = toTimeString(start);
      const endTime = toTimeString(start + slotLen);
      const key = `${startTime}-${endTime}`;
      const booked = bookedCounts[key] || 0;

      slots.push({
        startTime,
        endTime,
        capacity: amenity.capacity,
        booked,
        available: Math.max(0, amenity.capacity - booked)
      });
    }

    return res.json({ success: true, data: { amenity, slots } });
  } catch (error) {
    console.error("Get available slots error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch availability" });
  }
}

/* =========================================================
   CREATE BOOKING  (resident)
========================================================= */

export async function createBooking(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const { amenityId, bookingDate, startTime, endTime, guests, notes } = req.body || {};

    if (!amenityId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "Amenity, date and time slot are required" });
    }

    const [amenityRows] = await pool.execute(`SELECT * FROM amenities WHERE id = ? AND status = 'active'`, [amenityId]);
    const amenity = (amenityRows as any[])[0];

    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not available" });
    }

    const requested = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + amenity.max_advance_days);

    if (requested < today) {
      return res.status(400).json({ success: false, message: "Cannot book a past date" });
    }
    if (requested > maxDate) {
      return res.status(400).json({ success: false, message: `Bookings allowed up to ${amenity.max_advance_days} days in advance` });
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM amenity_bookings
       WHERE amenity_id = ? AND booking_date = ? AND start_time = ? AND end_time = ? AND status = 'confirmed'`,
      [amenityId, bookingDate, startTime, endTime]
    );

    const bookedCount = Number((countRows as any[])[0]?.total || 0);
    if (bookedCount >= amenity.capacity) {
      return res.status(409).json({ success: false, message: "This slot is fully booked" });
    }

    const flatId = await getResidentFlat(userId);

    const [result] = await pool.execute(
      `INSERT INTO amenity_bookings (amenity_id, user_id, flat_id, booking_date, start_time, end_time, guests, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [amenityId, userId, flatId, bookingDate, startTime, endTime, Number(guests) || 1, notes || null]
    );

    await createUserNotification(
      userId,
      "Booking confirmed",
      `Your booking for ${amenity.name} on ${bookingDate} (${startTime}-${endTime}) is confirmed.`,
      "system"
    );

    return res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking" });
  }
}

/* =========================================================
   MY BOOKINGS  (resident)
========================================================= */

export async function getMyBookings(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);

    const [rows] = await pool.execute(
      `SELECT ab.*, a.name AS amenity_name, a.category, a.booking_fee
       FROM amenity_bookings ab
       INNER JOIN amenities a ON a.id = ab.amenity_id
       WHERE ab.user_id = ?
       ORDER BY ab.booking_date DESC, ab.start_time DESC
       LIMIT 100`,
      [userId]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch bookings" });
  }
}

/* =========================================================
   CANCEL BOOKING  (resident / admin)
========================================================= */

export async function cancelBooking(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const role = req.user?.role;
    const id = Number(req.params.id);

    const query = role === "admin"
      ? `UPDATE amenity_bookings SET status = 'cancelled' WHERE id = ?`
      : `UPDATE amenity_bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?`;

    const params = role === "admin" ? [id] : [id, userId];

    const [result] = await pool.execute(query, params);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ success: false, message: "Unable to cancel booking" });
  }
}

/* =========================================================
   ALL BOOKINGS  (admin)
========================================================= */

export async function getAllBookings(req: any, res: Response) {
  try {
    const amenityId = req.query.amenityId ? Number(req.query.amenityId) : null;
    const status = String(req.query.status || "").trim();

    const conditions: string[] = ["1=1"];
    const params: any[] = [];

    if (amenityId) {
      conditions.push("ab.amenity_id = ?");
      params.push(amenityId);
    }
    if (status) {
      conditions.push("ab.status = ?");
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT ab.*, a.name AS amenity_name, u.first_name, u.last_name, f.flat_number
       FROM amenity_bookings ab
       INNER JOIN amenities a ON a.id = ab.amenity_id
       LEFT JOIN users u ON u.id = ab.user_id
       LEFT JOIN flats f ON f.id = ab.flat_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY ab.booking_date DESC, ab.start_time DESC
       LIMIT 200`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch bookings" });
  }
}
