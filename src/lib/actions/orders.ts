"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyAdmin } from "@/lib/mail";
import { isOpenAt, MIN_LEAD_MINUTES } from "@/lib/hours";
import { getLoyaltyBalance, REWARD_STAMPS } from "@/lib/loyalty";
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
    return { menuItemId: item.id, nameSnapshot: item.nameFr, quantity: l.qty, unitPriceCents: item.priceCents, loyalty: item.isLoyaltyEligible };
  });
  const subtotalCents = orderItems.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0);

  // Loyalty: one stamp per eligible portion; 10 stamps = the cheapest eligible portion free.
  const eligible = orderItems.filter((l) => l.loyalty);
  const earned = eligible.reduce((s, l) => s + l.quantity, 0);
  const wantsReward = formData.get("useReward") === "on";
  const balance = wantsReward ? await getLoyaltyBalance(user.id) : 0;
  const useReward = wantsReward && balance >= REWARD_STAMPS && eligible.length > 0;
  const discountCents = useReward ? Math.min(...eligible.map((l) => l.unitPriceCents)) : 0;
  const totalCents = subtotalCents - discountCents;
  const note = String(formData.get("note") ?? "").trim().slice(0, 300) || null;

  await prisma.order.create({
    data: {
      userId: user.id,
      pickupAt,
      note,
      totalCents,
      usedReward: useReward,
      items: { create: orderItems.map((l) => ({ menuItemId: l.menuItemId, nameSnapshot: l.nameSnapshot, quantity: l.quantity, unitPriceCents: l.unitPriceCents })) },
      loyalty: {
        create: [
          ...(useReward ? [{ userId: user.id, delta: -REWARD_STAMPS, reason: "REWARD_REDEEMED" }] : []),
          ...(earned > 0 ? [{ userId: user.id, delta: earned, reason: "STAMPS_EARNED" }] : []),
        ],
      },
    },
  });

  await notifyAdmin({
    subject: `Nouvelle commande à emporter · ${pickupAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`,
    text: [
      `Client : ${user.name} (${user.email})`,
      `Ramassage : ${pickupAt.toLocaleString("fr-CA")}`,
      ...orderItems.map((i) => `  ${i.quantity} × ${i.nameSnapshot}`),
      `Total : ${(totalCents / 100).toFixed(2)} $ (paiement sur place)`,
      useReward ? "Inclut 1 portion de raviolis gratuite (fidélité)" : "",
      note ? `Note : ${note}` : "",
    ].filter(Boolean).join("\n"),
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { time: pickupAt.toISOString() } };
}
