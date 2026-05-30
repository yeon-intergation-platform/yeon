# CI Docker 빌드캐시 owner 하드코딩 수정 (org 이전 후속)

- 실행 주체: claude
- 시작: 2026-05-31 00:16
- 상태: 작업중(머지 후 run 검증 대기)

## 배경

저장소가 org `yeon-intergation-platform`로 이전된 뒤 Docker 배포 파이프라인이 실패.

- amd64 빌드 3종(web/backend/race): **성공**(org 패키지 Write 권한 연결 후 GHCR push 통과 확인).
- arm64 빌드(self-hosted Pi): **실패** — `permission_denied: The requested installation does not exist`.

## 원인 (run 26687250907 로그로 확정)

arm64 빌드의 `cache-from`/`cache-to` 레지스트리 ref가 옛 owner로 하드코딩:
`ghcr.io/hyeonjun0527/<image>:buildcache-arm64`.
buildkit이 옛 owner(pull) + 새 org(pull,push) 스코프를 **한 토큰으로 묶어** GHCR 토큰 요청 →
접근 불가한 옛 owner 패키지가 끼면 GHCR가 토큰 전체를 거부 → 새 org 이미지 push까지 동반 실패.
amd64는 `cache=gha`라 옛 owner 스코프가 없어 통과했음.

## 변경

`.github/workflows/docker-build-{web,backend,race}.yml`의 arm64 레지스트리 빌드캐시 ref를
옛 owner 하드코딩 → 동적 `${{ steps.image.outputs.ref }}:buildcache-arm64`로 교체(파일당 2줄, 총 6줄).

## 검증

- 옛 owner(hyeonjun0527) 워크플로 잔존 0건 확인.
- 머지가 `docker-build-*.yml` 경로 필터에 걸려 docker-image run 자동 트리거 → amd64+arm64 push 통과 확인 예정.
- org 권한(Packages Write 연결, Workflow permissions)은 사용자가 직접 설정 완료.
