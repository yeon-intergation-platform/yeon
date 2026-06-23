# 게임 허브 — 국가별 취향 큐레이션 + 추억의 플래시(Ruffle) 지원

## 배경

무명 GameMonetize 600개를 무분별하게 보여주는 대신, **국가 취향에 맞춰 지능적으로 추천**하고,
허락받은 추억의 한국 플래시 게임을 **Ruffle로 합법 호스팅**해 올리기만 하면 되는 구조를 만든다.

- 한국 사용자: 협동 퍼즐(물불), 캐주얼, .io, 방치형, 추억의 플래시(허락 시) 우선
- 미국 사용자: 슈팅, 레이싱, 스포츠, 배틀로얄 우선
- 무명 대량 게임은 "더 많은 게임"으로 강등, 상단은 **featured 큐레이션**

## 핵심 설계 결정

- `GameEntry` 확장:
  - `kind: "iframe" | "swf"` — iframe(외부 임베드) / swf(자체 호스팅 + Ruffle 실행)
  - `regions: ReadonlyArray<"kr" | "us" | "global">` — 국가 취향 태그
  - `featured?: boolean` — 상단 추천 노출
  - swf용: `swfUrl`, `creditProducer`, `creditDistributor`, `licenseNote`(허락 근거)
- 국가 감지: **사용자 토글(🇰🇷/🇺🇸)** + 초기값은 Cloudflare `CF-IPCountry` 헤더(KR이면 한국). URL `?region=` 으로 reload-safe.
- 추천 로직: featured && region 매칭 → 상단. 나머지 feed는 하단.

---

## 1차 — 카탈로그 구조 확장 + 국가별 추천 (이번 단계)

**작업내용**: `GameEntry`에 `kind`/`regions`/`featured` 추가. 기존 curated 15종에 regions 태깅 + 한국/미국 featured 지정. 허브에 국가 토글 + "🇰🇷 한국 인기 / 🇺🇸 인기" 추천 섹션. 국가 초기값은 CF-IPCountry.
**추천**: 토글 + URL `?region=kr|us`. featured는 region별.
**사용자 방향**: 추천대로.

## 2차 — 한국/미국 취향 게임 풀 확대(임베드 검증)

**작업내용**: 합법 임베드 가능한 한국 인기작 리서치·검증 후 추가. 후보: Fireboy & Watergirl(물불) 시리즈, .io, 방치형, 타이쿤, 격투(CrazyGames embed). 각 게임 Playwright로 흰화면 여부 검증 후 카탈로그 등재.
**논의 필요**: 임베드 막힌 게임은 제외 또는 대체.
**사용자 방향**:

## 3차 — Ruffle(SWF) 자체 호스팅 지원

**작업내용**: `@ruffle-rs/ruffle` self-host 통합. `RuffleGamePlayer` 클라이언트 컴포넌트(SWF 로드·실행). `kind: "swf"` 게임 상세는 iframe 대신 Ruffle 렌더. SWF는 `public/games/`(또는 별도 스토리지). 출처(제작/배급) 표기 + 라이선스 메모.
**전제**: 원작자 허락 + SWF 확보(가이드: `docs/guides/flash-game-permission-guide.md`).
**추천**: 공개 데모 SWF로 PoC → 허락 게임 순차 등재.
**사용자 방향**:

## 4차 — SEO 동적 sitemap (URL 안정화)

**작업내용**: slug를 id 기반 매칭으로 안정화 + sitemap을 스냅샷 기준으로 전 게임 등록(별도 백로그 연계).
**사용자 방향**:

## 5차 — 검증/배포

**작업내용**: typecheck/lint/test, build, verify-parity, Playwright 추천 섹션·Ruffle 동작 확인.
**사용자 방향**:

## 후속/메모

- "올리기만 하면 되는" 상태 = 1·3차 완료 후 `GameEntry` 한 줄(iframe) 또는 SWF 한 개 추가로 게임 등재.
- 만화캐릭RPG3는 일본 IP 리스크로 허락받아도 비영리 한정 신중(가이드 케이스1).
