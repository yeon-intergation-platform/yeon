import { redirect } from "next/navigation";

export default async function LegacyTodoServicePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  redirect(date ? `/today?date=${encodeURIComponent(date)}` : "/today");
}
