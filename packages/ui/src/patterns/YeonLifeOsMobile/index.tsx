import type { CSSProperties } from "react";

import {
  YeonActionButton,
  type YeonActionButtonProps,
} from "../YeonActionButton";
import { YeonSectionCard } from "../YeonSectionCard";
import { YeonTextField } from "../YeonTextField";
import { YeonScrollView } from "../../primitives/YeonScrollView";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";

export type YeonLifeOsHourBlock = {
  hours: readonly number[];
  key: string;
  label: string;
};

export type YeonLifeOsHourEntry = {
  actionText: string;
  goalText: string;
  hour: number;
};

export type YeonLifeOsDailyReport = {
  matchedHours: number;
  overplannedHours: number;
  patternText: string;
  plannedHours: number;
  recommendationText: string;
};

export type YeonLifeOsLoginCardProps = {
  email: string;
  isPending?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: YeonActionButtonProps["onPress"];
  password: string;
  title?: string;
};

export function YeonLifeOsLoginCard({
  email,
  isPending = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
  title = "Yeon 계정 로그인",
}: YeonLifeOsLoginCardProps) {
  return (
    <YeonSectionCard className="grid gap-4">
      <YeonText variant="subtitle" className="mb-1 text-[#111]">
        {title}
      </YeonText>
      <YeonTextField
        keyboardType="email-address"
        label="이메일"
        onChangeText={onEmailChange}
        placeholder="email@example.com"
        value={email}
      />
      <YeonTextField
        label="비밀번호"
        onChangeText={onPasswordChange}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
      />
      <YeonActionButton
        disabled={isPending}
        label={isPending ? "로그인 중" : "로그인"}
        onPress={onSubmit}
        variant="dark"
      />
    </YeonSectionCard>
  );
}

export type YeonLifeOsHourlySheetProps<RowKey extends string> = {
  blocks: readonly YeonLifeOsHourBlock[];
  disabled?: boolean;
  entries: readonly YeonLifeOsHourEntry[];
  fallbackEntryFactory?: (hour: number) => YeonLifeOsHourEntry;
  getCellText: (row: RowKey, entry: YeonLifeOsHourEntry) => string;
  localDateLabel: string;
  onSelectHour: (hour: number) => void;
  rows: readonly RowKey[];
  selectedHour: number;
  subtitle?: string;
  style?: CSSProperties;
};

