# 게임 플레이 경험치 + 포인트 시스템 + 현금전환 안내

## 배경

게임 허브(`game.yeon.world`)에서 게임을 플레이하면 기존 전역 경험치/레벨 시스템
(`user_experience`)으로 레벨이 오르게 하고, 포인트 시스템을 도입한다. 레벨이 오르면
포인트를 받고, 10,000P당 100원으로 환산해 관리자 문의로 현금 전환할 수 있다고 안내한다.

## 기존 자산(확인됨)

- `ExperienceActivity`(enum): 활동별 기본 XP + `INTERNAL_AWARDABLE` 화이트리스트.
- `InternalExperienceController` POST `/api/v1/internal/experience/award`: 내부 토큰
  (`X-Yeon-Internal-Token`, ROLE_INTERNAL) 전용, 멱등(`userId`+`activity`+`referenceId`).
- `LevelCurve`: Lv L→L+1 = 100·L XP. `UserExperienceView`(level/totalXp/...).
- web에 `SPRING_INTERNAL_TOKEN` env 존재 → web BFF가 내부 award 호출 가능.
- `useUserExperience`(web): `/api/v1/user-experience` 조회. `HeaderExperienceBadge` 노출.

## 핵심 설계 결정

- **게임 XP**: `GAME_PLAY("game_play", 15)` 활동 추가 + `INTERNAL_AWARDABLE` 포함.
  게임 상세에서 "게임 시작" 시 web BFF가 내부 award 호출. referenceId = `{gameSlug}:{yyyy-MM-dd}`
  → **게임당 하루 1회**만 적립(무한 반복 어뷰징 차단, 멱등). 인증 사용자만(게스트는 무시).
- **포인트**: 레벨 파생값(차감 없음 → 별도 테이블/마이그레이션 불필요).
  `points = (level - 1) * 1000`. Lv2=1000, … Lv11=10000. 1만 도달=Lv11.
  현금 전환은 관리자 수동 처리이므로 잔액 차감 로직 불필요(누적 표시만).
- **현금전환 안내**: "10,000P당 100원으로 환산해 관리자 문의로 현금 전환 가능" 문구.

---

## 1차 — 백엔드: 게임 활동 + 포인트 파생

**작업내용**: `ExperienceActivity`에 `GAME_PLAY` 추가 + `INTERNAL_AWARDABLE`에 포함.
`UserExperienceView`에 `long points` 필드 추가, `LevelCurve`에 `pointsForLevel(level)`
추가, `ExperienceService.getProgress`에서 points 채움. 단위 테스트(LevelCurve points,
game_play 화이트리스트).
**추천**: points=(level-1)\*1000. game_play 15XP.
**사용자 방향**: 추천대로.

## 2차 — 계약(api-contract)

**작업내용**: `userExperienceViewSchema`에 `points: z.number().int()` 추가.
`EXPERIENCE_ACTIVITY_LABELS`에 `game_play: "게임 플레이"` 추가.
**사용자 방향**: 추천대로.

## 3차 — web BFF 게임 적립 라우트

**작업내용**: POST `/api/v1/game-service/play` (세션 인증) → 인증 사용자면 `SPRING_INTERNAL_TOKEN`
으로 내부 award 호출(activityType=game_play, referenceId=`{slug}:{date}`). 게스트/비로그인은
204(무시). 게임 상세 "게임 시작" 클릭 시 fire-and-forget 호출.
**추천**: 실패는 조용히 무시(플레이 경험 우선). 일 1회 멱등은 백엔드가 보장.
**사용자 방향**: 추천대로.

## 4차 — web 프론트: 포인트 표시 + 현금전환 안내

**작업내용**: 경험치 배지/프로필에 포인트 표시. 게임 허브 또는 프로필에 현금전환 안내.
**사용자 방향**: 추천대로.

## 5차 — 검증/배포

**작업내용**: 백엔드 단위 테스트, web typecheck/lint/build, 백엔드 Docker 배포 + web 배포.
게임 시작 시 적립·포인트 노출 확인.
**사용자 방향**: 추천대로.

## 후속/메모

- 어뷰징 강화(전체 게임 일일 XP 상한)는 필요 시 후속.
- 포인트를 실제 차감/상점으로 확장하려면 별도 잔액 테이블 도입(현 단계는 파생 표시).
