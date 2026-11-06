"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyAdmin } from "@/lib/mail";
import { isOpenAt, RESERVATION_SLOT_CAPACITY } from "@/lib/hours";
import type { ActionState } from "./auth";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(8),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(7).max(30),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function createReservation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "errInvalid" };
  const { date, time, partySize, name, phone, note } = parsed.data;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const reservedAt = new Date(y, m - 1, d, hh, mm);
  if (reservedAt.getTime() < Date.now()) return { error: "errPast" };
  if (!isOpenAt(reservedAt)) return { error: "errClosed" };

  // Guests already booked in the same half-hour slot.
  const slotEnd = new Date(reservedAt.getTime() + 30 * 60000);
  const booked = await prisma.reservation.aggregate({
    where: { reservedAt: { gte: reservedAt, lt: slotEnd }, status: { in: ["PENDING", "CONFIRMED", "SEATED"] } },
    _sum: { partySize: true },
  });
  if ((booked._sum.partySize ?? 0) + partySize > RESERVATION_SLOT_CAPACITY) return { error: "errFull" };

  const user = await getCurrentUser();
  await prisma.reservation.create({
    data: { userId: user?.id, name, phone, partySize, reservedAt, note: note || null },
  });
  await notifyAdmin({
    subject: `Nouvelle réservation · ${reservedAt.toLocaleString("fr-CA")} · ${partySize} pers.`,
    text: `${name} · ${phone}${note ? `\nNote : ${note}` : ""}`,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
