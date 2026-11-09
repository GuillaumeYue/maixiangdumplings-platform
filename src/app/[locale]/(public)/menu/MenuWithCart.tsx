"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { MenuCategory, MenuItem } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { placeOrder } from "@/lib/actions/orders";
import type { ActionState } from "@/lib/actions/auth";
import { formatMoney, formatTime, localDesc, localName } from "@/lib/format";
import { SubmitButton } from "@/components/ui/SubmitButton";

type Cat = MenuCategory & { items: MenuItem[] };
type Props = { categories: Cat[]; locale: string; loggedIn: boolean; loyaltyBalance: number };

const REWARD_STAMPS = 10;

/** 45 minutes from now, rounded up to the next quarter hour, as a datetime-local value. */
function defaultPickup() {
  const d = new Date(Date.now() + 45 * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MenuWithCart({ categories, locale, loggedIn, loyaltyBalance }: Props) {
  const t = useTranslations("Menu");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [useReward, setUseReward] = useState(false);
  const [state, action] = useActionState<ActionState, FormData>(placeOrder, {});
  const items = useMemo(() => new Map(categories.flatMap((c) => c.items).map((i) => [i.id, i])), [categories]);

  const lines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const subtotal = lines.reduce((s, l) => s + (items.get(l.id)?.priceCents ?? 0) * l.qty, 0);
  const eligiblePrices = lines.map((l) => items.get(l.id)).filter((i) => i?.isLoyaltyEligible).map((i) => i!.priceCents);
  const canUseReward = loggedIn && loyaltyBalance >= REWARD_STAMPS && eligiblePrices.length > 0;
  const discount = useReward && canUseReward ? Math.min(...eligiblePrices) : 0;
  const total = subtotal - discount;
  const add = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));

  if (state.ok && state.data?.time) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <div className="text-4xl">🥟</div>
        <p className="mt-3 text-lg font-medium">{t("placed", { time: formatTime(new Date(state.data.time), locale) })}</p>
        <p className="mt-1 text-sm text-ink/60">{t("payNotice")}</p>
        <Link href="/account" className="btn-primary mt-4">OK</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
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
                    <div className="text-right">
                      <div className="font-medium tabular-nums">{formatMoney(i.priceCents, locale)}</div>
                      {i.isAvailable && (
                        <div className="mt-1 inline-flex items-center rounded-md border border-ink/20">
                          <button type="button" className="px-2 py-0.5" onClick={() => add(i.id, -1)} aria-label="-">−</button>
                          <span className="min-w-6 text-center text-sm">{cart[i.id] ?? 0}</span>
                          <button type="button" className="px-2 py-0.5" onClick={() => add(i.id, 1)} aria-label="+">+</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <form action={action} className="card space-y-4">
          <h2 className="text-lg font-semibold">{t("cart")}</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-ink/60">{t("empty")}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {lines.map((l) => {
                const i = items.get(l.id)!;
                return (
                  <li key={l.id} className="flex justify-between gap-2">
                    <span>{l.qty} × {localName(i, locale)}</span>
                    <span className="tabular-nums">{formatMoney(i.priceCents * l.qty, locale)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {canUseReward && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="useReward" checked={useReward} onChange={(e) => setUseReward(e.target.checked)} />
              {t("useReward", { balance: loyaltyBalance })}
            </label>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-brand-700">
              <span>{t("rewardApplied")}</span><span className="tabular-nums">−{formatMoney(discount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink/10 pt-3 font-semibold">
            <span>{t("total")}</span><span className="tabular-nums">{formatMoney(total, locale)}</span>
          </div>
          <input type="hidden" name="lines" value={JSON.stringify(lines)} />
          <div>
            <label className="label" htmlFor="pickupAt">{t("pickupTime")}</label>
            <input id="pickupAt" name="pickupAt" type="datetime-local" className="input" defaultValue={defaultPickup()} required />
          </div>
          <div>
            <label className="label" htmlFor="note">{t("note")}</label>
            <textarea id="note" name="note" className="input" rows={2} maxLength={300} />
          </div>
          {state.error && <p className="text-sm text-red-600">{t(state.error as never)}</p>}
          {loggedIn ? (
            <SubmitButton className="btn-primary w-full">{t("placeOrder")}</SubmitButton>
          ) : (
            <Link href="/login?next=/menu" className="btn-primary w-full">{t("loginToOrder")}</Link>
          )}
          <p className="text-xs text-ink/50">{t("payNotice")}</p>
        </form>
      </aside>
    </div>
  );
}
