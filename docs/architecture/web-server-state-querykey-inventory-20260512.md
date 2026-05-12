# Web server-state queryKey inventory 2026-05-12

## 목적

React Query 표준화 2차 작업의 기준 inventory다. `apps/web/src`에서 raw `queryKey: [` 패턴을 서비스별로 나누고, 먼저 정리한 영역과 남은 영역을 구분한다.

## 이번 차수 정리 완료

`features/student-management/**`와 `app/counseling-service/student-management/layout.tsx`의 수강생 관리 핵심 key는 `studentManagementQueryKeys`로 이동했다.

- `spaces`
- `members` / `member`
- `member-tabs`
- `student-board`
- `member-student-board`
- `public-check-location-search`
- `custom-tab-fields`
- `member-memos`
- `member-counseling-records`
- `member-report-record-details`
- `local-import-drafts`

검증 명령:

```bash
rg 'queryKey:\s*\[' apps/web/src/features/student-management apps/web/src/app/counseling-service/student-management
```

현재 출력 없음. 단, `refetch()` 문자열은 queryKey raw 사용이 아니므로 제외한다.

## 남은 raw queryKey inventory

2026-05-12 2차 작업 직후 `apps/web/src` 기준 남은 raw key는 27개다.

| 영역                         | 개수 | 다음 조치                                                                           |
| ---------------------------- | ---: | ----------------------------------------------------------------------------------- |
| `app/counseling-service/**`  |   15 | 상담 워크스페이스 이중 구현 정리 전에 `counselingWorkspaceQueryKeys`로 먼저 묶는다. |
| `features/typing-service/**` |    5 | inline `{ adminMode }` key를 factory 인자로 흡수하고 lobby/frame key를 함수화한다.  |
| `features/cloud-import/**`   |    4 | file preview/local drafts key를 `cloudImportQueryKeys`로 분리한다.                  |
| `app/check/[token]`          |    1 | 단일 페이지 훅 분리 시 `publicCheckQueryKeys.session(token, entryMode)`로 이동한다. |
| `features/life-os/**`        |    1 | `lifeOsQueryKeys.day(date)`로 이동한다.                                             |
| `features/space-settings/**` |    1 | `spaceSettingsQueryKeys.templateDetail(templateId)`로 이동한다.                     |

## 원칙

- raw key를 없애는 작업과 파일 이동 작업은 분리한다.
- 각 서비스는 자기 feature 내부에 query key factory를 둔다.
- app route 내부 전용 key도 장기적으로는 feature hook으로 이동하되, 먼저 factory만 적용해 캐시 충돌을 줄인다.
