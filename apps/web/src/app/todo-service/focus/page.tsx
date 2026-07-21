import { redirect } from "next/navigation";

export default async function LegacyTodoFocusPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  redirect(date ? `/today?date=${encodeURIComponent(date)}` : "/today");
}
