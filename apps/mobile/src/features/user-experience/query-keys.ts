// 경험치/레벨 queryKey는 web/mobile 공용 SSOT(parity: identical-value)에서만 선언한다.
// 이 파일은 재수출(adapter)만 하며 raw 재선언을 금지한다.
// SSOT: packages/ui/src/runtime/ports/user-experience/query-keys.ts
export {
  userExperienceQueryKeys,
  type YeonExperienceAuthScope,
} from "@yeon/ui/runtime/ports/user-experience";
