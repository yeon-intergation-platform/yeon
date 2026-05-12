# 타자서비스 메이존 캐릭터 제거

- 시작: 진행 중
- 범위: 타자서비스 캐릭터 데이터/레지스트리
- 목표: `meizon` / `메이존` 캐릭터 제거
- 제약: race seed/protocol 로직은 변경하지 않음

## 완료

- 변경: `meizon` 캐릭터 데이터 JSON 삭제
- 변경: `meizon` sprite asset 삭제
- 변경: 캐릭터 레지스트리 재생성 결과 23개 캐릭터로 반영
- 검증:
  - `rg -n "meizon|Meizon|메이존" apps/web/src/features/typing-service apps/web/public/sprites/characters` 결과 없음
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
