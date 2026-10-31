import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { formatMoney, localDesc, localName } from "@/lib/format";

export async function generateMetadata() {
  const t = await getTranslations("Menu");
  return { title: t("title") };
}

export default async function MenuPage() {
  const [locale, t, categories] = await Promise.all([
    getLocale(),
    getTranslations("Menu"),
    prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {categories.map((c) => (
        <section key={c.id} id={c.slug}>
          <h2 className="mb-3 text-xl font-semibold">{localName(c, locale)}</h2>
          <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
            {c.items.map((i) => {
              const desc = localDesc(i, locale);
              return (
                <li key={i.id} className={`flex items-start gap-4 p-4 ${i.isAvailable ? "" : "opacity-50"}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{localName(i, locale)}</span>
                      {i.isLoyaltyEligible && <span className="badge bg-brand-100 text-brand-700">{t("loyalty")}</span>}
                      {!i.isAvailable && <span className="badge bg-zinc-200 text-zinc-700">{t("soldOut")}</span>}
                    </div>
                    {desc && <p className="mt-0.5 text-sm text-ink/60">{desc}</p>}
                  </div>
                  <div className="font-medium tabular-nums">{formatMoney(i.priceCents, locale)}</div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
