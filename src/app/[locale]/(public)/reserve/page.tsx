import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toDateKey } from "@/lib/format";
import { ReserveForm } from "./ReserveForm";

export async function generateMetadata() {
  const t = await getTranslations("Reserve");
  return { title: t("title") };
}

export default async function ReservePage() {
  const user = await getCurrentUser();
  const profile = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, phone: true } })
    : null;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return (
    <div className="mx-auto max-w-lg">
      <ReserveForm
        defaultName={profile?.name ?? ""}
        defaultPhone={profile?.phone ?? ""}
        minDate={toDateKey(today)}
        defaultDate={toDateKey(tomorrow)}
      />
    </div>
  );
}
