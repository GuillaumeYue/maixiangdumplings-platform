import { prisma } from "@/lib/db";

/** Buy 10 portions of dumplings, the 11th is free. */
export const REWARD_STAMPS = 10;

export async function getLoyaltyBalance(userId: string) {
  const agg = await prisma.loyaltyTransaction.aggregate({ where: { userId }, _sum: { delta: true } });
  return agg._sum.delta ?? 0;
}
