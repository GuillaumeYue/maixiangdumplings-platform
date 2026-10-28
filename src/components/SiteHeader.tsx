import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function SiteHeader() {
  const [t, tb] = await Promise.all([getTranslations("Nav"), getTranslations("Brand")]);
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-brand-600">麦香园</span>
          <span className="hidden text-sm text-ink/70 sm:inline">{tb("name")}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link className="btn-ghost" href="/">{t("menu")}</Link>
          <Link className="btn-ghost hidden sm:inline-flex" href="/">{t("reserve")}</Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
