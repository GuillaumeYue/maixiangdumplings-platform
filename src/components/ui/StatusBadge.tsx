import { useTranslations } from "next-intl";

const colors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  READY: "bg-emerald-100 text-emerald-800",
  PICKED_UP: "bg-zinc-100 text-zinc-700",
  CANCELLED: "bg-red-100 text-red-700",
  SEATED: "bg-emerald-100 text-emerald-800",
  NO_SHOW: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Status");
  return <span className={`badge ${colors[status] ?? "bg-zinc-100"}`}>{t(status as never)}</span>;
}
