import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Stars } from "@/components/ui/Stars";
import { Link } from "@/i18n/navigation";
import { ReviewForm } from "./ReviewForm";

export async function generateMetadata() {
  const t = await getTranslations("Reviews");
  return { title: t("title") };
}

export default async function ReviewsPage() {
  const [t, locale, user, reviews] = await Promise.all([
    getTranslations("Reviews"),
    getLocale(),
    getCurrentUser(),
    prisma.review.findMany({
      where: { status: { not: "HIDDEN" } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
  ]);
  // Google reviews stay on Google; we only link out.
  const googleUrl = process.env.GOOGLE_PLACE_ID
    ? `https://search.google.com/local/reviews?placeid=${process.env.GOOGLE_PLACE_ID}`
    : "https://www.google.com/maps/search/maixiangyuan+mont-royal";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        {reviews.length === 0 && <p className="text-ink/60">{t("empty")}</p>}
        {reviews.map((r) => (
          <article key={r.id} className="card space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{r.user.name}</span>
              <span className="text-ink/50">{formatDate(r.createdAt, locale)}</span>
            </div>
            <Stars rating={r.rating} />
            <p className="text-sm">{r.body}</p>
            {r.reply && (
              <div className="rounded-lg bg-brand-50 p-3 text-sm">
                <div className="text-xs font-medium text-brand-700">{t("replyFrom")}</div>
                <p>{r.reply}</p>
              </div>
            )}
          </article>
        ))}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {user ? (
          <ReviewForm />
        ) : (
          <Link href="/login?next=/reviews" className="btn-primary w-full">{t("loginToReview")}</Link>
        )}
        <div className="card">
          <div className="text-xs text-ink/60">{t("googleTitle")}</div>
          <a href={googleUrl} target="_blank" rel="noreferrer" className="btn-outline mt-2 w-full text-xs">{t("goGoogle")}</a>
        </div>
      </aside>
    </div>
  );
}
