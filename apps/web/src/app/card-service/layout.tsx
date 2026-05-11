import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CardServiceAuthProvider } from "@/features/card-service/auth-context";
import { QueryProvider } from "@/lib/query-provider";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CardServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentAuthUser();
  return (
    <QueryProvider>
      <CardServiceAuthProvider isAuthenticated={Boolean(user)}>
        {children}
      </CardServiceAuthProvider>
    </QueryProvider>
  );
}
