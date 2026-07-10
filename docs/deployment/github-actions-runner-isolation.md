# GitHub Actions Runner 신뢰 경계

기준 시점: 2026-07-11

## 실행 위치

- PR, 테스트, lint, typecheck, SSOT 검증은 `ubuntu-latest` GitHub-hosted runner에서 실행한다.
- ARM64 image build는 `ubuntu-24.04-arm`, GHCR manifest publish는 `ubuntu-latest`에서 실행한다.
- 운영 배포만 `yeon-prod` self-hosted runner를 사용한다.
- release와 registry 정리도 GitHub-hosted runner에서 실행한다.
- 공개 저장소의 PR 코드를 persistent self-hosted runner에서 실행하지 않는다.

저장소 기본 `GITHUB_TOKEN` 권한은 `read`이고 Actions의 PR 승인 권한은 꺼져 있다. 외부 contributor의
workflow는 매번 승인이 필요하다. `main`은 PR 경유, 최신 branch, SSOT check, conversation resolve를
강제하고 force-push와 삭제를 금지한다.

## 운영 Runner Job Hook

repository-level runner label은 접근 제어가 아니다. PR이 workflow의 `runs-on`을 바꾸는 경우에도
운영 host에서 코드가 시작되지 않도록 root 소유 job-start hook이 event/ref/repository를 검사한다.

```bash
prod_unit=actions.runner.Hyeonjun0527-yeon.hyeonjun0527.service

sudo install -o root -g root -m 755 scripts/ops/yeon-prod-runner-job-guard.sh \
  /usr/local/sbin/yeon-prod-runner-job-guard
sudo install -d -o root -g root -m 755 "/etc/systemd/system/${prod_unit}.d"
sudo install -o root -g root -m 644 scripts/ops/yeon-prod-runner-job-guard.conf \
  "/etc/systemd/system/${prod_unit}.d/10-job-guard.conf"
sudo systemctl daemon-reload
sudo systemctl restart "${prod_unit}"
```

hook은 다음 job만 허용한다.

- `push` 또는 `workflow_dispatch`의 `refs/heads/main`
- `docker-image.yml` workflow
- 정확히 `yeon-intergation-platform/yeon`에서 온 job

`pull_request`, main 이외 수동 dispatch, 다른 repository job은 job step 전에 실패한다. runner service는
hook 실행 파일이 없으면 `ExecStartPre`에서 시작하지 않는다.

## 검증

```bash
bash scripts/ops/test-yeon-prod-runner-job-guard.sh

systemctl show actions.runner.Hyeonjun0527-yeon.hyeonjun0527.service \
  -p Environment -p ExecStartPre --no-pager
sudo -u nobody env \
  GITHUB_REPOSITORY=yeon-intergation-platform/yeon \
  GITHUB_EVENT_NAME=pull_request \
  GITHUB_REF=refs/pull/1/merge \
  GITHUB_WORKFLOW_REF=yeon-intergation-platform/yeon/.github/workflows/ssot-check.yml@refs/pull/1/merge \
  /usr/local/sbin/yeon-prod-runner-job-guard
```

두 번째 명령은 실패해야 한다. GitHub runner 목록에는 `hyeonjun0527` runner와 `yeon-prod` label을
가진 운영 runner만 남아 있다. 과거 `yeon-ci` runner와 OS 계정은 제거했으며 다시 만들지 않는다.

## 잔여 위험

운영 runner는 production host에 있으므로 trusted main의 deploy shell만 실행한다. image build와
third-party build action은 일회성 GitHub-hosted runner로 분리했고, 운영 runner가 허용하는 Action은
immutable commit SHA로 고정한다. 별도 deploy identity 또는 pull 기반 배포가 추가되면 host의
`NOPASSWD` 권한까지 더 좁힐 수 있다.
