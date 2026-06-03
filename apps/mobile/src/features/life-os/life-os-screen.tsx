import { ApiClientError } from "@yeon/api-client";
import {
  buildLifeOsReport,
  computeLifeOsDailyMetrics,
  createEmptyLifeOsEntries,
  LIFE_OS_HOUR_BLOCKS,
  LIFE_OS_ROWS,
  type LifeOsHourEntry,
} from "@yeon/domain/life-os";
import {
  showYeonAlert,
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
  YeonLifeOsDailyReportCard,
  YeonLifeOsHourEditor,
  YeonLifeOsHourlySheet,
  YeonLifeOsLoginCard,
  YeonLifeOsMemoGrid,
  YeonMobileScreen as MobileScreen,
  YeonStateBlock as StateBlock,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { useEffect, useMemo, useState } from "react";
import { lifeOsApi } from "../../services/life-os/client";
import { lifeOsQueryKeys } from "@yeon/ui/runtime/ports/life-os";
import {
  clearPrimaryAuthSessionToken,
  readPrimaryAuthSessionToken,
  writePrimaryAuthSessionToken,
} from "../../services/primary-auth/storage";

type LifeOsAuthStatus = "booting" | "signed_out" | "signed_in";

function getTodayLocalDate() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date());
}

function formatDateLabel(localDate: string) {
  const date = new Date(`${localDate}T00:00:00+09:00`);

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "long",
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(date);
}

function createInitialEntries(): LifeOsHourEntry[] {
  return createEmptyLifeOsEntries().map((entry) => ({ ...entry }));
}

function getCellText(
  row: (typeof LIFE_OS_ROWS)[number],
  entry: LifeOsHourEntry
) {
  if (row === "MINDSET") return entry.hour === 0 ? "오늘 기준" : "";
  if (row === "TIME") return `${entry.hour}`;
  if (row === "GOAL") return entry.goalText || "계획";
  return entry.actionText || "실행";
}

