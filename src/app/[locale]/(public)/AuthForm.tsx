"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { login, register, type ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const t = useTranslations("Auth");
  const [state, action] = useActionState<ActionState, FormData>(mode === "login" ? login : register, {});
  return (
    <form action={action} className="card mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">{t(mode === "login" ? "loginTitle" : "registerTitle")}</h1>
      {mode === "register" && <div><label className="label">{t("name")}</label><input name="name" className="input" required /></div>}
      <div><label className="label">{t("email")}</label><input name="email" type="email" className="input" required autoComplete="email" /></div>
      <div><label className="label">{t("password")}</label><input name="password" type="password" className="input" required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
      {mode === "register" && <div><label className="label">{t("phone")}</label><input name="phone" type="tel" className="input" /></div>}
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <p className="text-sm text-red-600">{t(state.error as never)}</p>}
      <SubmitButton className="btn-primary w-full">{t(mode)}</SubmitButton>
      <p className="text-center text-sm text-ink/60">
        {mode === "login" ? <>{t("noAccount")} <Link className="text-brand-600 hover:underline" href="/register">{t("register")}</Link></>
          : <>{t("haveAccount")} <Link className="text-brand-600 hover:underline" href="/login">{t("login")}</Link></>}
      </p>
      <p className="text-center text-xs text-ink/40">{t("demoHint")}</p>
    </form>
  );
}
