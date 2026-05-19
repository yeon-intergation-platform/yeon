import { QueryProvider } from "@/lib/query-provider";

export default function StarLobbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
