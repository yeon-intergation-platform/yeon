# Bugsink 오류 수집 도입 작업 로그

- 시작: 2026-06-19 10:56 KST
- 종료: 2026-06-19 11:10 KST
- 브랜치: `feat/bugsink-observability-20260619`
- 범위:
  - Yeon 편입 작업 중단 후 `origin/main` 기반 새 브랜치로 전환
  - Yeon 웹 Sentry 설정을 Bugsink 운용에 맞게 조정
  - Yeon Spring backend에 Sentry SDK 기반 Bugsink DSN 연결 추가
  - discord-assistant는 별도 레포에서 Astro 공개 사이트, Vite React 콘솔, Bugsink 연결 작업
- 검증:
  - Yeon: `git diff --check`
  - Yeon: `pnpm --filter @yeon/web typecheck`
  - Yeon: `apps/backend ./gradlew test --tests world.yeon.backend.YeonBackendApplicationTests`
  - discord-assistant: `site pnpm build`
  - discord-assistant: `admin-console pnpm build`
  - discord-assistant: `python3 -m compileall provider-agent/src/provider_agent/bugsink.py provider-agent/src/provider_agent/__main__.py`
  - discord-assistant: `python3 scripts/check_packaging.py`
  - discord-assistant: `central-server ./gradlew test --tests com.discordassistant.central.CentralServerApplicationTests`
  - UI 결과 스크린샷은 Playwright로 저장 예정
