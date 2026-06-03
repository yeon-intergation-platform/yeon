import { YeonExperienceBadge } from "@yeon/ui/native";
import { useCardSession } from "../card-service/card-session-context";
import { useUserExperience } from "./use-user-experience";

// 카드 앱 헤더용 경험치 배지. 로그인 + 데이터 있을 때만 렌더(비로그인/로딩/에러 미표시).
// 데이터만 주입하고 표시는 공용 YeonExperienceBadge(웹과 동일 컴포넌트)에 위임한다.
export function HeaderExperienceBadge() {
  const { isSignedIn, sessionToken } = useCardSession();
  const experienceQuery = useUserExperience(isSignedIn, sessionToken);
  const data = experienceQuery.data;

  if (!isSignedIn || !data) {
    return null;
  }

  return (
    <YeonExperienceBadge
      level={data.level}
      xpIntoLevel={data.xpIntoLevel}
      xpForNextLevel={data.xpForNextLevel}
    />
  );
}
