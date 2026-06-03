import {
  YeonExperienceHistoryList,
  YeonExperiencePanel,
  YeonSectionCard as SectionCard,
  YeonText,
  YeonView,
  createYeonStyleSheet,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { EXPERIENCE_ACTIVITY_LABELS } from "@yeon/api-contract/user-experience";
import { useCardSession } from "../card-service/card-session-context";
import { useExperienceHistory } from "./use-experience-history";
import { useUserExperience } from "./use-user-experience";

// 프로필(설정) 경험치 섹션. 로그인 시에만 레벨/경험치 패널 + 적립 이력을 노출한다.
// 표시는 공용 컴포넌트(웹과 동일)에 위임하고, 모바일은 데이터만 주입한다.
export function ProfileExperienceSection() {
  const { isSignedIn, sessionToken } = useCardSession();
  const experienceQuery = useUserExperience(isSignedIn, sessionToken);
  const historyQuery = useExperienceHistory(isSignedIn, sessionToken);

  // 비로그인 시 경험치 섹션 자체를 숨긴다(웹 패리티).
  if (!isSignedIn) {
    return null;
  }

  return (
    <YeonView style={styles.section}>
      <YeonText style={styles.sectionTitle}>레벨 / 경험치</YeonText>

      <SectionCard style={styles.card}>
        {experienceQuery.data ? (
          <YeonExperiencePanel
            level={experienceQuery.data.level}
            totalXp={experienceQuery.data.totalXp}
            xpIntoLevel={experienceQuery.data.xpIntoLevel}
            xpForNextLevel={experienceQuery.data.xpForNextLevel}
          />
        ) : (
          <YeonText style={styles.placeholder}>
            {experienceQuery.isError
              ? "경험치 정보를 불러오지 못했습니다."
              : "경험치 정보를 불러오는 중입니다."}
          </YeonText>
        )}
      </SectionCard>

      <YeonText style={styles.sectionTitle}>경험치 이력</YeonText>

      <SectionCard style={styles.card}>
        {historyQuery.data ? (
          <YeonExperienceHistoryList
            activityLabels={EXPERIENCE_ACTIVITY_LABELS}
            items={historyQuery.data.items}
          />
        ) : (
          <YeonText style={styles.placeholder}>
            {historyQuery.isError
              ? "경험치 이력을 불러오지 못했습니다."
              : "경험치 이력을 불러오는 중입니다."}
          </YeonText>
        )}
      </SectionCard>
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    padding: 16,
  },
  placeholder: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
  },
});
