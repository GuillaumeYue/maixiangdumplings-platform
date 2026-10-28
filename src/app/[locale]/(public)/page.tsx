import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const favorites = [
  { key: "porkCabbage", price: "13,95 $" },
  { key: "porkChive", price: "13,95 $" },
  { key: "beefOnion", price: "14,95 $" },
  { key: "shrimpPork", price: "16,95 $" },
] as const;

export default async function HomePage() {
  const t = await getTranslations("Home");
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{t("heroTitle")}</h1>
          <p className="text-lg text-ink/70">{t("heroText")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">{t("ctaOrder")}</Link>
            <Link href="/" className="btn-outline">{t("ctaReserve")}</Link>
          </div>
        </div>
        <div className="card space-y-4">
          <div>
            <h2 className="font-semibold">{t("hoursTitle")}</h2>
            <p className="text-sm text-ink/70">{t("hours")}</p>
            <p className="text-sm text-ink/50">{t("closedMonday")}</p>
          </div>
          <div className="rounded-lg bg-brand-50 p-4">
            <h3 className="font-semibold text-brand-700">{t("loyaltyTitle")}</h3>
            <p className="text-sm text-ink/70">{t("loyaltyText")}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">{t("favoritesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {favorites.map((f) => (
            <div key={f.key} className="card flex flex-col gap-2">
              <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-brand-100 to-brand-50" aria-hidden />
              <div className="font-medium">{t(`favorites.${f.key}`)}</div>
              <div className="text-sm text-ink/60">{f.price}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
