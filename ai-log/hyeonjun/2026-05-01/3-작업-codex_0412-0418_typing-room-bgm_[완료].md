# 타자방 외부 BGM 삽입

- 시작: 2026-05-01 04:12 KST
- 실제 종료: 2026-05-01 04:18 KST
- 상태: 완료

## 목표
- 직접 생성 음원이 아닌 외부 공개/재배포 가능 음원을 확인 후 타자 연습 UI에 삽입한다.
- 라이선스/출처 표기를 함께 남긴다.

## 적용
- 음원: Kevin MacLeod - Monkeys Spinning Monkeys
- 이유: 대중적으로 많이 쓰인 밝고 빠른 게임/로비 계열 BGM이며, 타자방의 가벼운 경쟁감과 맞음.
- 라이선스: CC BY 3.0, 출처/라이선스 문서 포함.
- 타자 서비스 홈, 로비, 대기방, 싱글/멀티 대결 화면 헤더에 BGM 토글 추가.

## 검증
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/web build` PASS
- `git diff --check` PASS
- `file apps/web/public/audio/typing-room-bgm.mp3` 확인: MP3 320kbps, 44.1kHz stereo
