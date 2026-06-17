"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { QueryProvider } from "@/lib/query-provider";
import type {
  PublicContentChannel,
  PublicContentService,
} from "./public-content-data";
import { fetchPublicContentOpsToolbarModel } from "./public-content-ops-toolbar-fetch";
import { PublicContentOpsToolbar } from "./public-content-ops-toolbar-view";

type PublicContentOpsToolbarClientProps = {
  article: {
    category: string;
    channel: PublicContentChannel;
    service: PublicContentService;
    slugSegments: readonly string[];
  };
};

function isOpsEnabled(value: string | null) {
  return value === "1" || value === "true";
}

export const publicContentOpsToolbarQueryKey = (
  channel: PublicContentChannel,
  slug: string
) => ["public-content", "ops-toolbar", channel, slug] as const;

function upsertNoindexMeta(enabled: boolean) {
  const existingMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="robots"][data-public-content-ops="true"]'
  );

  if (!enabled) {
    existingMeta?.remove();
    return;
  }

  const meta = existingMeta ?? document.createElement("meta");
  meta.name = "robots";
  meta.content = "noindex,nofollow";
  meta.dataset.publicContentOps = "true";

  if (!existingMeta) {
    document.head.append(meta);
  }
}

function PublicContentOpsToolbarInner({
  article,
  requestHref,
  slug,
}: PublicContentOpsToolbarClientProps & {
  requestHref: string;
  slug: string;
}) {
  const toolbarQuery = useQuery({
    queryFn: () => fetchPublicContentOpsToolbarModel(requestHref),
    queryKey: publicContentOpsToolbarQueryKey(article.channel, slug),
    retry: false,
  });

  return (
    <PublicContentOpsToolbar
      article={{
        category: article.category,
        channel: article.channel,
        service: article.service,
      }}
      model={toolbarQuery.data ?? null}
    />
  );
}

export function PublicContentOpsToolbarClient({
  article,
}: PublicContentOpsToolbarClientProps) {
  const searchParams = useSearchParams();
  const enabled = isOpsEnabled(searchParams.get("ops"));
  const slug = article.slugSegments.join("/");
  const requestHref = useMemo(() => {
    const params = new URLSearchParams({
      channel: article.channel,
      slug,
    });

    return `/api/v1/public-content/ops-toolbar?${params.toString()}`;
  }, [article.channel, slug]);

  useEffect(() => {
    upsertNoindexMeta(enabled);

    return () => upsertNoindexMeta(false);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <QueryProvider>
      <PublicContentOpsToolbarInner
        article={article}
        requestHref={requestHref}
        slug={slug}
      />
    </QueryProvider>
  );
}
