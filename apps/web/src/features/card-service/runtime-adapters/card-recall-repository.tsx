"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { YeonCardRecallRepositoryProvider } from "@yeon/ui/runtime/ports/card-deck";
import { useIsAuthenticated } from "../auth-context";
import { createWebCardRecallRepository } from "./create-card-recall-repository";

export { createWebCardRecallRepository } from "./create-card-recall-repository";

export function WebCardRecallRepositoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const repository = useMemo(
    () => createWebCardRecallRepository(isAuthenticated),
    [isAuthenticated]
  );
  return (
    <YeonCardRecallRepositoryProvider value={repository}>
      {children}
    </YeonCardRecallRepositoryProvider>
  );
}
