"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyAdmin } from "@/lib/mail";
import type { ActionState } from "./auth";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(3).max(500),
});

export async function createReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "loginToReview" };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "errInvalid" };

  // One review per customer per 24 hours.
  const recent = await prisma.review.findFirst({
    where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 24 * 3600000) } },
  });
  if (recent) return { error: "errRate" };

  await prisma.review.create({ data: { userId: user.id, rating: parsed.data.rating, body: parsed.data.body } });
  await notifyAdmin({ subject: `Nouvel avis ${parsed.data.rating}/5 de ${user.name}`, text: parsed.data.body });

  revalidatePath("/", "layout");
  return { ok: true };
}
