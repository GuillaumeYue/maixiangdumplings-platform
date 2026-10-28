import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const [t, tb] = await Promise.all([getTranslations("Footer"), getTranslations("Brand")]);
  return (
    <footer className="mt-auto border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs text-ink/60">
        <p className="font-medium text-ink/80">{tb("name")} · {tb("address")} · {tb("phone")}</p>
        <p>{t("privacy")}</p>
      </div>
    </footer>
  );
}
