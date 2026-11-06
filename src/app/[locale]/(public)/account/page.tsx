import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export async function generateMetadata() {
  const t = await getTranslations("Account");
  return { title: t("title") };
}

export default async function AccountPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login?next=/account", locale });
  const t = await getTranslations("Account");
  const [orders, reservations] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: true },
    }),
    prisma.reservation.findMany({ where: { userId: user.id }, orderBy: { reservedAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <section>
        <h2 className="mb-3 font-semibold">{t("orders")}</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-ink/60">{t("noOrders")}</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="card flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <div className="font-medium">{formatDateTime(o.pickupAt, locale)}</div>
                  <div className="text-ink/60">{o.items.map((i) => `${i.quantity} × ${i.nameSnapshot}`).join(", ")}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums">{formatMoney(o.totalCents, locale)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-semibold">{t("reservations")}</h2>
        {reservations.length === 0 ? (
          <p className="text-sm text-ink/60">{t("noReservations")}</p>
        ) : (
          <ul className="space-y-2">
            {reservations.map((r) => (
              <li key={r.id} className="card flex items-center justify-between py-3 text-sm">
                <span>{formatDateTime(r.reservedAt, locale)} · {r.partySize}</span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
