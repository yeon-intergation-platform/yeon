import type { PublicCheckEntry } from "@yeon/api-contract";

export const publicCheckQueryKeys = {
  session: (token: string | null, entryMode: PublicCheckEntry) =>
    ["public-check-session", token, entryMode] as const,
};
