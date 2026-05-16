- 시간: 23:43 ~ 23:51
- 목표: 3페이지 전투 검증 화면의 핑크/초록 슬라임 위치 및 초록 슬라임 렌더링 오류 수정

차수 1
- 작업내용: 초록 슬라임 원본 시트의 체크보드/가이드 배경을 제거한 투명 시트 생성
- 논의 필요: 없음
- 선택지: 원본 유지 / 투명 시트 사용
- 추천: 투명 시트 사용
- 사용자 방향: 초록 슬라임이 제대로 보여야 함

차수 2
- 작업내용: 초록 슬라임 스프라이트를 7x2 프레임 기준으로 렌더링하고 전투 화면 표시 크기/HP bar 위치 조정
- 논의 필요: 없음
- 선택지: 기존 4x2 유지 / 실제 7x2 기준 반영
- 추천: 실제 7x2 기준 반영
- 사용자 방향: 초록 슬라임 위치와 표시 정상화

차수 3
- 작업내용: 플레이어 body와 몬스터 hurtbox를 outline 중심으로 바꿔 스프라이트를 덮지 않도록 보정
- 논의 필요: 없음
- 선택지: 반투명 면 유지 / outline만 표시
- 추천: outline만 표시
- 사용자 방향: 위치가 이상해 보이지 않게 보정

검증:
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts`
- `git diff --check`
- Playwright 캡처: `slime-combat-stage-after3.png`
