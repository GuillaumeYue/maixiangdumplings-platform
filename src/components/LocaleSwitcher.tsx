"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

const labels: Record<string, string> = { fr: "FR", en: "EN", zh: "中文" };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex items-center gap-1 text-xs">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-2 py-1 ${l === locale ? "bg-brand-500 text-white" : "hover:bg-black/5"}`}
          aria-current={l === locale ? "true" : undefined}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
