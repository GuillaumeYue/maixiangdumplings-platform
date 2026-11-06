"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyAdmin } from "@/lib/mail";
import { isOpenAt, MIN_LEAD_MINUTES } from "@/lib/hours";
import type { ActionState } from "./auth";

const lineSchema = z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(20) })).min(1);

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "loginToOrder" };

  let lines: z.infer<typeof lineSchema>;
  try {
    lines = lineSchema.parse(JSON.parse(String(formData.get("lines") ?? "[]")));
  } catch {
    return { error: "errEmpty" };
  }

  const pickupAt = new Date(String(formData.get("pickupAt")));
  if (Number.isNaN(pickupAt.getTime())) return { error: "errClosed" };
  if (pickupAt.getTime() < Date.now() + MIN_LEAD_MINUTES * 60000) return { error: "errTooSoon" };
  if (!isOpenAt(pickupAt)) return { error: "errClosed" };

  const items = await prisma.menuItem.findMany({ where: { id: { in: lines.map((l) => l.id) } } });
  if (items.length !== lines.length || items.some((i) => !i.isAvailable)) return { error: "errUnavailable" };

  const orderItems = lines.map((l) => {
    const item = items.find((i) => i.id === l.id)!;
    return { menuItemId: item.id, nameSnapshot: item.nameFr, quantity: l.qty, unitPriceCents: item.priceCents };
  });
  const totalCents = orderItems.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0);
  const note = String(formData.get("note") ?? "").trim().slice(0, 300) || null;

  await prisma.order.create({
    data: { userId: user.id, pickupAt, note, totalCents, items: { create: orderItems } },
  });

  await notifyAdmin({
    subject: `Nouvelle commande à emporter · ${pickupAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`,
    text: [
      `Client : ${user.name} (${user.email})`,
      `Ramassage : ${pickupAt.toLocaleString("fr-CA")}`,
      ...orderItems.map((i) => `  ${i.quantity} × ${i.nameSnapshot}`),
      `Total : ${(totalCents / 100).toFixed(2)} $ (paiement sur place)`,
      note ? `Note : ${note}` : "",
    ].filter(Boolean).join("\n"),
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { time: pickupAt.toISOString() } };
}
