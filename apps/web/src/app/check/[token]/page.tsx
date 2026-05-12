"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PublicCheckEntry } from "@yeon/api-contract";
import { PublicCheckPageContent } from "@/features/public-check/components/public-check-page-content";

function resolveEntryMode(value: string | null): PublicCheckEntry {
  return value === "location" ? "location" : "qr";
}

export default function PublicCheckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const searchParams = useSearchParams();
  const entryMode = resolveEntryMode(searchParams.get("entry"));
  const [tokenState, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    void params.then((value) => setTokenState(value.token));
  }, [params]);

  return <PublicCheckPageContent token={tokenState} entryMode={entryMode} />;
}
