"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createReview } from "@/lib/actions/reviews";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ReviewForm() {
  const t = useTranslations("Reviews");
  const [state, action] = useActionState<ActionState, FormData>(createReview, {});

  if (state.ok) return <div className="card text-sm">{t("success")}</div>;

  return (
    <form action={action} className="card space-y-3">
      <h2 className="font-semibold">{t("write")}</h2>
      <div>
        <label className="label" htmlFor="rating">{t("rating")}</label>
        <select id="rating" name="rating" className="input" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="body">{t("body")}</label>
        <textarea id="body" name="body" className="input" rows={4} minLength={3} maxLength={500} required />
      </div>
      {state.error && <p className="text-sm text-red-600">{t(state.error as never)}</p>}
      <SubmitButton className="btn-primary w-full">{t("submit")}</SubmitButton>
    </form>
  );
}
