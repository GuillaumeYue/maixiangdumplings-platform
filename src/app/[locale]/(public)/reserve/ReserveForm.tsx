"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createReservation } from "@/lib/actions/reservations";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

// Lunch and dinner seatings, every 30 minutes.
const SLOTS = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

type Props = { defaultName: string; defaultPhone: string; minDate: string; defaultDate: string };

export function ReserveForm({ defaultName, defaultPhone, minDate, defaultDate }: Props) {
  const t = useTranslations("Reserve");
  const [state, action] = useActionState<ActionState, FormData>(createReservation, {});

  if (state.ok) {
    return (
      <div className="card text-center">
        <div className="text-4xl">🍜</div>
        <p className="mt-3 font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="date">{t("date")}</label>
          <input id="date" name="date" type="date" className="input" required min={minDate} defaultValue={defaultDate} />
        </div>
        <div>
          <label className="label" htmlFor="time">{t("time")}</label>
          <select id="time" name="time" className="input" defaultValue="18:30">
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="partySize">{t("partySize")}</label>
        <input id="partySize" name="partySize" type="number" min={1} max={8} defaultValue={2} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="name">{t("name")}</label>
        <input id="name" name="name" className="input" required defaultValue={defaultName} />
      </div>
      <div>
        <label className="label" htmlFor="phone">{t("phone")}</label>
        <input id="phone" name="phone" type="tel" className="input" required defaultValue={defaultPhone} />
      </div>
      <div>
        <label className="label" htmlFor="note">{t("note")}</label>
        <textarea id="note" name="note" className="input" rows={2} maxLength={300} />
      </div>
      {state.error && <p className="text-sm text-red-600">{t(state.error as never)}</p>}
      <SubmitButton className="btn-primary w-full">{t("submit")}</SubmitButton>
    </form>
  );
}
