# 레지스트리 이미지 자동정리 + 백엔드 아키텍처 점검

작성일: 2026-06-03

## 배경

사용자 점검 요청: (1) CI/CD에서 이미지 자동정리, (2) god class/god service 제거, (3) 빈약 도메인 탈피, (4) lean controller, (5) 도메인 주도 개발.

현황 진단:

- **이미지 정리**: docker-build-_.yml의 `docker image/buildx prune`은 셀프호스트 러너 **로컬 Docker만** 정리한다. ghcr.io 레지스트리(`yeon-web-app`/`yeon-race-server`/`yeon-backend`)의 오래된 태그·untagged 매니페스트(매 main push마다 `sha-_`+`push-by-digest`로 누적)를 지우는 워크플로가 **없다** → 무한 누적. **빠진 항목.**
- **lean controller**: 컨트롤러는 대부분 thin 위임(최대 154줄) → 대체로 충족.
- **god service 후보(유지보수 3종)**: CardRoomService(516), TypingDeckService(434).
- **빈약 도메인/DDD**: 백엔드는 JdbcTemplate 기반 vertical-slice(트랜잭션 스크립트 성향, @Entity 4개뿐). 도메인 패키지는 enum/record에 일부 행위(matches/fromNullable). 정통 DDD aggregate는 아님 — 단, 이 코드베이스의 의도된 스타일이라 전면 재작성은 범위 밖.

## 1차: 레지스트리 이미지 자동정리 워크플로

### 작업내용

- `.github/workflows/registry-cleanup.yml` 신설: 주기 실행(schedule) + 수동(workflow_dispatch). 3개 패키지의 오래된 untagged 매니페스트 + 오래된 `sha-*` 태그를 보존 정책(keep-n-most-recent + 보호 태그)으로 정리.
- 보호: `latest`, `develop`, `buildcache-arm64`.

### 추천 / 사용자 방향

`snok/container-retention-policy`로 untagged 우선 정리 + 최근 N 보존. 보수적 cut-off.

## 2차: god service 분해 (유지보수 3종 한정, 동결 counseling 제외)

### 작업내용

- 가장 큰 god service 후보를 책임 단위로 분해(동작 불변, 협력자 추출). lean controller 유지 확인. 빈약 도메인 중 명확히 행위가 도메인에 속하는 부분만 승격.
- 동결 counseling-workspace(CounselingRecordAiService 등)는 제외.

### 논의 필요

- 전면 DDD aggregate 전환은 비용·위험이 커 범위 밖. 안전한 책임 분리 + 도메인 행위 승격에 한정.