export function YeonLifeOsHourlySheet<RowKey extends string>({
  blocks,
  disabled = false,
  entries,
  fallbackEntryFactory = createFallbackEntry,
  getCellText,
  localDateLabel,
  onSelectHour,
  rows,
  selectedHour,
  subtitle = "수동 hourly record",
  style,
}: YeonLifeOsHourlySheetProps<RowKey>) {
  return (
    <YeonSectionCard className="overflow-hidden p-0" style={style}>
      <YeonView className="flex items-center justify-between gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5">
        <YeonText variant="label" className="text-[#111]">
          {localDateLabel}
        </YeonText>
        <YeonText variant="label" className="text-[#111]">
          {subtitle}
        </YeonText>
      </YeonView>

      <YeonScrollView className="overflow-x-auto">
        <YeonView className="min-w-max p-3">
          {blocks.map((block) => (
            <YeonView
              key={block.key}
              className="border-b border-[#e5e5e5] py-2.5 last:border-b-0"
            >
              <YeonText
                variant="caption"
                className="mb-1.5 pl-[74px] text-[12px] font-extrabold text-[#666]"
              >
                {block.label}
              </YeonText>
              {rows.map((row) => (
                <YeonView
                  key={`${block.key}-${row}`}
                  className="mb-1 flex items-center last:mb-0"
                >
                  <YeonText
                    variant="caption"
                    className="w-[70px] text-[11px] font-black text-[#111]"
                  >
                    {row}
                  </YeonText>
                  {block.hours.map((hour) => {
                    const entry = entries[hour] ?? fallbackEntryFactory(hour);
                    const isSelected = hour === selectedHour;

                    return (
                      <YeonActionButton
                        disabled={disabled}
                        key={`${block.key}-${row}-${hour}`}
                        label={getCellText(row, entry)}
                        onPress={() => onSelectHour(hour)}
                        style={{ minHeight: 48, width: 62 }}
                        variant={isSelected ? "dark" : "secondary"}
                        labelStyle={{
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      />
                    );
                  })}
                </YeonView>
              ))}
            </YeonView>
          ))}
        </YeonView>
      </YeonScrollView>
    </YeonSectionCard>
  );
}

export type YeonLifeOsHourEditorProps = {
  actionText: string;
  disabled?: boolean;
  goalText: string;
  isSaving?: boolean;
  onActionTextChange: (value: string) => void;
  onGoalTextChange: (value: string) => void;
  onSave: YeonActionButtonProps["onPress"];
  selectedHour: number;
};

export function YeonLifeOsHourEditor({
  actionText,
  disabled = false,
  goalText,
  isSaving = false,
  onActionTextChange,
  onGoalTextChange,
  onSave,
  selectedHour,
}: YeonLifeOsHourEditorProps) {
  return (
    <YeonSectionCard className="grid gap-4">
      <YeonText variant="subtitle" className="text-[#111]">
        {selectedHour}시 기록
      </YeonText>
      <YeonTextField
        label="GOAL"
        multiline
        multilineMinHeight={78}
        onChangeText={onGoalTextChange}
        placeholder="GOAL"
        value={goalText}
      />
      <YeonTextField
        label="ACTION"
        multiline
        multilineMinHeight={78}
        onChangeText={onActionTextChange}
        placeholder="ACTION"
        value={actionText}
      />
      <YeonActionButton
        disabled={disabled}
        label={isSaving ? "저장 중" : "저장"}
        onPress={onSave}
        variant="dark"
      />
    </YeonSectionCard>
  );
}

export type YeonLifeOsMemoGridProps = {
  backlogText: string;
  mindset: string;
  onBacklogTextChange: (value: string) => void;
  onMindsetChange: (value: string) => void;
};

export function YeonLifeOsMemoGrid({
  backlogText,
  mindset,
  onBacklogTextChange,
  onMindsetChange,
}: YeonLifeOsMemoGridProps) {
  return (
    <YeonView className="grid gap-3 md:grid-cols-2">
      <YeonSectionCard>
        <YeonTextField
          label="MINDSET"
          multiline
          multilineMinHeight={92}
          onChangeText={onMindsetChange}
          placeholder="오늘 버릴 것 / 지킬 것"
          value={mindset}
        />
      </YeonSectionCard>
      <YeonSectionCard>
        <YeonTextField
          label="Memo / Backlog"
          multiline
          multilineMinHeight={92}
          onChangeText={onBacklogTextChange}
          placeholder="아직 시간표에 넣지 않을 생각"
          value={backlogText}
        />
      </YeonSectionCard>
    </YeonView>
  );
}

export type YeonLifeOsDailyReportCardProps = {
  report: YeonLifeOsDailyReport;
  title?: string;
};

export function YeonLifeOsDailyReportCard({
  report,
  title = "Daily report",
}: YeonLifeOsDailyReportCardProps) {
  return (
    <YeonSectionCard className="grid gap-3">
      <YeonText variant="subtitle" className="text-[#111]">
        {title}
      </YeonText>
      <YeonText
        variant="body"
        className="text-[14px] font-extrabold text-[#111]"
      >
        planned {report.plannedHours}h · matched {report.matchedHours}h ·
        overplanned {report.overplannedHours}h
      </YeonText>
      <YeonText
        variant="body"
        tone="secondary"
        className="text-[13px] leading-[19px]"
      >
        {report.patternText}
      </YeonText>
      <YeonText
        variant="body"
        tone="secondary"
        className="text-[13px] leading-[19px]"
      >
        {report.recommendationText}
      </YeonText>
    </YeonSectionCard>
  );
}

function createFallbackEntry(hour: number): YeonLifeOsHourEntry {
  return { actionText: "", goalText: "", hour };
}
