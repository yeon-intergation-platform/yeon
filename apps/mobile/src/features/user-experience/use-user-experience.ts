import { useYeonQuery as useQuery } from "@yeon/ui/native";
import { userExperienceApi } from "../../services/user-experience/client";
import { userExperienceQueryKeys } from "./query-keys";

// 현재 로그인 사용자의 레벨/경험치 요약. 비로그인 시 비활성(미패칭).
// queryKey는 web/mobile 공용 SSOT를 그대로 쓴다(parity: identical-value).
export function useUserExperience(
  isAuthenticated: boolean,
  sessionToken: string | null
) {
  return useQuery({
    queryKey: userExperienceQueryKeys.me(isAuthenticated),
    queryFn: () => userExperienceApi.getProgress(sessionToken ?? ""),
    enabled: isAuthenticated && Boolean(sessionToken),
  });
}
