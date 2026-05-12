"use client";

import { useMemo } from "react";
import type { CounselingRecordListItem } from "@yeon/api-contract/counseling-records";

import type { RecordItem } from "@/app/counseling-service/_lib/types";
import { mergeRecordSources } from "@/app/counseling-service/_lib/record-state-adapters";

export function useMergedRecords({
  serverItems,
  localOverrides,
  tempRecords,
}: {
  serverItems: CounselingRecordListItem[];
  localOverrides: Map<string, Partial<RecordItem>>;
  tempRecords: RecordItem[];
}) {
  return useMemo(
    () => mergeRecordSources({ serverItems, localOverrides, tempRecords }),
    [serverItems, localOverrides, tempRecords]
  );
}
