import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getLoyaltyBalance } from "@/lib/loyalty";
import { MenuWithCart } from "./MenuWithCart";

export async function generateMetadata() {
  const t = await getTranslations("Menu");
  return { title: t("title") };
}

export default async function MenuPage() {
  const [locale, user, categories] = await Promise.all([
    getLocale(),
    getCurrentUser(),
    prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);
  const balance = user ? await getLoyaltyBalance(user.id) : 0;
  return <MenuWithCart categories={categories} locale={locale} loggedIn={!!user} loyaltyBalance={balance} />;
}
