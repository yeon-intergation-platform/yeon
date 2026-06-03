// Life OS queryKey SSOT (parity: identical-value, base).
//
// 기본 키는 web/mobile 공유한다. 모바일은 세션 분리를 위해 sessionToken을 추가로 덧붙일 수 있다
// (auth 메커니즘 차이: web 쿠키 ↔ mobile 토큰). base가 어긋나지 않도록 단일 출처에서 파생한다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: life-os-query-keys)

export const lifeOsQueryKeys = {
  root: ["life-os"] as const,
  day: (localDate: string) => ["life-os", "day", localDate] as const,
} as const;