export function LifeOsScreen() {
  const queryClient = useQueryClient();
  const [authStatus, setAuthStatus] = useState<LifeOsAuthStatus>("booting");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localDate] = useState(getTodayLocalDate);
  const [mindset, setMindset] = useState("");
  const [backlogText, setBacklogText] = useState("");
  const [selectedHour, setSelectedHour] = useState(9);
  const [entries, setEntries] = useState(createInitialEntries);

  const selectedEntry =
    entries[selectedHour] ?? createInitialEntries()[selectedHour]!;
  const dayQuery = useQuery({
    enabled: authStatus === "signed_in" && Boolean(sessionToken),
    queryFn: async () => lifeOsApi.getLifeOsDay(localDate, sessionToken!),
    queryKey: [...lifeOsQueryKeys.day(localDate), sessionToken],
  });
  const loginMutation = useMutation({
    mutationFn: async () =>
      lifeOsApi.loginWithCredential({
        email: email.trim(),
        password,
      }),
    onSuccess: async (response) => {
      await writePrimaryAuthSessionToken(response.sessionToken);
      setSessionToken(response.sessionToken);
      setAuthStatus("signed_in");
      setPassword("");
    },
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) {
        throw new Error("로그인이 필요합니다.");
      }

      return lifeOsApi.upsertLifeOsDay(
        {
          backlogText,
          entries,
          localDate,
          mindset,
          timezone: "Asia/Seoul",
        },
        sessionToken
      );
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: [
          ...lifeOsQueryKeys.day(response.day.localDate),
          sessionToken,
        ],
      });
      showYeonAlert("저장 완료", "Life OS 기록이 동기화되었습니다.");
    },
  });

  useEffect(() => {
    void bootstrapLifeOsAuth();
  }, []);

  useEffect(() => {
    const day = dayQuery.data?.day;

    if (!day) {
      return;
    }

    setMindset(day.mindset);
    setBacklogText(day.backlogText);
    setEntries(
      createInitialEntries().map((entry) => ({
        ...entry,
        ...day.entries.find((dayEntry) => dayEntry.hour === entry.hour),
      }))
    );
  }, [dayQuery.data]);

  async function bootstrapLifeOsAuth() {
    try {
      const storedToken = await readPrimaryAuthSessionToken();

      if (!storedToken) {
        setAuthStatus("signed_out");
        return;
      }

      const response = await lifeOsApi.getAuthSession(storedToken);

      if (!response.authenticated) {
        await clearPrimaryAuthSessionToken();
        setSessionToken(null);
        setAuthStatus("signed_out");
        return;
      }

      setSessionToken(storedToken);
      setAuthStatus("signed_in");
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 403)
      ) {
        await clearPrimaryAuthSessionToken();
      }

      setSessionToken(null);
      setAuthStatus("signed_out");
    }
  }

  async function handleLogin() {
    try {
      await loginMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      showYeonAlert("로그인 실패", message);
    }
  }

  async function handleLogout() {
    const token = sessionToken;

    if (token) {
      try {
        await lifeOsApi.logout(token);
      } catch {
        // Local sign-out should still win.
      }
    }

    await clearPrimaryAuthSessionToken();
    setSessionToken(null);
    setAuthStatus("signed_out");
    queryClient.removeQueries({ queryKey: lifeOsQueryKeys.root });
  }

  async function handleSave() {
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장에 실패했습니다.";
      showYeonAlert("저장 실패", message);
    }
  }

  function updateEntry(field: "goalText" | "actionText", value: string) {
    setEntries((current) =>
      current.map((entry) =>
        entry.hour === selectedHour ? { ...entry, [field]: value } : entry
      )
    );
  }

  const report = useMemo(() => {
    const metrics = computeLifeOsDailyMetrics({ entries, localDate });

    return buildLifeOsReport({
      metrics,
      periodEnd: localDate,
      periodStart: localDate,
      periodType: "daily",
    });
  }, [entries, localDate]);
  const isEditorDisabled = dayQuery.isLoading || saveMutation.isPending;

  if (authStatus === "booting") {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          loading
          message="Life OS 세션을 확인하는 중입니다."
          title="세션 확인 중"
        />
      </MobileScreen>
    );
  }

  if (authStatus === "signed_out") {
    return (
      <MobileScreen
        contentVariant="centered"
        keyboardShouldPersistTaps="handled"
      >
        <TopBar
          subtitle="모바일 앱에서는 세션 토큰을 SecureStore에 저장하고, 공용 Life OS API로 웹과 같은 기록을 동기화합니다."
          title="로그인 후 기록 동기화"
        />
        <YeonLifeOsLoginCard
          email={email}
          isPending={loginMutation.isPending}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
          password={password}
        />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen contentVariant="card" keyboardShouldPersistTaps="handled">
      <TopBar
        onRightPress={handleLogout}
        rightLabel="로그아웃"
        subtitle="캘린더나 투두가 아니라, 계획과 실제 행동의 차이를 시간 단위로 남기는 개인 실행 리포트입니다."
        title="시간별 기록장"
      />

      <YeonLifeOsHourlySheet
        blocks={LIFE_OS_HOUR_BLOCKS}
        disabled={isEditorDisabled}
        entries={entries}
        fallbackEntryFactory={(hour) => createInitialEntries()[hour]!}
        getCellText={getCellText}
        localDateLabel={formatDateLabel(localDate)}
        onSelectHour={setSelectedHour}
        rows={LIFE_OS_ROWS}
        selectedHour={selectedHour}
      />

      <YeonLifeOsHourEditor
        actionText={selectedEntry.actionText}
        disabled={isEditorDisabled}
        goalText={selectedEntry.goalText}
        isSaving={saveMutation.isPending}
        onActionTextChange={(value) => updateEntry("actionText", value)}
        onGoalTextChange={(value) => updateEntry("goalText", value)}
        onSave={handleSave}
        selectedHour={selectedHour}
      />

      <YeonLifeOsMemoGrid
        backlogText={backlogText}
        mindset={mindset}
        onBacklogTextChange={setBacklogText}
        onMindsetChange={setMindset}
      />

      <YeonLifeOsDailyReportCard
        report={{
          matchedHours: report.metrics.matchedHours,
          overplannedHours: report.metrics.overplannedHours,
          patternText:
            report.patterns[0]?.evidence ??
            "GOAL/ACTION을 기록하면 패턴이 보입니다.",
          plannedHours: report.metrics.plannedHours,
          recommendationText:
            report.recommendations[0]?.suggestedAdjustment ??
            "먼저 4칸만 채워도 충분합니다.",
        }}
      />
    </MobileScreen>
  );
}
