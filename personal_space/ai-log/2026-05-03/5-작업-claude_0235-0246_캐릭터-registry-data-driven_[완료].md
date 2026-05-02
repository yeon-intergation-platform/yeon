# 5차수 — 캐릭터 registry data-driven (100+ 확장 토대)

- 시작: 2026-05-03 02:35
- 주체: claude
- 상태: 작업중
- 브랜치: `feat/character-registry-data-driven` (origin/main 기반)

## 배경

- 사용자가 캐릭터 100+개 추가 예정. 단일 ts 파일에 인라인 배열로는 한계.

## 변경

- 데이터 SoT 분리: `apps/web/src/features/typing-service/characters/data/<id>.json` (1캐릭터=1파일).
  - 카멜·아스나·린네아 3개 JSON 생성. 기존 인라인 배열 내용 그대로 이동.
  - 각 JSON 에 `extract` 필드(빌드 메타) 옵션 — 추출 스크립트가 사용.
- 자동 생성: `scripts/build-character-registry.mjs`.
  - data/\*.json 읽어 정렬(default 우선 + 알파벳) → `registry.generated.ts` 출력.
  - 파일명 = id 강제, 중복/누락 검증.
- `apps/web/package.json` 의 `predev`/`prebuild` 에 build-character-registry 호출 추가. 캐릭터 데이터만 수정해도 자동 반영.
- `apps/web/src/features/typing-service/characters/index.ts` 가 registry.generated 에서 import 하도록 단순화. helper(findCharacter, toEnginePlayerCharacter) 그대로.
- `scripts/sprites/extract-character-run.py` 가 data/\*.json 의 `extract` 필드를 읽도록 변경. 원본 시트는 `scripts/sprites/raw/<rawSheet>` 컨벤션. `--id` 옵션 지원.
- `.gitignore`: `scripts/sprites/raw/*` 추가 (외부 자산 본체는 git 안 들어감, README만).

## 새 캐릭터 추가 흐름

1. 시트를 `scripts/sprites/raw/<id>/spritesheet.webp` 에 복사.
2. `apps/web/src/features/typing-service/characters/data/<id>.json` 작성.
3. `/tmp/pil-venv/bin/python scripts/sprites/extract-character-run.py --id <id>` → public PNG 생성.
4. `pnpm --filter @yeon/web build` 또는 dev 실행 → registry 자동 갱신.

## 검증

- [x] `node scripts/build-character-registry.mjs` 동작 (3 characters generated)
- [x] `pnpm --filter @yeon/web typecheck`
- [x] `pnpm run prebuild` 동작 확인
- [ ] PR + main merge → 자동 배포

## 후속

- 6차수: 카드 토글 → 검색 + 그리드 + 가상 스크롤
- 7차수: lazy spritesheet 로드
- 8차수: theme/tier/tag/unlock 메타 확장
