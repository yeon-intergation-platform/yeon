import {
  YeonActionButton,
  type YeonActionButtonProps,
} from "../YeonActionButton/index.native";
import { YeonSectionCard } from "../YeonSectionCard/index.native";
import { YeonTextField } from "../YeonTextField/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import {
  createYeonStyleSheet,
  type YeonStyleProp,
  type YeonViewStyle,
} from "../../runtime/YeonBrowserRuntime/index.native";
import { YeonScrollView } from "../../primitives/YeonScrollView/index.native";
import {
  yeonMobileAppColors,
  yeonMobileAppShadow,
  yeonMobileAppSpacing,
} from "../../theme";

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
    <YeonSectionCard>
      <YeonText variant="subtitle" style={styles.cardTitle}>
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
  style?: YeonStyleProp<YeonViewStyle>;
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
    <YeonSectionCard style={[styles.sheetShell, style]}>
      <YeonView style={styles.dayBand}>
        <YeonText variant="label" style={styles.dayBandText}>
          {localDateLabel}
        </YeonText>
        <YeonText variant="label" style={styles.dayBandText}>
          {subtitle}
        </YeonText>
      </YeonView>

      <YeonScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YeonView style={styles.tableBody}>
          {blocks.map((block) => (
            <YeonView key={block.key} style={styles.block}>
              <YeonText variant="caption" style={styles.blockTitle}>
                {block.label}
              </YeonText>
              {rows.map((row) => (
                <YeonView key={`${block.key}-${row}`} style={styles.row}>
                  <YeonText variant="caption" style={styles.rowLabel}>
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
                        labelStyle={[
                          styles.cellText,
                          isSelected ? styles.selectedCellText : null,
                        ]}
                        onPress={() => onSelectHour(hour)}
                        style={[
                          styles.cell,
                          isSelected ? styles.selectedCell : null,
                        ]}
                        variant={isSelected ? "dark" : "secondary"}
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
    <YeonSectionCard>
      <YeonText variant="subtitle" style={styles.cardTitle}>
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
    <YeonView style={styles.memoGrid}>
      <YeonSectionCard style={styles.memoCard}>
        <YeonTextField
          label="MINDSET"
          multiline
          multilineMinHeight={92}
          onChangeText={onMindsetChange}
          placeholder="오늘 버릴 것 / 지킬 것"
          value={mindset}
        />
      </YeonSectionCard>
      <YeonSectionCard style={styles.memoCard}>
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
    <YeonSectionCard style={styles.reportCard}>
      <YeonText variant="subtitle" style={styles.cardTitle}>
        {title}
      </YeonText>
      <YeonText variant="body" style={styles.metricText}>
        planned {report.plannedHours}h · matched {report.matchedHours}h ·
        overplanned {report.overplannedHours}h
      </YeonText>
      <YeonText variant="body" tone="secondary" style={styles.reportText}>
        {report.patternText}
      </YeonText>
      <YeonText variant="body" tone="secondary" style={styles.reportText}>
        {report.recommendationText}
      </YeonText>
    </YeonSectionCard>
  );
}

function createFallbackEntry(hour: number): YeonLifeOsHourEntry {
  return { actionText: "", goalText: "", hour };
}

const styles = createYeonStyleSheet({
  block: {
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    paddingBottom: yeonMobileAppSpacing.inlineGap,
    paddingTop: yeonMobileAppSpacing.inlineGap,
  },
  blockTitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: yeonMobileAppSpacing.inlineGap / 2,
    paddingLeft: 74,
  },
  cardTitle: {
    marginBottom: 10,
  },
  cell: {
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 8,
    height: 48,
    marginRight: yeonMobileAppSpacing.inlineGap / 2,
    minHeight: 48,
    paddingHorizontal: 6,
    width: 62,
  },
  cellText: {
    color: yeonMobileAppColors.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  dayBand: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dayBandText: {
    color: yeonMobileAppColors.text,
  },
  memoCard: {
    flex: 1,
    minWidth: 0,
  },
  memoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metricText: {
    color: yeonMobileAppColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  reportCard: {
    gap: yeonMobileAppSpacing.inlineGap,
  },
  reportText: {
    fontSize: 13,
    lineHeight: 19,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: yeonMobileAppSpacing.inlineGap / 2,
  },
  rowLabel: {
    color: yeonMobileAppColors.text,
    fontSize: 11,
    fontWeight: "900",
    width: 70,
  },
  selectedCell: {
    backgroundColor: yeonMobileAppColors.black,
    borderColor: yeonMobileAppColors.black,
  },
  selectedCellText: {
    color: yeonMobileAppColors.white,
  },
  sheetShell: {
    ...yeonMobileAppShadow,
    overflow: "hidden",
    padding: 0,
  },
  tableBody: {
    padding: 12,
  },
});
