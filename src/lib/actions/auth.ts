"use server";

import { z } from "zod";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type ActionState = { error?: string; ok?: boolean; data?: Record<string, string> };

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1), next: z.string().optional() });

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "errInvalid" };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return { error: "errInvalid" };
  await createSession(user);
  const locale = await getLocale();
  const next = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "/";
  redirect({ href: next, locale });
  return { ok: true };
}

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const weak = parsed.error.issues.some((i) => i.path[0] === "password");
    return { error: weak ? "errWeak" : "errInvalid" };
  }
  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return { error: "errExists" };
  const locale = await getLocale();
  const user = await prisma.user.create({
    data: { email, name: parsed.data.name, phone: parsed.data.phone || null, passwordHash: await hashPassword(parsed.data.password), locale },
  });
  await createSession(user);
  redirect({ href: "/", locale });
  return { ok: true };
}

export async function logout() {
  await destroySession();
  redirect({ href: "/", locale: await getLocale() });
}
