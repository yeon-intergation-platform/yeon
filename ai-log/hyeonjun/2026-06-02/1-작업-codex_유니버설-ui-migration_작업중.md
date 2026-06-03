# 작업-codex | 유니버설 UI 전체 마이그레이션 착수

- 시작: 2026-06-02
- 상태: 작업중
- 사용자 목표: card-service, typing-service, community를 상담 워크스페이스 제외하고 전부 Universal UI로 마이그레이션한다.
- 사용자 제약: 커밋하지 않고 워킹 디렉토리에 누적한다.
- 작업 워크트리: `/Users/osuma/coding_stuffs/yeon-4`

## 이번 차수 목표

1. 기존 계획 문서 `docs/product/backlog/2026-05-31-universal-ui-migration-pathA.md` 기준 M1 토대를 실제 코드로 만든다.
2. `packages/ui` universal component package를 생성한다.
3. `packages/design-tokens`를 web/native 공용 토큰 패키지로 채운다.
4. web/mobile이 `@yeon/ui`를 소비할 수 있게 의존성과 번들러 설정을 연결한다.
5. 상담 워크스페이스 코드는 건드리지 않는다.

## 진행 로그

- 현재 워크트리와 기존 계획 문서 확인 완료.
- mobile/design-system/card-service/typing-service 규칙 확인 완료.
- `@yeon/design-tokens`에 색상/간격/반경/타이포/그림자 토큰 원장 추가.
- `@yeon/ui` 신규 패키지 생성: web/native 엔트리, Button/Badge/Surface/Text/Field/Checkbox 프리미티브 추가.
- `apps/web` yeon-ui wrapper를 `@yeon/ui/web` 재수출 구조로 전환하고, Next.js transpile/React Native Web alias 배선 추가.
- `apps/mobile` 공용 UI(ActionButton, TextField, SectionCard, StateBlock, TopBar)를 `@yeon/ui/native` 소비 구조로 전환.
- `community` 주요 작성/댓글/채팅/상세/게스트 확인 UI에서 direct button/input/textarea/select를 Yeon universal primitives로 교체.
- `card-service` 덱 카드/빈 화면 일부를 YeonSurface/YeonButton 경유로 전환.
- 오렌지/앰버 금지 재확인: 변경 파일 기준 `orange|amber|#e8630a|#e87310` 없음.
- 상담 워크스페이스 관련 경로 변경 없음.

## 검증

- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/sync-skills.sh --check`는 macOS 기본 bash 3.2의 associative array 미지원으로 실패하여 Homebrew bash로 재실행.
- `bash bin/verify-ssot.sh --project-only`는 git worktree의 `.git` 파일 구조를 git 저장소로 인식하지 못해 프로젝트 검사를 건너뜀.
- `community` 남은 direct form control(button/input/textarea/select) 제거 완료: YeonButton/YeonField/YeonCheckbox/YeonSurface 경유.
- `card-service` PlayControls, DeckPlayReviewModeCard, AddCardsPanel footer를 Yeon universal primitives로 추가 이관하고 파랑/초록 리뷰 버튼 색을 중립 토큰 기반으로 정리.
- 검증 재실행: `pnpm --filter @yeon/ui lint`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/mobile lint`, `git diff --check` 통과.

## 2026-06-02 추가 진행

- `typing-service` 점령전 화면의 남은 direct `button/input`을 `YeonButton`/`YeonField`로 교체.
- 점령전 화면의 다크/임의 색/노랑 강조를 흰 배경 + `#111/#666/#aaa/#e5e5e5/#fafafa` 정규 토큰 기반으로 정리.
- `card-service`, `typing-service`, `community`, `room-shared` 웹 영역의 direct `button/input/textarea/select/motion.button` 잔여를 0개로 정리.
- 위 웹 대상 영역의 직접 hex는 `#111`, `#666`, `#aaa`, `#e5e5e5`, `#fafafa`, `#fff`만 남도록 정리.
- 모바일 `card-service` 화면 3종의 raw `Pressable`/`TextInput`을 `@yeon/ui/native`의 `YeonButton`/`YeonField` 경유로 교체.
- 모바일 `card-service` 화면과 `apps/mobile/src/components/ui`의 직접 hex를 제거하고 theme/token 경유 스타일로 정리.
- `room-shared` 다이얼로그/참가자 카드도 YeonButton 및 정규 색상으로 정리해 카드/타자 방 공용 UI 경계를 맞춤.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 추가 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조를 git 저장소로 인식하지 못해 프로젝트 검사를 건너뜀.
- 웹 direct control 점검: `card-service`, `typing-service`, `community`, `room-shared`에서 `<button|input|textarea|select|motion.button>` 잔여 0개.
- 웹 색상 점검: 대상 영역 직접 hex 목록은 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 카드 점검: `apps/mobile/src/features/card-service`에서 `<Pressable|TextInput>` 및 직접 hex 잔여 없음.

## 2026-06-02 모바일 community 추가 이관

- 모바일 community 경계(`apps/mobile/src/features/chat-service`)의 친구/피드/에스크/채팅/프로필 화면 raw `Pressable`/`Switch`를 `@yeon/ui/native`의 `YeonButton` 경유로 교체.
- 프로필 알림 토글은 RN `Switch` 대신 Universal UI 버튼 토글로 전환해 raw native control 잔여를 제거.
- `community-chat-header` compact 접속 표시의 `bg-emerald-500`를 서비스 정규색 `bg-[#111]`로 변경해 웹 community 색상 규칙을 맞춤.
- 모바일 `chat-service` + `card-service` + `components/ui` 대상에서 테스트 정규식 외 raw `Pressable`/`TextInput`/`Switch` 잔여 없음 확인.
- 상담 워크스페이스 관련 경로 변경 없음 재확인.

## 2026-06-02 모바일 community 검증

- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 웹 대상 직접 컨트롤 점검: `card-service`, `typing-service`, `community`, `room-shared`에서 `<button|input|textarea|select|motion.button>` 잔여 없음.
- 웹 대상 직접 hex 점검: `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 웹 대상 명시 팔레트 클래스 점검: `bg/text/border-(emerald|orange|amber|...)` 잔여 없음.
- 모바일 대상 직접 hex 점검: `chat-service`, `card-service`, `components/ui`에서 직접 hex/오렌지/앰버 잔여 없음.

## 2026-06-02 Universal Icon / lucide 제거 추가 진행

- `@yeon/ui`에 Universal `YeonIcon` 프리미티브를 추가하고 web/native 엔트리에서 각각 export.
- web `apps/web/src/components/yeon-ui/yeon-icon.tsx` wrapper를 추가해 기존 Yeon UI 경로에서 `YeonIcon`을 소비하게 연결.
- `card-service`, `typing-service`, `community`, `room-shared`의 `lucide-react` 아이콘 import를 제거하고 `YeonIcon` 이름 기반 사용으로 전환.
- `YeonIcon` 공용 타입에서 `react-native` 타입 import를 분리해 web typecheck 시 React Native 전역 타입이 DOM `FormData`/fetch 타입을 오염시키지 않도록 수정.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Universal Icon 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web/mobile 영역 `lucide-react`/`lucide-react-native` import 잔여 없음.
- 웹 대상 직접 컨트롤 점검: `card-service`, `typing-service`, `community`, `room-shared`에서 `<button|input|textarea|select|motion.button>` 잔여 없음.
- 웹 대상 직접 hex 점검: `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 대상 직접 컨트롤 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Pressable`/`TouchableOpacity`/`TextInput`/`Switch` 잔여 없음.
- 모바일 대상 직접 hex/오렌지/앰버 점검: 잔여 없음.

## 2026-06-02 Community web-only animation 제거

- `community-chat-widget`의 `framer-motion`(`AnimatePresence`, `motion`, `useReducedMotion`) 의존을 제거.
- compact 채팅 패널은 전역 `useCommunityChatPanel` 상태를 source of truth로 유지하되, 애니메이션 exit 상태 대신 즉시 닫힘 상태로 단순화.
- 채팅 열기/닫기 아이콘은 `YeonIcon` 정적 렌더로 유지해 Universal UI 프리미티브 경유를 강화.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Community animation 제거 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- 대상 web 영역 `framer-motion`/`motion`/`AnimatePresence`/`useReducedMotion` 잔여 없음.
- 대상 web/mobile 영역 `lucide-react`/`lucide-react-native` import 잔여 없음.
- 웹 대상 직접 컨트롤 점검: `card-service`, `typing-service`, `community`, `room-shared`에서 `<button|input|textarea|select|motion.button>` 잔여 없음.

## 2026-06-02 YeonLink / YeonImage 앱 경계 추가

- `apps/web/src/components/yeon-ui/yeon-link.tsx` 추가: target feature가 `next/link`를 직접 import하지 않고 Yeon UI 경계를 통해 내부 라우팅 링크를 사용하도록 전환.
- `apps/web/src/components/yeon-ui/yeon-image.tsx` 추가: target feature가 `next/image`를 직접 import하지 않고 Yeon UI 경계를 통해 이미지를 사용하도록 전환.
- `card-service`, `typing-service`, `community`, `room-shared`의 `next/link` 직접 import와 `<Link>` 사용을 `YeonLink`로 교체.
- `typing-room-lobby-screen`의 `next/image` 직접 import와 `<Image>` 사용을 `YeonImage`로 교체.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonLink / YeonImage 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 `next/link`/`next/image` 직접 import 잔여 없음.
- 대상 web 영역 직접 컨트롤 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 대상 raw control/direct hex/orange/amber 잔여 없음.

## 2026-06-02 YeonLabel 프리미티브 추가

- `@yeon/ui`에 `YeonLabel` web/native 프리미티브 추가.
- `apps/web/src/components/yeon-ui/yeon-label.tsx` wrapper 추가 및 Yeon UI index export 연결.
- `card-service`, `typing-service`, `community`, `room-shared`의 raw `<label>`을 `YeonLabel`로 교체.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonLabel 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 raw `<label>` 및 direct `button/input/textarea/select` 잔여 없음.
- 대상 web 영역 `framer-motion`/`lucide-react`/`next/link`/`next/image` 직접 의존 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.

## 2026-06-02 YeonForm 프리미티브 추가

- `@yeon/ui`에 `YeonForm` web/native 프리미티브 추가.
- `apps/web/src/components/yeon-ui/yeon-form.tsx` wrapper 추가 및 Yeon UI index export 연결.
- `card-service`, `typing-service`, `community`, `room-shared`의 raw `<form>`을 `YeonForm`으로 교체.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonForm 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 raw `form/label/button/input/textarea/select` 잔여 없음.
- 대상 web 영역 `framer-motion`/`lucide-react`/`next/link`/`next/image` 직접 의존 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 대상 raw control/direct hex/orange/amber 잔여 없음.

## 2026-06-02 YeonView 레이아웃 프리미티브 추가

- `@yeon/ui`에 `YeonView` web/native 레이아웃 프리미티브 추가.
- `apps/web/src/components/yeon-ui/yeon-view.tsx` wrapper 추가 및 Yeon UI index export 연결.
- `card-service`, `typing-service`, `community`, `room-shared`의 주요 semantic layout 태그(`main/section/article/header/footer/aside`)를 `YeonView as="..."`로 교체.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonView 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 raw `main/section/article/header/footer/aside/form/label/button/input/textarea/select` 잔여 없음.
- 대상 web 영역 `framer-motion`/`lucide-react`/`next/link`/`next/image` 직접 의존 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.

## 2026-06-02 YeonList / YeonListItem 프리미티브 추가

- `@yeon/ui`에 `YeonList`, `YeonListItem` web/native 프리미티브 추가.
- `apps/web/src/components/yeon-ui/yeon-list.tsx` wrapper 추가 및 Yeon UI index export 연결.
- `card-service`, `typing-service`, `community`, `room-shared`의 raw `ul/ol/li`를 `YeonList`/`YeonListItem` 또는 기존 `YeonSurface as="li"` 경유 구조로 정리.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonList 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 raw `ul/ol/li/main/section/article/header/footer/aside/form/label/button/input/textarea/select` 잔여 없음.
- 대상 web 영역 `framer-motion`/`lucide-react`/`next/link`/`next/image` 직접 의존 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 대상 raw control/direct hex/orange/amber 잔여 없음.

## 2026-06-02 YeonText / YeonOption / raw DOM 제거 확대

- `@yeon/ui`의 `YeonText`에 `unstyled` variant와 `inherit` tone을 추가해 기존 타이포그래피 class를 보존하면서 raw 텍스트 태그를 프리미티브 경유로 이관할 수 있게 했다.
- `YeonText`의 web `as` 지원 범위를 `h4/time/code/pre/blockquote/legend`까지 확장하고 `dateTime` prop을 허용했다.
- `@yeon/ui`의 `YeonView` web/native 프리미티브를 `forwardRef` 기반으로 조정해 기존 div ref 사용처도 이관 가능하게 했다.
- `@yeon/ui`에 `YeonOption` web/native 프리미티브와 web wrapper를 추가했다.
- `card-service`, `typing-service`, `community`, `room-shared`의 raw `p/h1/h2/h3/h4/strong/b/time/code/pre/blockquote/span/div/fieldset/legend/option/a/img/svg/path/table/th/td` 사용을 Yeon UI 프리미티브 경유로 정리했다.
- `typing-service`/`card-service` 직접 anchor는 `YeonLink`, 첨부 이미지는 `YeonImage`, 삭제/화살표 표시는 `YeonIcon` 또는 `YeonText`로 치환했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 raw DOM 제거 확대 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- 대상 web 영역 raw core DOM/control 태그 스캔 결과 잔여 없음: `div/span/p/h1/h2/h3/h4/strong/b/time/code/pre/blockquote/ul/ol/li/main/section/article/header/footer/aside/form/label/option/fieldset/legend/a/img/svg/path/table/th/td/button/input/textarea/select`.
- 대상 web 영역 `framer-motion`/`lucide-react`/`next/link`/`next/image` 직접 의존 잔여 없음.
- 대상 web 영역 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 대상 raw control/direct hex/orange/amber 잔여 없음.

## 2026-06-02 app route/admin typing + mobile native wrapper 확대

- `apps/web/src/app/typing-service/**`, `apps/web/src/app/card-service/**`의 target route fallback/layout raw DOM을 Yeon UI 경유로 정리했다.
- typing 관리자 경로인 `apps/web/src/app/admin/typing-decks/page.tsx`, `apps/web/src/app/admin/typing-characters/page.tsx`도 target scope로 보고 `YeonView`/`YeonText`/`YeonLink`로 이관했다.
- 관리자 타자 화면의 금지/비권장 색(`text-red-600`, `#333`, `#888`, `#ddd`)을 중립 허용 토큰으로 정리했다.
- `@yeon/ui`에 native/web 공용 래퍼를 추가했다: `YeonScrollView`, `YeonKeyboardAvoidingView`, `YeonSafeAreaView`, `YeonImage`, `YeonSpinner`.
- 모바일 `card-service`, `chat-service`, `components/ui`의 raw `View/Text/ScrollView/KeyboardAvoidingView/SafeAreaView/Image/ActivityIndicator` 사용을 Yeon UI 프리미티브 경유로 이관했다.
- `react-native-safe-area-context`를 `@yeon/ui` peer/dev dependency로 추가하고 lockfile을 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 app route/admin/mobile wrapper 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 worktree `.git` 파일 구조 때문에 프로젝트 검사를 건너뜀.
- target web feature/app/admin typing 영역 raw core DOM/control 태그 잔여 없음.
- target web feature/app/admin typing 영역 `next/link`/`next/image`/`lucide-react`/`framer-motion` 직접 의존 잔여 없음.
- target web 직접 hex는 `#111/#666/#aaa/#e5e5e5/#fafafa/#fff`만 남음.
- 모바일 target feature/components raw `View/Text/ScrollView/FlatList/Pressable/TouchableOpacity/TextInput/Switch/SafeAreaView/KeyboardAvoidingView/Image/ActivityIndicator` 잔여 없음(테스트 문자열 제외).
- target 전체 `orange/amber/#e8630a/#e87310` 잔여 없음.

## 2026-06-02 카드 마크다운 스타일 escape hatch 정리

### 작업내용

- 카드 서비스 마크다운/리치 에디터에 남아 있던 직접 `<style jsx global>` 사용을 `YeonGlobalStyle` 웹 UI wrapper로 이동했다.
- `MarkdownContent`, `CardRichEditorGlobalStyles`는 더 이상 직접 `style` 태그를 렌더하지 않고 Yeon UI 경유로 전역 스타일을 주입한다.
- 타깃 서비스 범위(card-service, typing-service, community, room-shared, typing admin/app routes)에서 원시 DOM/control 태그 스캔이 0건이 되도록 확인했다.

### 논의 필요

- 마크다운/TipTap 스타일은 여전히 웹 전용 escape hatch다. Native까지 동일 편집기를 완전 공유하려면 별도 RN markdown/editor 전략이 필요하다.

### 선택지

- A. 현재처럼 웹 전용 escape hatch는 Yeon UI wrapper로 격리하고 feature 소스는 Universal UI primitive만 사용한다.
- B. Markdown/TipTap 자체를 packages/ui 또는 별도 universal rich-content 패키지로 이관한다.

### 추천

- A로 기능 회귀를 막고, B는 별도 차수에서 RN markdown/editor 요구사항을 확정한 뒤 진행한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- 타깃 웹 raw DOM/control/style 태그 스캔 0건
- 타깃 웹 금지 dependency(next/link, next/image, lucide-react, framer-motion) 스캔 0건
- 타깃 웹/모바일/packages/ui/design-tokens orange/amber 스캔 0건
- `git diff --check`

## 2026-06-02 HTML 주입/DOM 타입 escape hatch 추가 격리

### 작업내용

- `@yeon/ui`에 `YeonHtmlContent` web/native 프리미티브를 추가했다. web은 HTML 주입을 한 곳에서 처리하고, native는 fallback 텍스트만 렌더할 수 있는 안전한 no-op 계층으로 둔다.
- web wrapper에 `YeonHtmlContent`, `YeonStructuredData`를 추가했다.
- 카드 마크다운 HTML 렌더와 Mermaid SVG 렌더의 직접 `dangerouslySetInnerHTML` 사용을 `YeonHtmlContent`로 대체했다.
- `card-service`, `typing-service`, `community` app route의 JSON-LD `Script` 직접 사용/HTML 주입을 `YeonStructuredData`로 대체했다.
- target feature에 남아 있던 `HTMLDivElement` ref/event 타입을 `HTMLElement`로 일반화해 `YeonView` ref와 더 잘 맞게 했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- `YeonHtmlContent`는 web HTML/SVG 주입을 격리하는 임시 universal escape hatch다. RN에서 실제 rich HTML 렌더가 필요하면 별도 native renderer 결정이 필요하다.

### 선택지

- A. 현재처럼 web-only HTML 주입은 `@yeon/ui` primitive로 격리하고 feature 컴포넌트는 Yeon UI 경유만 허용한다.
- B. Markdown/HTML/SVG 렌더러 자체를 별도 universal rich-content 패키지로 분리한다.

### 추천

- A로 전체 화면 이관을 계속 진행하고, RN rich-content 요구가 확정되면 B를 별도 차수로 진행한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- target web `dangerouslySetInnerHTML`/`next/script`/`HTMLDivElement` 스캔 0건
- target web raw DOM/control/script/style 태그 스캔 0건
- target web/mobile/packages `orange`/`amber`/known orange hex 스캔 0건
- `git diff --name-only | rg 'counsel|instructor|student-management'` 결과 0건
- `git diff --check`

## 2026-06-02 브라우저 이벤트/스크롤락 Yeon UI hook 격리

### 작업내용

- `@yeon/ui`에 브라우저 이벤트/스크롤락 hook을 추가했다: `useYeonBodyScrollLock`, `useYeonDocumentEvent`, `useYeonWindowEvent`, `useYeonEscapeKey`.
- React hook 밖에서 필요한 문서 이벤트 구독용 `addYeonDocumentEventListener`를 추가하고 native에서는 no-op으로 둔다.
- 카드 모달(`ResponsiveModal`, `MergeGuestDialog`), 공용 방 생성 모달(`RoomCreateDialog`), 타자 설정 드롭다운, 카드 인증 상태 갱신, 카드 추가 beforeunload, bulk help 커스텀 이벤트, 리치 에디터 이미지 리사이즈 포인터 이벤트의 직접 `addEventListener/removeEventListener`를 Yeon UI hook/helper 경유로 대체했다.
- target feature 범위에서 직접 `document.body.style` 제어와 window/document listener 등록 잔여를 제거했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- TipTap/Markdown 내부의 DOMParser/createElement/querySelector는 아직 rich editor/HTML 변환 로직 특성상 남아 있다. 다음 차수에서 `rich-content` 경계로 분리하거나 packages/ui escape hatch로 이전할 수 있다.

### 선택지

- A. 이벤트/스크롤락/HTML 주입처럼 공통 브라우저 escape hatch를 먼저 Yeon UI로 끌어올린다.
- B. TipTap/Markdown DOM 변환 전체를 즉시 universal rich-content 계층으로 분리한다.

### 추천

- A를 계속 진행하고, B는 기능 회귀 가능성이 커서 별도 검증 단위로 분리한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile lint`
- target web raw DOM/control/script/style 태그 스캔 0건
- target web 직접 `document.addEventListener/removeEventListener`, `window.addEventListener/removeEventListener`, `document.body.style` 스캔 0건
- target web `dangerouslySetInnerHTML`/`next/script`/`HTMLDivElement` 스캔 0건
- target web/mobile/packages `orange`/`amber`/known orange hex 스캔 0건
- `git diff --name-only | rg 'counsel|instructor|student-management'` 결과 0건
- `git diff --check`

## 2026-06-02 Rich DOM escape hatch / 모바일 루트 UI 추가 격리

### 변경

- `@yeon/ui`에 `rich-content/YeonRichDom` web/native 유틸을 추가해 HTML 파싱, DOM 생성, selector 조회, closest 조회를 Universal UI 경계로 격리했다.
- 웹 카드 feature의 리치 콘텐츠 유틸에서 직접 `DOMParser`, `document.createElement`, `querySelector(All)`, `closest`, `document.body.innerHTML/textContent` 사용을 제거했다.
  - 대상: 카드 visible text, 클립보드 이미지 추출, Notion attachment normalizer, table paste/markdown table renderer, markdown HTML decorator, YouTube iframe attribute normalizer, TipTap image node view, table selection helper.
- 타자방 내부 링크 인터셉트도 `getYeonClosestElement`를 사용해 직접 `closest` 의존을 제거했다.
- 모바일 루트 `+not-found`, `_layout`, `AppLaunchScreen`의 직접 RN UI primitive(`View`, `Text`, `Image`)를 `@yeon/ui/native`의 `YeonView`, `YeonText`, `YeonImage`로 교체했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target web scope 직접 DOM/listener/injection escape hatch 스캔 0건.
- target web scope raw JSX DOM/control tag 스캔 0건(문자열 regex 제외).
- mobile app/src 직접 RN UI primitive import 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 현재 워킹 디렉토리에 계속 누적 중이며 커밋하지 않는다.
- 완전 완료 선언 전에는 백로그 전 항목 기준으로 packages/ui 프리미티브/웹·모바일 패리티/시각 회귀 범위를 계속 확장해야 한다.

## 2026-06-02 Yeon UI 웹 escape hatch 잔여 제거

### 변경

- `YeonContextMenu`가 직접 `div`/`button`/`span`, `HTMLDivElement`, `window.addEventListener`를 쓰지 않도록 `YeonView`/`YeonButton`/`YeonText`와 `useYeonWindowEvent`로 교체했다.
- `@yeon/ui` browser runtime에 `getYeonViewportSize`, `mountYeonGlobalStyle`를 추가하고 native no-op을 같이 제공했다.
- `YeonGlobalStyle`의 직접 `document.querySelectorAll`, `document.createElement`, `document.head.append` 사용을 `@yeon/ui` runtime 경유로 이동했다.
- `YeonStructuredData`에서 Next `Script`/`dangerouslySetInnerHTML` 직접 사용을 제거하고 JSON-LD 문자열을 `<` escape 후 렌더하도록 정리했다.
- `copyYeonClipboardText` 이관 후 unsupported 환경에서 성공처럼 보이지 않게 초대 링크/카드 내보내기/코드블록 복사 호출부가 false 반환을 실패로 처리하도록 보정했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- `packages/ui` runtime 내부에는 의도적인 web escape hatch가 남아 있다. 앱 feature/wrapper에서는 직접 DOM·browser global 사용을 계속 줄이고, 패키지 경계에서만 유지한다.
- JSON-LD는 웹 SEO 전용이라 완전 네이티브 UI 컴포넌트로 볼 수는 없다. 다만 직접 `next/script`/HTML injection 의존은 제거했다.

### 선택지

- A. 앱/feature의 직접 플랫폼 의존을 계속 `@yeon/ui` primitive/runtime으로 이동한다.
- B. `packages/ui` 내부의 web implementation까지 RNW 기반으로 더 좁혀 native parity를 강화한다.

### 추천

- A를 유지하면서 잔여 feature 화면 이관을 우선하고, packages/ui 내부 구현 정리는 별도 안정화 차수에서 진행한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target web direct DOM/listener/injection 스캔 0건.
- target web browser global 스캔은 테스트의 `localStorage` expectation만 남음.
- mobile app/src 직접 RN UI primitive import 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 작업은 계속 진행 중이며 커밋하지 않는다.
- 백로그 전체 완료 선언 전에는 card-service/typing-service/community의 화면 단위 Universal UI 이관, RN/native 패리티, 시각 회귀를 계속 확장해야 한다.

## 2026-06-02 Next navigation / Markdown rich-content 경계 이관

### 변경

- target feature 내부의 직접 `next/navigation` 사용을 제거하고 `apps/web/src/components/yeon-ui/yeon-navigation.ts` 웹 어댑터로 이동했다.
  - 대상: 카드 덱 플레이 상태, 카드 덱 상세, 카드방 생성, 타자 덱 라이브러리, 타자방 로비/방, 점령전 화면.
- `@yeon/ui` rich-content에 `YeonMermaid`를 추가했다.
  - `renderYeonMermaidSvg`, `mountYeonMermaidDiagram` web 구현과 native no-op을 제공한다.
  - 카드 feature의 직접 `import("mermaid")`, `mermaid.initialize`, `mermaid.render`, `host.innerHTML` 의존을 제거했다.
- `@yeon/ui` rich-content에 `YeonMarkdown`을 추가했다.
  - `YeonMarkdownContent`, `sanitizeYeonHtml` web 구현과 native no-op을 제공한다.
  - 카드 markdown feature의 직접 `dompurify`, `react-markdown`, `remark-gfm` import를 제거했다.
- `packages/ui`에 rich-content 의존성(`mermaid`, `dompurify`, `react-markdown`, `remark-gfm`)을 명시하고 `pnpm-lock.yaml` importer를 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- `YeonMarkdown`/`YeonMermaid`는 아직 web 구현 중심의 rich-content escape hatch다. native에서는 no-op이므로, 카드 rich editor/markdown의 실제 모바일 UX는 별도 native renderer/간소화 화면으로 이어서 확정해야 한다.

### 선택지

- A. web-only rich dependency를 packages/ui 경계로 계속 격리하고 feature 화면은 Universal UI 호출만 남긴다.
- B. 즉시 native Markdown/Mermaid 렌더러까지 구현한다.

### 추천

- A를 계속 진행한다. native rich renderer는 기능 회귀와 번들 리스크가 커서 별도 스파이크로 분리한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target feature 직접 `next/navigation` 스캔 0건.
- target feature 직접 `dompurify`/`react-markdown`/`remark-gfm`/`mermaid` 스캔 0건.
- target web 직접 DOM/listener/injection 스캔 0건.
- mobile app/src 직접 RN UI primitive import 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 작업은 계속 진행 중이며 커밋하지 않는다.
- rich-content native no-op을 실제 mobile UX로 대체하고, card-service/typing-service/community의 화면 단위 패리티 검증을 계속 확장해야 한다.

## 2026-06-02 Product shell / Next host adapter 추가 격리

### 변경

- feature/app target scope의 `next/dynamic`, `usePathname`, `notFound` 직접 사용을 Yeon wrapper로 이동했다.
  - `yeon-dynamic.ts`: dynamic import 어댑터
  - `yeon-route-control.ts`: notFound route control 어댑터
  - `typing-service-layout-client`, community post route, card markdown editor 호출부를 wrapper 경유로 교체했다.
- target 서비스 공통으로 쓰는 `components/product-shell`의 raw DOM/Next/lucide/document listener 의존을 제거했다.
  - `ProductHeader`, `CommonProductHeader`, 프로필 메뉴, 설정 버튼을 `YeonView`, `YeonLink`, `YeonButton`, `YeonText`, `YeonIcon` 기반으로 교체했다.
  - 프로필 메뉴 외부 클릭/ESC 처리에서 직접 `document.addEventListener` 대신 `useYeonDocumentEvent`를 사용했다.
  - 도움말 모달에서 직접 `div/section/button/p/h2/ul/li/details/summary`, `document.body.style`, `document.addEventListener`를 제거하고 `YeonView`/`YeonText`/`YeonButton` 및 `useYeonEscapeKey`, `useYeonBodyScrollLock`을 사용했다.
- `@yeon/ui` 아이콘 프리미티브에 공통 shell용 아이콘을 추가했다.
  - `settings`, `circle-help`, `circle-user`, `user`, `log-out`
  - native glyph fallback도 함께 추가했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- `components/product-shell`은 아직 web app 내부 wrapper지만, target feature의 공통 서비스 shell이므로 다음 차수에서 packages/ui 또는 서비스별 universal shell로 완전히 승격할 수 있다.

### 선택지

- A. app 내부 공통 shell을 Yeon UI primitive 기반으로 먼저 안정화한다.
- B. 곧바로 `packages/ui`의 universal shell 컴포넌트로 승격한다.

### 추천

- A를 유지한다. shell은 라우팅/인증/BGM 등 web host 의존이 있어 packages/ui 승격 전 어댑터 경계를 더 줄이는 편이 안전하다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target service/product-shell 직접 Next/dynamic route API 스캔 0건.
- target service/product-shell 직접 web-only deps 스캔 0건.
- target web/product-shell 직접 DOM/listener/injection 스캔 0건.
- mobile app/src 직접 RN UI primitive import 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 작업은 계속 진행 중이며 커밋하지 않는다.
- product shell을 packages/ui universal shell로 승격할지, web adapter로 유지할지는 다음 안정화 차수에서 결정한다.

## 2026-06-02 Rich editor / runtime adapter 추가 이관

### 변경

- 카드 rich editor의 직접 `@tiptap/*` 의존을 `@yeon/ui` rich-content 경계로 이관했다.
  - `packages/ui/src/rich-content/YeonTiptap/`에 web/native export를 추가했다.
  - `apps/web/src/components/yeon-ui/yeon-tiptap.ts`에서 feature용 wrapper를 제공한다.
  - card editor extension, serializer, image upload, table edit utils, rich editor 본체가 Yeon wrapper를 경유하도록 변경했다.
- legacy markdown editor 동적 import를 `yeon-markdown-editor.tsx` wrapper로 이동해 feature 직접 `@uiw/react-md-editor` import를 제거했다.
- 브라우저 런타임 경계를 확장했다.
  - `createYeonLoopingAudioController`: typing BGM의 `Audio`/`HTMLAudioElement` 직접 의존을 `@yeon/ui` runtime으로 이동.
  - `delayYeon`, `scheduleYeonInterval`/`clearYeonInterval`: feature의 직접 timer 사용을 runtime wrapper 경유로 정리.
  - `getYeonCustomEventDetail`: feature의 직접 `CustomEvent` 캐스팅을 제거.
- 상태 store 경계를 추가했다.
  - `packages/ui/src/runtime/YeonStateStore/`와 `apps/web/src/components/yeon-ui/yeon-state-store.ts`를 추가했다.
  - community chat panel, typing settings의 직접 `zustand`/`zustand/middleware` import를 제거했다.
- 실시간 SDK 경계를 추가했다.
  - `apps/web/src/components/yeon-ui/yeon-realtime-client.ts`로 Colyseus client 생성과 seat reservation 호환 패치를 격리했다.
  - card room, typing race room, territory battle room의 직접 `@colyseus/sdk` import를 제거했다.
- `@yeon/ui` 의존성에 `zustand`를 추가하고 lockfile을 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- `YeonTiptap`, `YeonMarkdown`, `YeonMermaid` native 구현은 아직 no-op/간소화 경계다. 모바일 실제 편집/렌더 UX는 별도 renderer 또는 모바일 전용 간소화 흐름으로 이어서 확정해야 한다.
- `yeon-realtime-client.ts`는 현재 web app adapter다. 장기적으로 mobile에서도 같은 실시간 UX를 제공하려면 shared runtime package 위치를 다시 정해야 한다.

### 선택지

- A. target feature에서 직접 web-only/SDK 의존을 계속 제거하고 Yeon adapter 경계를 먼저 완성한다.
- B. 즉시 native rich editor/realtime UX까지 구현한다.

### 추천

- A를 계속 진행한다. 현재 목표는 feature 화면을 Universal UI 경계로 이동시키는 것이며, native rich editor/realtime UX는 회귀 리스크가 크므로 별도 검증 차수로 분리한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target feature/product-shell 직접 `@radix-ui`, `lucide-react`, `next/link`, `next/navigation`, `next/script`, `next/dynamic`, `@tiptap/*`, `@uiw/react-md-editor`, `react-native`, `dompurify`, `react-markdown`, `remark-gfm`, `mermaid`, `zustand`, `@colyseus/sdk` 스캔 0건.
- target feature/app 직접 브라우저 런타임(`typeof window`, `new Audio`, `HTMLAudioElement`, `setTimeout`, `setInterval`, `CustomEvent`, `DOMParser`, storage, navigator, document/window 접근) 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 작업은 계속 진행 중이며 커밋하지 않는다.
- native rich content no-op 대체, product shell packages/ui 승격 여부, 실제 web/mobile 화면 패리티 검증을 계속 진행해야 한다.

## 2026-06-02 Native rich-content fallback 구현

### 변경

- `packages/ui/src/rich-content/YeonMarkdown/index.native.tsx`의 no-op 반환을 실제 native fallback 렌더링으로 교체했다.
  - Markdown/HTML 혼합 문자열에서 script/style/comment/tag를 제거하고, heading/list/quote/code/paragraph 블록으로 단순 파싱한다.
  - `YeonView`, `YeonText`, design-token 색상/간격/radius만 사용해 native에서 텍스트 fallback을 보여준다.
- `packages/ui/src/primitives/YeonHtmlContent/index.native.tsx`가 `fallbackText`가 없을 때도 HTML visible text를 추출해 표시하도록 변경했다.
- `packages/ui/src/rich-content/YeonTiptap/index.native.ts`의 `YeonTiptapEditorContent`가 `fallbackText`를 받으면 native 텍스트 fallback을 반환하도록 변경했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

### 논의 필요

- Mermaid native는 아직 실제 diagram 렌더링이 아니라 API-level fallback만 남아 있다. RN에서 SVG 렌더링을 도입할지, 모바일에서는 코드/텍스트 fallback으로 고정할지 별도 결정이 필요하다.
- TipTap native editor 자체는 여전히 실제 편집기가 아니다. 모바일 카드 편집 UX는 별도 단순 입력/미리보기 흐름으로 설계하는 편이 안전하다.

### 선택지

- A. rich-content native fallback을 먼저 확보하고 web feature 의존 격리 상태를 유지한다.
- B. 곧바로 native diagram/editor 구현까지 확장한다.

### 추천

- A를 유지한다. native diagram/editor는 의존성·성능·UX 리스크가 커서 별도 차수로 분리한다.

### 사용자 방향

- 커밋 없이 워킹 디렉토리에 누적.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- target feature/product-shell 직접 `@radix-ui`, `lucide-react`, `next/link`, `next/navigation`, `next/script`, `next/dynamic`, `@tiptap/*`, `@uiw/react-md-editor`, `react-native`, `dompurify`, `react-markdown`, `remark-gfm`, `mermaid`, `zustand`, `@colyseus/sdk` 스캔 0건.
- target feature raw JSX 스캔 결과는 `/<img\b/i` 정규식 문자열 1건만 남음.
- target feature/app 직접 브라우저 런타임 스캔 0건.
- target scope 금지 orange/amber 스캔 0건.
- `git diff --name-only | rg "counsel|instructor|student-management"` 0건.
- `git diff --check` 통과.

### 남은 경계

- 작업은 계속 진행 중이며 커밋하지 않는다.
- Mermaid native rendering, TipTap native editing, product shell package 승격, 실제 web/mobile 화면 패리티 검증을 계속 진행해야 한다.

## 2026-06-02 Mobile native runtime/style 경계 이관

- `@yeon/ui` 런타임에 `createYeonStyleSheet`, `yeonAbsoluteFillObject`, `isYeonIOS`, `isYeonWebPlatform`, `useYeonWindowDimensions`와 RN style/event 타입 별칭을 추가했다.
- `apps/mobile/app`, `apps/mobile/src/components/branding`, `apps/mobile/src/components/ui`, `apps/mobile/src/features/card-service`, `apps/mobile/src/features/chat-service`의 직접 `react-native` import를 제거하고 `@yeon/ui/native` 경유로 전환했다.
- 카드 상세 시트의 `StyleSheet.absoluteFillObject`도 `yeonAbsoluteFillObject`로 치환해 화면 코드가 RN 스타일 상수에 직접 결합하지 않게 정리했다.
- 자동 치환 중 삭제된 import는 타입체크 기준으로 즉시 복구했고, 최종 타입/린트 green 확인 완료.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Mobile native runtime/style 경계 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- 대상 web 영역 직접 의존 점검: `@radix-ui`, `lucide-react`, `next/link`, `next/navigation`, `next/script`, `next/dynamic`, `@tiptap/*`, `@uiw/react-md-editor`, `dompurify`, `react-markdown`, `remark-gfm`, `mermaid`, `zustand`, `@colyseus/sdk` 직접 import 잔여 없음.
- 대상 web 영역 raw JSX 점검: raw 태그 잔여는 `add-card-form.tsx`의 문자열 정규식 `/<img\b/i` 1건뿐.
- 대상 mobile UI 범위 직접 `react-native` import 잔여 없음.
- 대상 mobile UI 범위 direct RN 용어 점검: 테스트 파일의 문자열 정규식 `Pressable` 1건뿐.
- 오렌지/앰버 금지 스캔 통과: target web/mobile/packages 영역 잔여 없음.

## 2026-06-02 Mobile service storage 플랫폼 경계 이관

- `@yeon/ui` 런타임에 `getYeonOptionalLocalStorage`를 추가해 web/native 공용 localStorage 접근 경계를 명시했다.
- `apps/mobile/src/services/primary-auth/storage.ts`, `apps/mobile/src/services/card-service/storage.ts`, `apps/mobile/src/services/chat-service/storage.ts`의 직접 `react-native` `Platform` import를 제거했다.
- 위 storage 파일들의 직접 `globalThis.localStorage` 접근을 `getYeonOptionalLocalStorage` 경유로 바꿔 플랫폼 판단과 브라우저 저장소 접근을 `@yeon/ui/native` 런타임으로 모았다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Mobile service storage 플랫폼 경계 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `apps/mobile/app apps/mobile/src` 전체 직접 `react-native` import 스캔 결과: `life-os-screen.tsx` 1건만 남음. card-service/chat-service/공용 UI/storage 영역 잔여 없음.
- 모바일 service/card/chat 범위 `globalThis.localStorage`, `Platform.OS`, `RNPlatform`, 직접 `react-native` import 잔여 없음.
- target web/app/feature raw JSX 스캔 결과는 `add-card-form.tsx`의 문자열 정규식 `/<img\b/i` 1건뿐.
- target web/app/feature 직접 web-only dependency 스캔 0건.
- target web/mobile/packages 오렌지/앰버 금지 스캔 0건.

## 2026-06-02 YeonSwitch 프리미티브 추가

- `@yeon/ui`에 Universal `YeonSwitch` web/native 프리미티브 추가.
- web wrapper `apps/web/src/components/yeon-ui/yeon-switch.tsx`와 Yeon UI index export 연결.
- 모바일 community 프로필 알림 토글을 임시 `YeonButton` 토글에서 `YeonSwitch`로 교체해 토글 의미와 접근성 역할을 Universal UI 계층에 고정.
- `packages/ui/README.md`의 현재 프리미티브 목록에 Switch/Form/Label/View 계열 추가 반영.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 YeonSwitch 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- 모바일 target 서비스 직접 `react-native` import 점검: `card-service`/`chat-service`/서비스 저장소 잔여 없음. 전체 mobile app 기준 잔여는 목표 범위 밖 `life-os` 1개.
- 모바일 target raw control 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Switch`/`Pressable`/`TouchableOpacity`/`TextInput` 잔여 없음(테스트 정규식 제외).
- 웹 target 직접 컨트롤 점검: `card-service`, `typing-service`, `community`, `room-shared`에서 raw `button/input/textarea/select/motion.button` 잔여 없음.
- 오렌지/앰버 금지 점검: target web/mobile/packages 영역에서 `orange|amber|#e8630a|#e87310` 등 잔여 없음.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon web event type 경계 추가

- `@yeon/ui/web`에 `YeonFormEvent`, `YeonChangeEvent`, `YeonMouseEvent`, `YeonKeyboardEvent`, `YeonClipboardEvent`, `YeonTouchEvent` 타입 alias 추가.
- `apps/web/src/components/yeon-ui` index에서 해당 event 타입을 재수출해 target feature가 React DOM 이벤트 타입을 직접 import하지 않도록 전환.
- card-service/typing-service/room-shared target 파일의 `FormEvent`, `ChangeEvent`, `MouseEvent`, `KeyboardEvent`, `ClipboardEvent`, `TouchEvent` 직접 사용을 Yeon event 타입으로 교체.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon event type 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web 직접 React DOM event type 점검: `FormEvent/ChangeEvent/MouseEvent/KeyboardEvent/ClipboardEvent/TouchEvent` 직접 타입 사용 잔여 없음.
- target web/mobile 직접 platform/library import 점검: `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native` 잔여 없음.
- target web 직접 control 점검: raw `button/input/textarea/select/motion.button` 잔여 없음.
- target mobile raw control 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Switch/Pressable/TouchableOpacity/TextInput` 잔여 없음(테스트 정규식 제외).
- 오렌지/앰버 금지 점검: target web/mobile/packages 영역에서 `orange|amber|#e8630a|#e87310` 등 잔여 없음.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon web element type 경계 추가

- `@yeon/ui/web`에 `YeonFormElement`, `YeonInputElement`, `YeonTextAreaElement`, `YeonSelectElement`, `YeonButtonElement`, `YeonAnchorElement`, `YeonImageElement`, `YeonIFrameElement`, `YeonTableElement`, `YeonTableRowElement`, `YeonTableCellElement`, `YeonPreElement`, `YeonDocument`, `YeonBaseElement`, `YeonEventTarget`, `YeonNode`, `YeonFormEventHandler` 타입 alias 추가.
- `apps/web/src/components/yeon-ui` index에서 해당 타입을 재수출해 target feature가 DOM element/document/event-target 타입을 직접 참조하지 않도록 전환.
- card-service/typing-service/community/room-shared target 파일의 `HTML*Element`, `HTMLElement`, `Document`, `EventTarget`, `Element[]`, `Node` 타입 사용을 Yeon 타입으로 교체.
- `card-editor-extensions`의 런타임 `instanceof HTMLElement` 분기를 `isYeonElement` 경유로 교체해 DOM constructor 직접 의존을 제거.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon element type 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web 직접 DOM element/document 타입 점검: `HTML*Element`, `HTMLElement`, `Document`, `EventTarget`, `Element[]`, `as Node`, `instanceof Yeon` 잔여 없음. `YeonTiptapNode as Node`는 TipTap wrapper alias로 남음.
- target web/mobile 직접 platform/library import 점검: `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native` 잔여 없음.
- target web 직접 control 점검: raw `button/input/textarea/select/motion.button` 잔여 없음.
- target mobile raw control 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Switch/Pressable/TouchableOpacity/TextInput` 잔여 없음(테스트 정규식 제외).
- 오렌지/앰버 금지 점검: target web/mobile/packages 영역에서 `orange|amber|#e8630a|#e87310` 등 잔여 없음.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon rich DOM 조작 경계 추가

- `@yeon/ui`의 `YeonRichDom`에 DOM attribute/text/class/append/remove/replace/ownerDocument helper를 추가하고 web/native 엔트리에서 동일 이름으로 export했다.
- `apps/web/src/components/yeon-ui/yeon-rich-dom.ts` wrapper도 새 helper를 재수출하도록 연결했다.
- card-service 리치 에디터/마크다운/테이블/유튜브/클립보드 HTML 처리 코드의 직접 `getAttribute/setAttribute/textContent/classList/ownerDocument/remove/appendChild/replaceWith` 사용을 Yeon rich-dom helper 경유로 교체했다.
- typing room 내부 네비게이션 클릭 캡처의 anchor 판정/attribute 조회도 Yeon rich-dom helper 경유로 교체했다.
- 남은 `textContent` 스캔 2건은 ProseMirror/TipTap node 모델의 데이터 필드(`card-editor-table-edit-utils`, `card-editor-markdown-serializer`)라 DOM 조작 경계 대상이 아님.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon rich DOM 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target rich DOM 직접 조작 스캔: `dangerouslySetInnerHTML/innerHTML/outerHTML/querySelector/querySelectorAll/createElement/DOMParser/ownerDocument/classList/appendChild/remove()/setAttribute/getAttribute/cloneNode/replaceWith` 잔여 없음.
- target web/mobile/packages 오렌지/앰버 금지 스캔 0건.
- target web/mobile 직접 platform/library import 점검: `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native` 잔여 없음.
- target web raw control/layout 점검: `button/input/textarea/select/form/label/main/section/article/header/footer/aside/ul/ol/li/motion.button` 잔여 없음.
- target mobile raw control 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Switch/Pressable/TouchableOpacity/TextInput` 잔여 없음(테스트 정규식 제외).
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon browser runtime 경계 추가

- `@yeon/ui`의 `YeonBrowserRuntime`에 `fetchYeon`, `createYeonUrl`, `createYeonUrlSearchParams`, `createYeonBlob`, `createYeonJsonBlob`, `createYeonFile`, `isYeonBlob`과 `YeonFile/YeonBlob/YeonDataTransfer/YeonResponse/YeonFetchInput/YeonUrl/YeonUrlSearchParams` 타입 경계를 추가했다.
- web wrapper `apps/web/src/components/yeon-ui/yeon-browser-runtime.ts`와 Yeon UI index export에 새 runtime 함수/타입을 연결했다.
- card-service/typing-service/community의 구현 코드에서 직접 `fetch`, `Response`, `RequestInfo | URL`, `File`, `Blob`, `DataTransfer`, `URL`, `URLSearchParams` 사용을 Yeon runtime 함수/타입 경유로 교체했다.
- 카드 리치 에디터 이미지 업로드/클립보드/YouTube URL 처리와 타자방 내부 네비게이션 URL 생성도 Yeon runtime 경유로 정리했다.
- 테스트 파일의 전역 fetch/mock Response/File 사용은 브라우저 API 모킹 목적이라 이번 구현 경계 스캔에서 제외했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon browser runtime 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- non-test target 구현 코드 직접 browser runtime 스캔: `File/Blob/DataTransfer/ClipboardItem/URLSearchParams/URL/fetch/Response/RequestInfo` 직접 사용 잔여 없음(파일명·에러문구 false positive 제외).
- target web/mobile/packages 오렌지/앰버 금지 스캔 0건.
- target web/mobile 직접 platform/library import 점검: `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native` 잔여 없음.
- target web raw control/layout 점검: `button/input/textarea/select/form/label/main/section/article/header/footer/aside/ul/ol/li/motion.button` 잔여 없음.
- target mobile raw control 점검: `chat-service`, `card-service`, `components/ui`에서 raw `Switch/Pressable/TouchableOpacity/TextInput` 잔여 없음(테스트 정규식 제외).
- target rich DOM 직접 조작 스캔 잔여 없음.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon modal/overlay 경계 추가

- `@yeon/ui`의 기존 `YeonModal`을 web wrapper(`apps/web/src/components/yeon-ui/yeon-modal.tsx`)로 노출하고 app-level `@/components/yeon-ui` index에서 재수출했다.
- card-service 공용 `ResponsiveModal`, 카드 설정/생성/삭제/게스트 병합 dialog, typing-service 덱 생성 modal, community 게스트 작성자 확인 modal, room-shared 방 생성 dialog를 `YeonModal` 경유로 전환했다.
- target modal에서 직접 `role="dialog"`/`aria-modal` wrapper를 만들던 구조를 제거하고, `<dialog>` 기반 Universal UI primitive에 접근성 label/id를 위임했다.
- overlay 색상은 `bg-black/*` 대신 허용 토큰 기반 `bg-[#111]/*`로 통일했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon modal/overlay 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web app route/product-shell raw HTML/platform/browser scan 0건.
- target web feature 직접 dialog scan: `role="dialog"`, `aria-modal`, `bg-black/*`, `bg-black/text-black/border-black` 잔여 없음.
- target web/mobile/packages 오렌지/앰버 금지 스캔 0건.
- target web/mobile 직접 platform/library import 점검: `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native` 잔여 없음.
- target web raw control/layout 점검: `button/input/textarea/select/form/label/main/section/article/header/footer/aside/ul/ol/li/motion.button` 잔여 없음.
- target mobile raw control 점검: `chat-service`, `card-service`, `components/ui`, `app`에서 raw RN view/control 잔여 없음(테스트 정규식 제외).
- target rich DOM 및 non-test browser runtime 직접 사용 스캔 잔여 없음.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon runtime 시간/난수/전역 싱글턴 경계 추가

- `@yeon/ui` runtime에 `getYeonNow`, `getYeonRandom`, `createYeonRandomUUID`, `getYeonRandomUint32`, `getYeonRuntimeSingleton`을 web/native 동명 API로 추가했다.
- web wrapper `apps/web/src/components/yeon-ui/yeon-browser-runtime.ts`와 `packages/ui` web/native export에 새 runtime API를 연결했다.
- community presence/guest identity, card room guest profile, card shuffle, typing deck seed 선택, typing race solo/multiplayer timer·noise, territory battle timestamp, markdown mermaid id, typing BGM singleton의 직접 `Date.now`/`Math.random`/`crypto`/`globalThis` 사용을 Yeon runtime 경유로 교체했다.
- typing BGM controller 캐시는 feature-local `globalThis` 선언 대신 `getYeonRuntimeSingleton` key로 관리한다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon runtime 시간/난수/전역 싱글턴 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target non-test 직접 runtime 호출 스캔: `window./navigator./localStorage./sessionStorage./globalThis./Date.now/Math.random/new Audio/new CustomEvent/requestAnimationFrame/setTimeout/setInterval/matchMedia/crypto.` 잔여 없음. `document.descendants`는 ProseMirror node 모델 false positive.
- target web feature 직접 dialog/raw control/black overlay scan 0건.
- target web/mobile/packages 오렌지/앰버 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon query 경계 추가

- `@yeon/ui`에 `YeonQuery` runtime wrapper를 추가해 `YeonQueryClient`, `YeonQueryClientProvider`, `useYeonQuery`, `useYeonQueries`, `useYeonMutation`, `useYeonQueryClient`, `YeonUseQueryResult`를 web/native 동명 API로 export했다.
- web wrapper `apps/web/src/components/yeon-ui/yeon-query.ts`와 app-level Yeon UI index export를 추가했다.
- card-service/typing-service/community web feature와 mobile card/chat feature의 직접 `@tanstack/react-query` import를 Yeon query wrapper import로 교체했다. 기존 호출명은 alias로 유지해 동작 diff를 줄였다.
- `packages/ui/package.json`에 `@tanstack/react-query` 의존성을 추가하고 `pnpm install --ignore-scripts`로 lock importer를 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon query 경계 검증

- `pnpm install --ignore-scripts` 완료(신규 다운로드 없음, 기존 peer warning만 출력).
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web/mobile `@tanstack/react-query` 직접 import scan 0건.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon native navigation 경계 추가

- `@yeon/ui/native`에 `YeonNavigation` runtime wrapper를 추가해 `YeonRedirect`, `YeonRouteLink`, `YeonStack`, `YeonTabs`, `useYeonRouter`, `useYeonLocalSearchParams`, `YeonHref`를 export했다.
- mobile app route/layout과 card-service/chat-service feature의 직접 `expo-router` import를 `@yeon/ui/native` navigation alias import로 교체했다.
- `packages/ui/package.json`에 `expo-router` 의존성을 명시하고 `pnpm install --ignore-scripts`로 lock importer를 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon native navigation 검증

- `pnpm install --ignore-scripts` 완료(기존 peer warning과 expo peer warning만 출력).
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web/mobile `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native`, `@tanstack/react-query`, `expo-router` 직접 import scan 0건.
- target web/mobile/packages 오렌지/앰버/black utility 및 `role="dialog"`/`aria-modal` 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon secure storage/tab icon 경계 추가

- `@yeon/ui`에 `YeonSecureStorage` runtime wrapper를 추가해 web에서는 no-op, native에서는 `expo-secure-store`를 단일 경계로 노출했다.
- mobile card-service/chat-service/primary-auth storage의 직접 `expo-secure-store` import와 platform 검사 분기를 `getYeonSecureStorage()` 경유로 교체했다.
- mobile card-service 게스트 저장소의 `crypto.randomUUID`/`Date.now`/`Math.random` 직접 호출을 Yeon runtime(`createYeonRandomUUID`, `getYeonNow`, `getYeonRandom`) 경유로 교체했다.
- mobile tab layout의 직접 `@expo/vector-icons` import를 제거하고 `YeonIcon` 기반 tabBarIcon으로 교체했다.
- `packages/ui/package.json`에 `expo-secure-store` 의존성을 명시하고 `pnpm install --ignore-scripts`로 lock importer를 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon secure storage/tab icon 검증

- `pnpm install --ignore-scripts` 완료(신규 다운로드 없음, 기존 peer warning만 출력).
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- target mobile `expo-secure-store`, `@expo/vector-icons` 직접 import scan: target에는 잔여 없음. `expo-secure-store`는 `packages/ui/src/runtime/YeonSecureStorage/index.native.ts` 경계 내부에만 존재.
- mobile storage/tab direct runtime scan: target에는 `SecureStore`, `Date.now`, `Math.random`, `crypto`, `@expo/vector-icons`, `expo-secure-store` 직접 사용 잔여 없음.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon page metadata 경계 추가

- web Yeon UI wrapper에 `YeonPageMetadata` type wrapper를 추가해 Next app route의 `Metadata` type-only 직접 import를 Yeon 경계로 이관했다.
- card-service/typing-service/community app route의 `metadata`와 `generateMetadata` 반환 타입을 `YeonPageMetadata`로 통일했다.
- `next`/`next/*` 직접 import는 `apps/web/src/components/yeon-ui/**` 경계 내부에만 남도록 정리했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon page metadata 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target web/mobile `next`, `next/*`, `framer-motion`, `lucide-react`, `@radix-ui`, `react-native`, `@tanstack/react-query`, `expo-router`, `expo-secure-store`, `@expo/vector-icons` 직접 import scan 0건.
- `next`/`next/*` import는 `apps/web/src/components/yeon-ui/**` wrapper 경계에서만 확인.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon image conversion 경계 추가

- `@yeon/ui`에 `YeonImageConversion` runtime wrapper를 추가해 HEIC/HEIF → JPEG 변환을 `convertYeonHeicImageBlobToJpegBlob` 경유로 노출했다.
- card-service 카드 에디터 이미지 업로드 유틸의 직접 `import("heic2any")` 호출을 Yeon image conversion wrapper 호출로 교체했다.
- `packages/ui/package.json`에 `heic2any` 의존성을 명시했다. 단, frozen 범위로 추정되는 기존 `features/cloud-import`가 아직 직접 `heic2any`를 사용하므로 `apps/web` 의존성은 유지했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon image conversion 검증

- `pnpm install --ignore-scripts` 완료(신규 다운로드 없음, 기존 peer warning만 출력).
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- target card/typing/community/mobile 직접 `heic2any`/framework-runtime import scan 0건.
- `heic2any` 직접 사용은 `packages/ui/src/runtime/YeonImageConversion/index.ts` 경계 내부와 frozen 범위 추정 `features/cloud-import` 기존 코드에만 남아 있음.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 모바일 공통 provider Query/runtime 경계 정리

- mobile `AppProviders`의 직접 `@tanstack/react-query` import를 `@yeon/ui/native`의 `YeonQueryClient`, `YeonQueryClientProvider`로 교체했다.
- mobile `ChatServiceSessionProvider`의 직접 `useQueryClient` import를 `useYeonQueryClient` alias로 교체했다.
- mobile chat-service 게스트 세션 생성의 직접 `Date.now`/`Math.random` 호출을 Yeon runtime(`getYeonNow`, `getYeonRandom`) 경유로 교체했다.
- `life-os`는 현재 유지보수 대상(card/typing/community) 밖이라 직접 TanStack import를 변경하지 않았다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 모바일 공통 provider 검증

- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- mobile provider + target card/chat/app/components/services 직접 `@tanstack/react-query`, `Date.now`, `Math.random` scan 0건.
- mobile 전체 잔여 `@tanstack/react-query` 직접 import는 유지보수 범위 밖 `apps/mobile/src/features/life-os/life-os-screen.tsx` 1건만 확인.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 디자인 토큰 hex 재스캔

- target web/mobile/packages의 hex 색상 사용을 재수집했다.
- target feature/app 코드에는 카드/타이핑/커뮤니티 허용값(`#111`, `#666`, `#aaa`, `#e5e5e5`, `#fafafa`, `#ffffff`)만 확인됐다.
- mobile 전용 accent/error/border 및 auth dark token은 `packages/design-tokens/src/colors.ts`의 토큰 정의 내부에만 확인됐다.
- 오렌지/앰버/black utility 금지 스캔과 frozen diff scan 모두 0건을 유지했다.

## 2026-06-02 Yeon SafeAreaProvider 경계 추가

- `@yeon/ui`의 `YeonSafeAreaView` primitive에 `YeonSafeAreaProvider` wrapper를 추가하고 web/native export를 연결했다.
- mobile `AppProviders`의 직접 `react-native-safe-area-context` import를 `@yeon/ui/native`의 `YeonSafeAreaProvider` alias로 교체했다.
- web raw tag scan에서 `<img` 정규식 문자열 1건은 실제 JSX 태그가 아닌 validator 패턴이라 false positive로 분류했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon SafeAreaProvider 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- mobile app/providers/card/chat/components/services raw RN import/usages scan 0건.
- mobile target 직접 `@tanstack/react-query`, `react-native`, `react-native-safe-area-context`, `expo-router`, `expo-secure-store`, `@expo/vector-icons`, `Date.now`, `Math.random` scan 0건.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 Yeon StatusBar 경계 추가

- `@yeon/ui`에 `YeonStatusBar` primitive를 추가했다. web은 no-op, native는 `expo-status-bar`를 wrapper 내부에서만 사용한다.
- mobile `AppProviders`의 직접 `expo-status-bar` import를 `@yeon/ui/native`의 `YeonStatusBar` alias로 교체했다.
- `packages/ui/package.json`에 `expo-status-bar` 의존성을 명시하고 `pnpm install --ignore-scripts`로 lock importer를 갱신했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 Yeon StatusBar 검증

- `pnpm install --ignore-scripts` 완료(기존 peer warning만 출력).
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- mobile app/providers/card/chat/components/services 직접 `expo-status-bar`, `expo-*`, `@expo/*`, `react-native`, `react-native-safe-area-context`, `@tanstack/react-query`, `expo-router`, `expo-secure-store`, `@expo/vector-icons`, `Date.now`, `Math.random` scan 0건.
- `expo-status-bar` 직접 import는 `packages/ui/src/primitives/YeonStatusBar/index.native.tsx` 경계 내부에서만 확인.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 typing admin Metadata 경계 추가

- 유지보수 범위 broad scan에 `apps/web/src/app/admin/typing-characters`, `apps/web/src/app/admin/typing-decks`를 포함했다.
- typing admin page 2곳의 직접 `import type { Metadata } from "next"`를 `YeonPageMetadata`로 교체했다.
- broad raw JSX/framework import scan 결과 실제 잔여는 `add-card-form.tsx`의 `<img` 정규식 문자열 1건(false positive)뿐이다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 typing admin Metadata 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- broad web scan(`card/typing/community + typing admin + product shell`)에서 raw JSX/framework import 실제 잔여 없음. `<img` 정규식 문자열 1건은 false positive.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 broad runtime 경계 정리

- broad runtime scan 범위를 `card/typing/community + typing admin + product shell + mobile card/chat/providers/app/components/services`로 확장했다.
- `ProductHeader`의 직접 `fetch` 호출을 `fetchYeon`으로 교체했다.
- mobile root layout의 직접 `setTimeout`/`clearTimeout` 호출을 `scheduleYeonTimeout`/`clearYeonTimeout`으로 교체했다.
- mobile card-service storage fallback 변수명을 `localStorage`에서 `browserStorage`로 정리해 직접 storage 의존 false positive를 제거했다.
- 잔여 `document.descendants`는 DOM document가 아니라 ProseMirror node field name이므로 false positive로 분류했다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 broad runtime 경계 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `git diff --check` 통과
- broad runtime scan 실제 잔여 없음. `document.descendants` 1건은 ProseMirror node field false positive.
- broad UI/framework 직접 import scan 0건.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 모바일 색상 SSOT design-tokens 연결

- `apps/mobile/src/theme/colors.ts`의 raw hex 색상 원천을 `@yeon/design-tokens`의 `yeonColors` 참조로 교체했다.
- mobile web preview 색상도 `yeonColors.neutral[50]`, `yeonColors.white`, `yeonColors.neutral[100]` 기반으로 교체하고 테스트 기대값도 토큰 참조로 바꿨다.
- card-service deck detail backdrop의 raw rgba를 `colors.backdrop` 경유로 교체했다.
- `packages/design-tokens/src/colors.ts`에 overlay token `neutralBackdrop`을 추가해 앱 feature 코드가 overlay 값을 직접 정의하지 않게 했다.
- 유지보수 범위 밖 `life-os`는 직접 수정하지 않았다.
- 상담 워크스페이스 관련 경로 변경 없음 확인.

## 2026-06-02 모바일 색상 SSOT 검증

- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts` 통과(1 file, 3 tests)
- `git diff --check` 통과
- mobile maintained scope raw color scan: app/theme/preview/card/chat/provider/component/service 코드에는 raw 색상 잔여 없음. raw 색상은 `packages/design-tokens`와 Yeon primitive variant 정의 내부에서만 확인.
- target web/mobile/packages 오렌지/앰버/black utility 금지 스캔 0건.
- 상담 워크스페이스 변경 점검: `git diff --name-only | rg "counsel|instructor|student-management"` 결과 없음.

## 2026-06-02 — 웹 maintained scope DOM/event/fetch type alias 정리

### 작업내용

- 유지보수 대상 웹 범위(`card-service`, `typing-service`, `community`, 공통 product shell, typing admin)의 직접 DOM/React event/element 타입 사용을 스캔했다.
- `RequestInit`, 문서 이벤트 `PointerEvent`/`KeyboardEvent`, `HTMLElement`/`Node` 잔여를 Yeon UI alias로 이동했다.
- `@yeon/ui`에 `YeonRequestInit`, `YeonDocumentPointerEvent`, `YeonDocumentKeyboardEvent` 타입 경계를 추가했다.
- `packages/ui/src/types/index.ts`의 React event 타입 import를 `React*` alias로 바꿔 DOM `KeyboardEvent`와 이름 충돌이 나지 않게 정리했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- maintained web scope 직접 DOM/React event/element/fetch type 스캔: `total=0`
- maintained web scope 금지 색상(`orange-*`, `amber-*`, 대표 orange hex) 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 웹 shadow/overlay style token 경계 정리

### 작업내용

- maintained web/mobile 범위의 raw `rgba(...)`/비정규 hex 잔여를 스캔했다.
- `apps/web/src/components/yeon-ui/yeon-style-tokens.ts`를 추가해 웹 overlay/shadow/CSS 색상 값을 Yeon UI 경계로 모았다.
- 카드/타자/커뮤니티 유지보수 범위에서 직접 쓰던 modal/popover/card/action shadow와 CSS rgba 값을 `YEON_WEB_*` 토큰 상수로 교체했다.
- `rgba(0,0,0,...)` 계열 shadow는 neutral black(`#111`) 기반 토큰으로 통일했다.

### 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- maintained web scope 금지 색상(`orange-*`, `amber-*`, 대표 orange hex) 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — rich DOM style helper 및 inline style 축소

### 작업내용

- `@yeon/ui` rich DOM 경계에 `setYeonElementStyleProperty`, `removeYeonElementStyleProperty`를 추가했다.
- 카드 마크다운 렌더러와 리치 에디터 이미지 노드뷰의 직접 `element.style.*` 조작을 Yeon helper로 이동했다.
- 타자 캐릭터 프레임 관리자에서 커서/outline/opacity/badge 배경을 inline style 대신 Tailwind 정규 색상/class 조합으로 정리했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `git diff --check` 통과
- maintained web scope inline style/direct DOM style 스캔: 14건 → 11건(남은 항목은 sprite 배경/테이블 오버레이 위치/카드 flip/progress width처럼 런타임 좌표·크기 계산 필수 항목)
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- maintained web scope 금지 색상 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 런타임 생성 API(FormData/URL) Yeon wrapper 이동

### 작업내용

- maintained scope의 Next/외부 UI/runtime 직접 import를 재스캔했고 0건임을 확인했다.
- 브라우저/런타임 생성 API 직접 사용을 재스캔해 `new FormData`, 모바일 `new URL` 잔여를 확인했다.
- `@yeon/ui` runtime에 `YeonFormData`와 `createYeonFormData()`를 추가했다.
- 카드 이미지 업로드의 `new FormData()`를 `createYeonFormData()`로 이동했다.
- 모바일 API base URL 검증의 `new URL()`을 `createYeonUrl()`로 이동했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
- maintained web/mobile scope 직접 생성/런타임 API(`new URL`, `new FormData`, `fetch`, timer, random 등) 스캔: `total=0`
- maintained web scope 금지 색상 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — NativeWind/RNW 배선과 RSC 안전 subpath export 정리

### 작업내용

- `apps/mobile`에 NativeWind v4 기반 `babel.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`를 추가하고 Expo root layout에서 CSS를 로드했다.
- `apps/mobile/metro.config.js`를 `withNativeWind`로 감싸 기존 monorepo watch/root 설정과 NativeWind 입력 CSS를 함께 유지했다.
- `apps/web`은 RNW alias를 유지하면서 `nativewind`/`react-native-css-interop` transpile 및 Tailwind content/preset 배선을 추가했다.
- `@yeon/design-tokens/tailwind-preset`을 추가해 web/mobile Tailwind·NativeWind 설정이 동일한 토큰 preset을 확장하도록 했다.
- `@yeon/ui`에 primitive/runtime/rich-content subpath export를 추가하고 web `yeon-ui` wrapper가 full barrel 대신 직접 subpath를 참조하게 정리했다.
- Next RSC 빌드에서 server route가 client hook barrel을 따라가는 문제를 subpath export로 해소했다.
- web `yeon-query` wrapper는 QueryProvider와 같은 React Query 컨텍스트를 쓰도록 앱 경계에서 직접 re-export하게 정리했다.

### 검증

- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile exec tailwindcss -i ./global.css -c ./tailwind.config.js -o /tmp/yeon-mobile-nativewind.css --minify` 통과
- `pnpm --filter @yeon/web exec tailwindcss -i ./src/app/globals.css -c ./tailwind.config.ts -o /tmp/yeon-web-tailwind.css --minify` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- maintained web/mobile scope 직접 생성/런타임 API 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- maintained web scope 금지 색상 스캔: `total=0`
- web `yeon-ui` wrapper의 `@yeon/ui/web`/top-level `@yeon/ui` 직접 참조 스캔: 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — maintained web inline style 잔여 0건 정리

### 작업내용

- `packages/ui`에 런타임 동적 시각 요소를 위한 universal primitive를 추가했다.
  - `YeonProgressBar`: 진행률 width 계산을 UI 패키지 내부로 이동.
  - `YeonSpriteFrame`: 타자 캐릭터 sprite sheet background 계산을 UI 패키지 내부로 이동.
  - `YeonPositionedButton`: 리치 에디터 table overlay action button 위치 계산을 UI 패키지 내부로 이동.
- 카드 학습 flip 카드의 3D flip/perspective 표현은 inline style 대신 Tailwind arbitrary property class로 정리했다.
- 카드 마크다운 table cell의 고정 min-width/height를 inline style 대신 정규 class 경계로 이동했다.
- 타자 멀티플레이 진행률, 캐릭터 sprite, 관리자 sprite thumbnail, 카드 리치 에디터 overlay button에서 app-level inline style을 제거했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- maintained web scope inline/direct style 스캔: `total=0`
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- maintained web scope 금지 색상 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 공용 UI 패턴을 packages/ui로 승격

### 작업내용

- 모바일 로컬 `components/ui`에 있던 반복 패턴 구현을 `packages/ui/src/patterns`로 승격했다.
  - `YeonActionButton`
  - `YeonAvatarCircle`
  - `YeonSectionCard`
  - `YeonStateBlock`
  - `YeonTextField`
  - `YeonTopBar`
- `@yeon/ui` package export에 `./patterns/*` subpath와 native/web barrel export를 추가했다.
- 모바일 feature 화면은 로컬 UI 파일 대신 `@yeon/ui/native`의 Yeon 패턴 컴포넌트를 직접 import하도록 바꿨다.
- 기존 `apps/mobile/src/components/ui/*` 파일은 구현체가 아니라 `@yeon/ui/native` 호환 re-export만 남겼다.
- 모바일 앱 색/그림자 토큰을 `packages/ui/src/theme`의 `yeonMobileAppColors`, `yeonMobileAppShadow`로 이동하고 `apps/mobile/src/theme/colors.ts`는 해당 토큰을 re-export하도록 정리했다.
- 모바일 UI 접근성 계약 테스트가 실제 구현 위치인 `packages/ui/src/patterns/*/index.native.tsx`를 검증하도록 바꿨다.
- Next/link/image/navigation 계열은 `apps/web/src/components/yeon-ui` host boundary에 남겨 RSC 및 Next 의존성이 `packages/ui` native 소비자에 새로 전파되지 않게 유지했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm exec vitest run apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (2 tests)
- `git diff --check` 통과
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile scope 금지 orange/amber 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- maintained web scope inline/direct style 스캔: `total=0`
- `packages/ui`/`packages/design-tokens` 금지 orange/amber 색상 스캔: `total=0`
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 셸 프리뷰와 아이콘 색상 경계를 packages/ui로 이동

### 작업내용

- `YeonIcon`에 `color` prop을 추가해 모바일 탭 아이콘 색상 주입을 app-level inline style에서 제거했다.
- `YeonMobileWebFrame` 패턴을 `packages/ui/src/patterns`에 추가해 Expo web 프리뷰 프레임의 viewport 계산/프레임 스타일을 UI 패키지로 이동했다.
- 모바일 웹 프리뷰 SSOT를 `packages/ui/src/theme`의 `yeonMobileWebPreview`로 이동했다.
- `apps/mobile/app/_layout.tsx`는 직접 프레임 계산/스타일을 들고 있지 않고 `YeonMobileWebFrame`만 사용하도록 정리했다.
- `apps/mobile/src/lib/mobile-preview.ts`는 기존 public constant 호환을 유지하되 `@yeon/ui/theme`의 `yeonMobileWebPreview`를 re-export하도록 바꿨다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI scope 금지 orange/amber 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 런치/404 셸을 packages/ui 패턴으로 승격

### 작업내용

- `packages/ui/src/patterns`에 모바일 셸 패턴을 추가했다.
  - `YeonLaunchScreen`: 앱 런치/스플래시 이미지 셸
  - `YeonRouteFallbackScreen`: 라우트 fallback/404 셸
- `apps/mobile/src/components/branding/app-launch-screen.tsx`는 asset 연결만 담당하고 화면 셸은 `YeonLaunchScreen`을 사용하도록 정리했다.
- `apps/mobile/app/+not-found.tsx`는 직접 `YeonView`/`YeonText`/link 스타일을 만들지 않고 `YeonRouteFallbackScreen`만 사용하도록 정리했다.
- 더 이상 참조되지 않는 모바일 로컬 UI re-export 파일 6개를 제거했다.
  - `action-button.tsx`
  - `avatar-circle.tsx`
  - `section-card.tsx`
  - `state-block.tsx`
  - `text-field.tsx`
  - `top-bar.tsx`
- `apps/mobile/src/components/ui`에는 실제 구현 파일 없이 UI 접근성 계약 테스트만 남겼다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm exec vitest run apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (2 tests)
- `git diff --check` 통과
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI scope 금지 orange/amber 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 반복 화면/폼 패턴을 packages/ui로 추가 이관

### 작업내용

- `packages/ui/src/patterns`에 모바일 반복 패턴을 추가했다.
  - `YeonMobileScreen`: 카드/채팅/중앙정렬 화면 content variant와 keyboard avoiding을 공통화
  - `YeonFormBlock`: 모바일 폼 블록 표면/보더/패딩 공통화
  - `YeonFormStack`: compact/default/roomy 간격 스택 공통화
  - `YeonSectionTitle`: 섹션 제목 타이포/하단 간격 공통화
  - `YeonDescriptionText`: 보조 설명 텍스트 색/행간 공통화
- 모바일 채팅 서비스 주요 화면의 반복 `screen`/`content` 스타일을 `YeonMobileScreen`으로 교체했다.
  - `auth-screen`, `feed-screen`, `ask-screen`, `chat-list-screen`, `friends-screen`, `profile-screen`, `profile-detail-screen`
- 모바일 프로필/친구/인증 화면의 반복 폼/섹션/설명 텍스트 스타일을 `YeonFormBlock`, `YeonFormStack`, `YeonSectionTitle`, `YeonDescriptionText`로 교체했다.
- 모바일 카드 덱 목록 화면의 외부 스크롤 레이아웃을 `YeonMobileScreen contentVariant="card"`로 교체했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI scope 금지 orange/amber 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- chat-service 화면 반복 `screen`/`content` 스타일 잔여 스캔: 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 카드 상세/플레이 헤더·세그먼트·FAB·화면 셸 패턴 이관

### 작업내용

- `packages/ui/src/patterns`에 카드 모바일 화면에서 반복되던 패턴을 추가했다.
  - `YeonMobileHeaderBar`: 뒤로가기/우측 액션/제목/보조 문구 헤더 공통화
  - `YeonSegmentedControl`: 시트 탭/학습 모드 탭 공통화
  - `YeonFloatingActionButton`: 카드 추가 FAB 공통화
- `YeonMobileScreen`을 확장했다.
  - `detail`, `play` content variant 추가
  - `safeAreaEdges`, `floatingSlot`, `scroll` 옵션 추가
  - 고정형 화면과 스크롤형 화면을 같은 셸에서 처리하도록 정리
- 모바일 카드 상세 화면을 새 패턴으로 이관했다.
  - 직접 헤더/카드 추가 FAB/시트 탭 스타일을 제거하고 `MobileHeaderBar`, `FloatingActionButton`, `SegmentedControl`로 교체
  - 부팅/로딩 상태는 `MobileScreen` + `StateBlock`으로 유지
- 모바일 카드 플레이 화면을 새 패턴으로 이관했다.
  - 직접 `SafeAreaView`/`screen`/`content` 래퍼를 제거하고 `MobileScreen contentVariant="play"`로 교체
  - 학습 모드 탭은 `SegmentedControl`로 교체
- 유지보수 제외 영역인 `life-os`는 건드리지 않았다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI scope 금지 orange/amber 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 모바일 반복 `screen`/`content` 스타일 잔여 스캔: `apps/mobile/src/features/life-os/life-os-screen.tsx`만 남음(유지보수 제외 영역이라 미수정)

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 채팅방/카드 목록/바텀시트 패턴 추가 이관

### 작업내용

- `YeonMobileScreen`에 `full` content variant를 추가했다.
  - 스크롤 없는 전체 화면/채팅방처럼 헤더·본문·하단 입력부가 직접 배치되는 화면을 공통 셸로 다룬다.
- 모바일 채팅방 화면을 `MobileScreen contentVariant="full" keyboardAvoiding scroll={false}`로 이관했다.
  - 화면 단위 직접 `YeonKeyboardAvoidingView`, `isYeonIOS`, `screen`/`keyboard` 스타일을 제거했다.
  - 메시지 스크롤 영역은 `flex: 1`로 명시해 헤더/컴포저 사이를 채우게 했다.
- 모바일 카드 목록 화면의 부팅 상태와 폼 블록을 공통 패턴으로 이관했다.
  - 부팅 상태: 직접 `screen`/`center` 래퍼 → `MobileScreen contentVariant="centered"`
  - 로그인/덱 생성 카드: 직접 카드 스타일 → `YeonFormBlock`
- `packages/ui`에 `YeonBottomSheetModal` 패턴을 추가했다.
  - 닫기 백드롭, 키보드 회피, 바텀시트 표면, 핸들을 공통화했다.
- 모바일 카드 상세의 카드 생성/편집 시트를 `YeonBottomSheetModal`로 이관했다.
  - 직접 `YeonModal`, `YeonKeyboardAvoidingView`, `isYeonIOS`, `yeonAbsoluteFillObject`, 모달 전용 로컬 스타일을 제거했다.
- 모바일 UI 색상 명칭에서 오렌지 의미를 줄 수 있는 `warm` 명칭을 제거했다.
  - `yeonMobileAppColors.warm/warmSoft` → `neutral/neutralSoft`
  - `YeonAvatarCircle` tone `warm` → `neutral`
  - maintained mobile 사용처도 `neutral`로 교체했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI scope 금지 orange/amber/warm 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- maintained mobile 직접 `YeonKeyboardAvoidingView`/`isYeonIOS` import 스캔: 0건
- 모바일 반복 `screen`/`content` 스타일 잔여 스캔: `apps/mobile/src/features/life-os/life-os-screen.tsx`만 남음(유지보수 제외 영역이라 미수정)

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 카드 학습/편집 행 패턴 추가 이관

### 작업내용

- `packages/ui/src/patterns`에 카드 학습·편집에서 반복되던 모바일 패턴을 추가했다.
  - `YeonStudyCard`: 플래시카드 학습 카드의 라벨/본문/힌트/탭 액션 표면 공통화
  - `YeonReviewPanel`: 복습 모드의 문제/정답 패널과 난이도 액션 버튼 공통화
  - `YeonEditableCardRow`: 모바일 카드 목록의 번호/질문/답변/메뉴/삭제 스와이프 행 공통화
- `YeonTextField`를 확장했다.
  - `showCounter`와 `multilineMinHeight`를 추가해 카드 질문/답변/일괄 붙여넣기 입력을 앱 로컬 textarea 스타일 없이 표현하게 했다.
- 모바일 카드 학습 화면을 새 패턴으로 이관했다.
  - 직접 `ReviewModeCard`, `ReviewButton`, 플래시카드 표면 스타일을 제거하고 `StudyCard`/`ReviewPanel`을 사용했다.
- 모바일 카드 상세 화면을 새 패턴으로 이관했다.
  - 직접 `LabeledTextarea`, `CompactCardRow`, 삭제 스와이프/행 메뉴 로컬 스타일을 제거하고 `TextField`/`EditableCardRow`를 사용했다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 건드리지 않았다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- maintained web/mobile/packages UI/design-token scope 금지 orange/amber/warm 색상 스캔: `total=0`
- maintained web/mobile scope raw `rgba(...)` 및 비정규 hex 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 모바일 반복 `screen`/`content` 스타일 잔여 스캔: `apps/mobile/src/features/life-os/life-os-screen.tsx`만 남음(유지보수 제외 영역이라 미수정)

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 채팅/친구 프로필 행 패턴 이관

### 작업내용

- `packages/ui/src/patterns`에 채팅 서비스 모바일 리스트에서 반복되던 패턴을 추가했다.
  - `YeonPillBadge`: 시간/상태/미읽음/작은 액션 칩을 공통화
  - `YeonProfileListRow`: 아바타, 닉네임, 메타, 미리보기, 오른쪽 배지/액션 슬롯을 가진 프로필 행 공통화
- 모바일 채팅 목록 화면을 새 패턴으로 이관했다.
  - 직접 `roomRow`, `peerRow`, `badges`, payment/unread badge 스타일을 제거하고 `ProfileListRow`/`PillBadge`를 사용했다.
- 모바일 친구 화면을 새 패턴으로 이관했다.
  - 직접 `FriendRow`/`SuggestedRow` 내부 행 스타일, 닉네임/메타/프리뷰/inline action 스타일을 제거하고 `ProfileListRow`/`PillBadge`를 사용했다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 건드리지 않았다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건
- maintained web/mobile/packages UI/design-token scope 금지 orange/amber/warm 색상 스캔: `total=0`
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 모바일 채팅 목록/친구 화면의 `createYeonStyleSheet` 잔여: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 chat-service 화면 로컬 스타일 제거 이관

### 작업내용

- `packages/ui/src/patterns`에 chat-service 모바일 화면에서 반복되던 패턴을 추가했다.
  - `YeonProfileHero`, `YeonSwitchSettingRow`, `YeonInfoListItem`: 프로필/설정/목록 정보 행 공통화
  - `YeonFormIntro`, `YeonPostAuthorHeader`, `YeonPostText`, `YeonPostFooter`, `YeonReplyListItem`, `YeonPollOption`: 피드/에스크 게시글 구조 공통화
  - `YeonAuthHeader`, `YeonCenteredFormShell`: 인증 화면의 중앙 폼 쉘과 타이틀 공통화
  - `YeonChatRoomHeader`, `YeonChatRoomInset`, `YeonChatMessageScroll`, `YeonChatMessageBubble`, `YeonChatComposer`: 대화방 헤더/상태/스크롤/말풍선/입력 영역 공통화
- 모바일 chat-service 화면을 새 패턴으로 이관했다.
  - `ask-screen`, `feed-screen`, `profile-screen`, `profile-detail-screen`, `auth-screen`, `chat-room-screen`에서 직접 `createYeonStyleSheet`/`styles.*`/`colors` 의존을 제거했다.
  - `chat-list-screen`, `friends-screen`까지 포함해 chat-service 유지보수 화면의 직접 로컬 스타일 잔여를 0건으로 만들었다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 건드리지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고와 Node localStorage experimental warning만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- chat-service 모바일 화면 `createYeonStyleSheet`/`styles.*` 잔여 스캔: 0건
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건
- maintained web/mobile/packages UI/design-token scope 금지 orange/amber/warm 색상 스캔: `total=0`
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 — 모바일 card-service 로컬 스타일 제거 이관

### 작업내용

- `packages/ui/src/patterns`에 card-service 모바일 화면에서 반복되던 패턴을 추가했다.
  - `YeonDeckListItem`: 덱 목록 카드 행 공통화
  - `YeonSectionSummaryHeader`: 카드 목록 섹션 제목/메타 행 공통화
  - `YeonBottomSheetForm`: 하단 시트 입력 폼 스크롤/간격 공통화
  - `YeonCardNavigationControls`: 학습 화면 이전/다음 버튼 행 공통화
- `YeonFormStack`에 `fill` 옵션을 추가해 학습 화면처럼 남은 높이를 채워야 하는 레이아웃도 앱 로컬 스타일 없이 표현하게 했다.
- 모바일 card-service 3개 화면을 새 패턴으로 이관했다.
  - `card-deck-list-screen`, `card-deck-detail-screen`, `card-deck-play-screen`에서 직접 `createYeonStyleSheet`/`styles.*`/`colors` 의존을 제거했다.
  - 덱 목록, 상세 카드 리스트, 하단 카드 추가 시트, 학습 이전/다음 컨트롤을 `@yeon/ui/native` 패턴으로 구성했다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 건드리지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 참고: 기존 `apps/web/postcss.config.js` package type 경고와 Node localStorage experimental warning만 출력됨
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과 (5 tests)
- `git diff --check` 통과
- 유지보수 모바일 범위(`apps/mobile/app`, `card-service`, `chat-service`, `components`) `createYeonStyleSheet`/`styles.*` 잔여 스캔: `total=0`
- maintained web/mobile/packages UI/design-token scope 금지 orange/amber/warm 색상 스캔: `total=0`
- maintained web/mobile scope 직접 외부 UI/runtime import 스캔: `total=0`
- mobile app/features/components 직접 inline style object 스캔(`style={{`): 0건
- 상담/강사/학생관리 동결 범위 diff 스캔: 0건

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 웹 package UI import 경계 정리

- `@yeon/ui`에 web 공용 프리미티브/토큰 export를 보강했다.
  - `YeonGlobalStyle`
  - `YeonContextMenu`
  - `YeonStructuredData`
  - `YEON_WEB_CSS_VALUE`, `YEON_WEB_OVERLAY_CLASS`, `YEON_WEB_SHADOW_CLASS`
  - web alias 상수: `YEON_BUTTON_*`, `YEON_SURFACE_VARIANTS`, `YEON_BADGE_VARIANTS`, `YEON_TEXT_*`
- 유지보수 웹 범위(`card-service`, `typing-service`, `community`, `room-shared`, 해당 app routes)의 로컬 `apps/web/src/components/yeon-ui` import를 package import로 이관했다.
  - 전체 로컬 Yeon UI import 라인: 210개 → 63개.
  - 남은 로컬 경계는 Next 전용 라우팅/메타데이터/Link, Colyseus 실시간 클라이언트, 기존 markdown editor, 웹 TanStack Query wrapper로 한정했다.
- 서버 컴포넌트가 mixed client barrel을 import하지 않도록 app route/서버 유틸의 `@yeon/ui` root import를 primitive/runtime subpath로 좁혔다.
- `YeonImage`를 package 일반 이미지로 소비하는 카드 row에서 Next 전용 `unoptimized` prop을 제거했다.
- `@yeon/ui`의 `@tanstack/react-query` 의존은 package dependency에서 peer/dev dependency로 이동했다. 웹 Query는 기존 앱 로컬 wrapper를 유지해 기존 auth/비유지보수 영역과 context 충돌을 피했다.
- 상담 워크스페이스/강사/학생관리 경로 변경 없음 확인.

## 2026-06-02 웹 package UI import 경계 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과: 2 files / 5 tests
- `git diff --check` 통과
- 유지보수 웹 서버 파일의 `@yeon/ui` root import 스캔: `server_root_total=0`
- 유지보수 web/mobile/packages UI/design-token 금지색 스캔: `orange|amber|#e8630a|#e87310|warm|yellow-*` 잔여 0
- 유지보수 mobile 범위 raw local style 스캔: `createYeonStyleSheet|styles.|style={{` 잔여 0
- 유지보수 web/mobile 범위 직접 외부 런타임 import 스캔: `next/navigation|next/link|next/image|next/dynamic|@tanstack/react-query|zustand|@colyseus/sdk` 잔여 0
- 동결 범위 diff 스캔: `counsel|instructor|student-management` 변경 파일 없음

## 2026-06-02 Next/runtime subpath 및 실시간/마크다운 경계 이관

### 작업내용

- `@yeon/ui`에 Next/Web 전용 runtime·primitive subpath를 추가했다.
  - `@yeon/ui/primitives/YeonLink`: web은 `next/link`, native는 `expo-router` Link로 분기
  - `@yeon/ui/runtime/YeonNavigation`: web은 `next/navigation` hook wrapper, native는 `expo-router` hook wrapper
  - `@yeon/ui/runtime/YeonRouteControl`: web은 `notFound`, native는 한국어 not-found 오류
  - `@yeon/ui/runtime/YeonPageMetadata`: web은 `next` Metadata type, native는 중립 record type
- 유지보수 웹 route/feature의 Link/navigation/metadata/notFound import를 package subpath로 이관했다.
- `@yeon/ui`에 실시간/마크다운 전용 subpath를 추가했다.
  - `@yeon/ui/runtime/YeonRealtimeClient`: Colyseus client 생성과 seat reservation 호환 패치
  - `@yeon/ui/rich-content/YeonMarkdownEditor`: 기존 `@uiw/react-md-editor` dynamic editor 경계
- 유지보수 웹 범위의 Realtime/MarkdownEditor local wrapper import 4곳을 package subpath로 이관했다.
- `@colyseus/sdk`, `@uiw/react-md-editor`는 `@yeon/ui` optional peer/dev dependency로 등록했다.
- Query runtime 이관은 시도 후 보류했다.
  - `@yeon/ui/runtime/YeonQuery`로 maintained web hook 16곳을 이관하면 Turbopack build 중 `/community` prerender에서 `No QueryClient set`이 재현됐다.
  - 원인은 workspace symlink package와 앱 `QueryProvider` 사이 React Query context가 분리될 수 있는 경계다.
  - 따라서 Query는 UI 컴포넌트가 아니라 앱 런타임 Provider SSOT에 종속되는 경계로 보고, 웹 maintained scope에서는 기존 `apps/web/src/components/yeon-ui/yeon-query` wrapper를 유지했다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 건드리지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과: 2 files / 5 tests
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- maintained web local Yeon UI import 스캔: Query wrapper 16곳만 잔여
- maintained web 서버 파일의 `@yeon/ui` root import 스캔: `server_root_total=0`
- maintained web/mobile/packages UI/design-token 금지색 스캔: `orange|amber|#e8630a|#e87310|warm|yellow-*` 잔여 0
- maintained mobile 범위 raw local style 스캔: `createYeonStyleSheet|styles.|style={{` 잔여 0
- maintained web/mobile 범위 직접 외부 런타임 import 스캔: `next/navigation|next/link|next/image|next/dynamic|@tanstack/react-query|zustand|@colyseus/sdk` 잔여 0
- 동결 범위 diff 스캔: `counsel|instructor|student-management` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 web shared style token package 승격

### 작업내용

- `apps/web/src/features/shared-style-constants.ts`에 있던 `SHARED_FEATURE_CLASS` 값을 `@yeon/ui` package의 `YEON_WEB_SHARED_CLASS`로 승격했다.
  - 위치: `packages/ui/src/theme/web-style-tokens/index.ts`
  - 앱 로컬 파일은 비마이그레이션 코드 호환을 위해 package re-export shim으로 축소했다.
- 상담/강사/학생관리 경로는 제외하고, card-service/typing-service/community/room-shared 및 관련 유지보수 route의 `@/features/shared-style-constants` import를 `@yeon/ui/theme/web-style-tokens` subpath로 이관했다.
- 같은 상수를 쓰던 auth/profile/landing/room-voice-call의 비상담 경로도 package subpath를 보게 하여 style token SSOT를 package로 모았다.
- Query runtime package 이관을 다시 검증했다.
  - Maintained hook 16곳과 `QueryProvider`를 모두 `@yeon/ui/runtime/YeonQuery`로 맞추면 `/auth/reset-request` prerender에서 `No QueryClient set`이 재현됐다.
  - `QueryProvider`는 counseling shell 포함 여러 앱 런타임이 공유하는 전역 provider라, counseling을 건드리지 않고 package Query로 강제 이동하면 context 분리 회귀가 난다.
  - 따라서 Query 16곳은 앱 QueryProvider SSOT에 종속되는 경계로 보고 기존 `apps/web/src/components/yeon-ui/yeon-query` wrapper를 유지했다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 변경하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과: 2 files / 5 tests
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- maintained scope local shared-style import 스캔: 0건
- maintained web local Yeon UI import 스캔: Query wrapper 16곳만 잔여
- maintained web/mobile/packages UI/design-token 금지색 스캔: `orange|amber|#e8630a|#e87310|warm|yellow-*` 잔여 0
- maintained mobile 범위 raw local style 스캔: `createYeonStyleSheet|styles.|style={{` 잔여 0
- maintained web/mobile 범위 직접 외부 런타임 import 스캔: `next/navigation|next/link|next/image|next/dynamic|@tanstack/react-query|zustand|@colyseus/sdk` 잔여 0
- 동결 범위 diff 스캔: `counsel|instructor|student-management` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 product-shell local Yeon UI wrapper 제거

### 작업내용

- `components/product-shell`의 로컬 `@/components/yeon-ui` 의존을 `@yeon/ui` package 의존으로 이관했다.
  - `product-header.tsx`: 버튼/아이콘/링크/텍스트/뷰, 문서 이벤트 hook, `fetchYeon`, DOM 이벤트 타입을 package에서 직접 사용.
  - `service-help-dialog.tsx`: 도움말 모달 primitive/hook/style token을 package에서 직접 사용.
- admin 타자 페이지의 로컬 Yeon UI import를 제거했다.
  - Server Component build 경계를 깨지 않도록 `@yeon/ui` root 대신 `@yeon/ui/primitives/*`, `@yeon/ui/runtime/YeonPageMetadata` subpath로 분리했다.
- 더 이상 참조되지 않는 `apps/web/src/components/yeon-ui` 로컬 wrapper 파일을 제거하고, 앱 QueryProvider SSOT 때문에 필요한 `yeon-query.ts`만 남겼다.
- 주황/앰버/웜 계열 색상은 추가하지 않았고, 상담/강사/학생관리 동결 범위는 변경하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- web local Yeon UI import 스캔: Query wrapper 16곳만 잔여
- `apps/web/src/components/yeon-ui` 파일 스캔: `yeon-query.ts`만 잔여
- 유지보수 web 금지색 스캔: 0건
- 동결 범위 diff 스캔: `counsel|instructor|student-management` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 auth-credentials universal UI 경계 이관

### 작업내용

- `@yeon/ui/theme/web-style-tokens`에 인증 서비스용 `YEON_WEB_AUTH_CLASS`를 추가했다.
  - 인증 배경/표면/텍스트/CTA를 `docs/agent-rules/design-system.md`의 auth 정규 색상(`#080808`, `#111318`, `#f8f7f3`)으로 모았다.
  - 기존 auth shell/forms에 흩어진 white opacity, inline gradient, raw form/button/input 스타일을 패키지 토큰 경계로 끌어올렸다.
- `apps/web/src/features/auth-credentials`를 Yeon UI primitive/subpath 기반으로 이관했다.
  - `AuthShell`: raw `main/div/section/p/h1` → `YeonView`/`YeonText`.
  - `LoginForm`, `RegisterForm`, `ResetRequestForm`, `ResetPasswordForm`, `ResendVerificationForm`: raw `form/label/input/button/p/div` → `YeonForm`/`YeonLabel`/`YeonField`/`YeonButton`/`YeonText`/`YeonView`.
  - `next/navigation` 직접 사용 → `@yeon/ui/runtime/YeonNavigation`의 `useYeonRouter`.
  - `@tanstack/react-query` 직접 사용 → 앱 QueryProvider SSOT에 맞춘 `apps/web/src/components/yeon-ui/yeon-query` wrapper.
- `apps/web/src/app/auth/*` 페이지의 직접 `next/link` 및 raw HTML 구조를 제거하고 `YeonLink`/`YeonText`/`YeonView` package subpath로 전환했다.
- 상담/강사/학생관리 동결 범위는 변경하지 않았고, 주황/앰버/웜 계열 색상은 추가하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- auth direct/html scan: `next/link|next/navigation|@tanstack/react-query|<form|<label|<input|<button|<main|<section|<div|<p|<h1|<span` 잔여 0건
- 유지보수 web 금지색 스캔: 0건
- 동결 범위 diff 스캔: `counsel|instructor|student-management` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 admin-profile-landing runtime universal UI 이관

### 작업내용

- `@yeon/ui/runtime/YeonRouteControl`에 `redirectYeon`, `permanentRedirectYeon`을 추가하고 native stub을 맞췄다.
  - `app/page.tsx`, `admin/page.tsx`, `landing/page.tsx`, `contest/page.tsx`의 직접 `next/navigation` redirect 호출을 package runtime 경계로 이동했다.
- admin/profile/landing 로그인 모달의 직접 Next/UI 의존을 줄였다.
  - `admin/members`, `admin/star-lobby`, `profile` 페이지를 `YeonPageMetadata`, `YeonView`, `YeonText`, `YeonLink` 기반으로 이관했다.
  - `features/admin/admin-member-list`, `features/admin/star-lobby-discord-ops`의 raw HTML/직접 TanStack Query import와 비정규 회색을 제거했다.
  - `features/landing-home/login-modal`의 `next/link`와 raw button/div/text/select 구조를 package primitive로 바꾸고, 소셜 버튼/Google 아이콘의 노랑·브랜드색 직접 사용을 중립 토큰 톤으로 제거했다.
  - `features/landing-home/landing-home`의 잔여 `#555/#888`를 정규 `#666/#aaa`로 정리했다.
- maintained realtime/analytics 경계를 보강했다.
  - `app/star-lobby/_components/star-lobby-live-panel`의 직접 Colyseus client/TanStack Query import를 `@yeon/ui/runtime/YeonRealtimeClient`와 앱 Query wrapper로 이동했다.
  - `features/room-voice-call`의 직접 TanStack Query/Colyseus type import와 raw UI/비정규 색을 `YeonRealtimeRoom`/Yeon Query wrapper/Yeon primitives/정규 색으로 이관했다.
  - `components/analytics/google-analytics-page-tracker`의 직접 `next/navigation` hook import를 `@yeon/ui/runtime/YeonNavigation`으로 이동했다.
- 상담/강사/학생관리/space/public-check/mockdata/tutorial 동결·상담 인접 범위는 변경하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- 비동결 직접 runtime import 스캔 잔여:
  - `apps/web/src/app/check/[token]/page.tsx`의 `next/navigation`은 public-check/상담 인접 경로라 보류
  - `apps/web/src/features/life-os/life-os.tsx`의 TanStack Query는 유지보수 3종 밖 잔여
- 비동결 금지/비정규 색 스캔 잔여:
  - `globals.css`, `privacy`, `terms`, `og-image`, `life-os.module.css`의 기존 전역/정책/비유지보수 잔여
- 동결 범위 diff 스캔: `counsel|instructor|student-management|space-settings|cloud-import|onedrive-import|public-check|mockdata|tutorial` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 2026-06-02 life-os 및 전역 정책 색상 잔여 정리

### 작업내용

- `features/life-os`를 추가로 universal UI 경계에 맞췄다.
  - 직접 `@tanstack/react-query` import를 앱 QueryProvider SSOT에 맞춘 `apps/web/src/components/yeon-ui/yeon-query` wrapper로 이관했다.
  - 주요 raw `main/section/div/p/h1/span/label/input/button/textarea` 구조를 `YeonView`, `YeonText`, `YeonLabel`, `YeonField`, `YeonButton` 기반으로 바꿨다.
  - `life-os.module.css`의 비정규 회색/웜 계열 보더를 정규 흰 배경 토큰(`#ffffff`, `#111111`, `#666666`, `#aaaaaa`, `#e5e5e5`, `#fafafa`) 중심으로 정리했다.
- 전역/정책/OG 이미지의 비정규 회색 잔여를 정규 톤으로 정리했다.
  - `privacy`, `terms`, `og-image`, `globals.css`에서 `#555/#888/#f5f5f5/#eeeeee/#f0f0f0/#2563eb` 계열 직접값을 정규 중립 톤으로 바꿨다.
  - `.app-theme`의 기존 상담 테마 변수는 동결 범위 영향 가능성이 있어 변경하지 않았다.
- 상담/강사/학생관리/space/public-check/mockdata/tutorial 동결·상담 인접 범위는 변경하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 `localStorage is not available because --localstorage-file was not provided`
- `git diff --check` 통과
- `features/life-os` raw HTML 스캔: `form|label|input|button|main|section|div|p|h1|h2|span|textarea` 잔여 0건
- 비동결 직접 runtime import 스캔 잔여:
  - `apps/web/src/app/check/[token]/page.tsx`의 `next/navigation`만 잔여. public-check/상담 인접 경로라 보류.
- 비동결 금지/비정규 색 전체 스캔 잔여:
  - `apps/web/src/app/globals.css #333` 1건. 기존 `.app-theme --border-light` 값이며 이번 diff에서 추가/수정하지 않음.
- diff 기준 신규 금지/비정규 색 추가 스캔: 0건
- 동결 범위 diff 스캔: `counsel|instructor|student-management|space-settings|cloud-import|onedrive-import|public-check|mockdata|tutorial` 변경 파일 없음

### 상태

- 커밋하지 않음. 사용자 지시대로 워킹 디렉토리에 누적 유지.

## 추가 진행 — Codex 유니버설 UI 마이그레이션 계속

### 작업 내용

- `apps/web/src/app/privacy/page.tsx`, `apps/web/src/app/terms/page.tsx`
  - 법적 고지 화면의 raw section/div/p/ul/li/h 태그를 `@yeon/ui`의 `YeonView`, `YeonText`, `YeonList`, `YeonListItem` 기반으로 교체했다.
  - 기존 본문/날짜/표 색상은 흰 배경 서비스 정규 색상(`#111`, `#666`, `#aaa`, `#e5e5e5`, `#fafafa`) 범위만 유지했다.
- `apps/web/src/features/landing-home/*`
  - 루트 랜딩 카드/푸터/상태 배지/텍스트를 `YeonView`, `YeonText`, `YeonButton`, `YeonBadge`, `YeonLink` 기반으로 교체했다.
  - 기존 다크/보라/파랑/초록 강조를 흰 배경 중립 토큰으로 정리했다.
  - 사용되지 않는 `landing-home.module.css`를 제거하고, `landing-workspace.module.css`는 Spline fallback용 최소 중립 CSS로 정리했다.
- `apps/web/src/features/sprite-editor/sprite-frame-editor.tsx`
  - sprite guide gutter 색상 상수를 정규 중립값(`#111`)로 바꾸고, 파일명/문구에서 특정 magenta 색상 의존을 제거했다.

### 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과(이어진 mobile lint 단계 진입 확인)
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- non-frozen raw 웹 태그 스캔 결과: 특수 렌더러 `apps/web/src/app/_lib/og-image.tsx`, public-check/frozen-adjacent `apps/web/src/app/check/layout.tsx`만 잔류
- 모바일 raw React Native 태그/StyleSheet/Alert 스캔 결과: 잔류 없음
- warm/forbidden color residue 스캔 결과: 유지보수 대상 경로 잔류 없음(`globals.css`의 `.app-theme` 상담 테마 변수는 frozen/SSOT 예외로 제외)
- frozen-adjacent diff filename 스캔 결과: 잔류 없음
- `git diff --check` 통과

### 남은 판단

- `apps/web/src/lib/query-provider.tsx`, `apps/web/src/components/yeon-ui/yeon-query.ts`의 TanStack Query 직접 import는 frozen 상담/인증 공유 의존 때문에 현재 전역 제거 대상에서 제외했다.
- `apps/web/src/app/_lib/og-image.tsx`는 Next `ImageResponse` 특수 렌더러라 일반 UI primitive 강제 전환에서 제외했다.
- `apps/web/src/app/check/layout.tsx`는 public-check/frozen-adjacent 경로라 변경하지 않았다.
- 사용자 지시대로 커밋/푸시/PR/머지는 하지 않았다.

## 2026-06-02 RSC/Turbopack 빌드 안정화 추가 진행

- `privacy`/`terms` 서버 페이지가 root `@yeon/ui` barrel을 통해 client hook export를 끌고 와 RSC 빌드가 실패하던 문제를 primitive subpath import로 수정.
- `QueryProvider`를 `@yeon/ui/runtime/YeonQuery` 단일 provider로 유지하되, `next build --turbopack`에서도 `react`, `react-dom`, `@tanstack/react-query`, `react-native`가 웹 앱 런타임으로 해석되도록 `apps/web/next.config.ts`의 Turbopack alias를 추가.
- 절대경로 alias는 Turbopack이 상대 import로 오해해 실패했고, `@colyseus/sdk` alias는 패키지 export 분석 문제로 실패하여 제외. 필요한 싱글턴 alias만 상대 경로로 유지.
- 상담 워크스페이스 파일은 수정하지 않고, 공용 provider와 빌드 설정 경계에서 해결.

## 2026-06-02 RSC/Turbopack 빌드 안정화 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과. 단, worktree `.git` 파일 구조 때문에 프로젝트 SSOT 세부 검사는 건너뜀.
- residue scan: non-frozen web raw tag 잔여는 `apps/web/src/app/_lib/og-image.tsx`의 Next `ImageResponse` 특수 렌더와 `apps/web/src/app/check/layout.tsx`의 public-check 동결 인접 예외만 남음.
- direct platform/runtime scan: non-frozen 잔여는 `apps/web/src/app/check/[token]/page.tsx`의 public-check 동결 인접 `useSearchParams` 예외만 남음.
- 모바일 raw RN control scan 통과: non-frozen 잔여 없음.
- 오렌지/앰버/비토큰 색상 scan 통과: non-frozen 잔여 없음.
- frozen diff filename scan 통과: 상담/학생관리/스페이스/가져오기/public-check/mockdata/tutorial 경로 변경 없음.
- `git diff --check` 통과.

## 2026-06-02 YeonTable / OG / 브랜드·오디오 프리미티브 추가

- `@yeon/ui`에 `YeonTable` web/native 프리미티브를 추가하고 개인정보 처리방침 표 UI를 공용 테이블 경유로 전환했다.
- `@yeon/ui`에 `YeonOgImageFrame` 패턴을 추가하고 web OG 이미지 생성 화면의 raw `div` 트리를 패턴 경계로 이동했다.
- landing-home의 `framer-motion` 의존과 `lucide-react` 의존을 제거하고 `YeonView`/`YeonText`/`YeonIcon` 기반 정적 UI로 전환했다.
- room voice call 패널의 `lucide-react` 아이콘 의존을 제거하고 `YeonIcon`으로 전환했다.
- 로그인 모달의 카카오/구글 raw SVG를 `YeonBrandIcon` 프리미티브로 이동했다.
- room voice call의 raw `<audio>`를 `YeonAudio` 프리미티브 경유로 이동했다.
- 상담 워크스페이스/학생관리/space/sheet/import/mockdata/tutorial 등 동결 경로 변경 없음 확인.

## 2026-06-02 YeonTable / OG / 브랜드·오디오 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과(작업 worktree는 `.git` 파일 구조라 프로젝트 검사는 건너뜀)
- `/Users/osuma/coding_stuffs/yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- `git diff --check` 통과
- raw DOM 스캔: 동결 경로 제외 앱 영역 일반 태그 잔여는 `apps/web/src/app/check/layout.tsx`의 public-check 인접 `<div>`만 남음.
- raw SVG/audio 스캔: 로그인 모달과 보이스콜 패널 잔여 없음. 비유지보수 영역인 slime-game `<img>`와 sprite-editor `<canvas>`만 남음.
- 직접 플랫폼/런타임 import 스캔: 동결 경로 제외 잔여는 `apps/web/src/app/check/[token]/page.tsx`의 `useSearchParams`만 남음.
- 오렌지/앰버/노랑 및 비정규 warm color 스캔: 동결 경로 제외 잔여 없음.

## 2026-06-02 YeonCanvas / 비동결 raw media 추가 이관

- `@yeon/ui`에 `YeonCanvas` web/native 프리미티브를 추가하고 root/native export 및 README 목록에 연결했다.
- `sprite-editor` 프리뷰의 raw `<canvas>`를 `YeonCanvas` 경유로 전환했다.
- `slime-game` 검격 이펙트의 raw `<img>` 두 곳을 기존 `YeonImage` 프리미티브 경유로 전환했다.
- 상담 워크스페이스/학생관리/space/sheet/import/mockdata/tutorial 등 동결 경로 변경 없음 확인.

## 2026-06-02 YeonCanvas / 비동결 raw media 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과(작업 worktree는 `.git` 파일 구조라 프로젝트 검사는 건너뜀)
- `/Users/osuma/coding_stuffs/yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- `git diff --check` 통과
- JSX 중심 raw lowercase 앱 태그 스캔: 동결 경로 제외 잔여는 public-check 인접 `apps/web/src/app/check/layout.tsx`의 `<div>`만 남음.
- 넓은 raw 문자열 스캔의 card editor `<p>/<img>` 표시는 JSX가 아니라 HTML regex/테스트 문자열로 확인했다.
- direct platform/runtime scan: 동결 경로 제외 잔여는 `apps/web/src/app/check/[token]/page.tsx`의 public-check 인접 `useSearchParams`만 남음.
- 오렌지/앰버/노랑 및 비정규 warm color 스캔: 동결 경로 제외 잔여 없음.

## 2026-06-02 Yeon browser runtime / WebRTC / 잔여 false positive 정리

### 작업내용

- `@yeon/ui/runtime/YeonBrowserRuntime`에 브라우저 host runtime 경계를 추가했다.
  - `assignYeonLocation`: 앱 코드의 직접 `window.location.assign` 제거.
  - `createYeonRtcPeerConnection`, `hasYeonUserMediaSupport`, `requestYeonUserMedia`: room voice call의 직접 `RTCPeerConnection` 생성과 `navigator.mediaDevices.getUserMedia` 호출 제거.
  - web/native export를 모두 맞추고 native에서는 no-op/unsupported fallback을 제공했다.
- `apps/web/src/lib/use-logout.ts`에서 직접 `window.location.assign`과 `window.alert`를 Yeon runtime의 `assignYeonLocation`, `showYeonAlert` 경유로 교체했다.
- `apps/web/src/lib/guest-card-service-store.ts`에서 직접 `localStorage`, `Date.now`, `Math.random`, `crypto.randomUUID` 사용을 Yeon runtime 경유로 교체했다.
- `apps/web/src/lib/hooks/use-click-outside.ts`에서 직접 `document.addEventListener/removeEventListener` 대신 `addYeonDocumentEventListener`를 사용하도록 정리했다.
- `apps/web/src/features/room-voice-call/use-room-voice-call.ts`에서 WebRTC/user media/session id 생성 runtime을 Yeon runtime 경계로 이동했다.
- `apps/mobile/src/providers/app-providers.tsx`의 `StatusBar` alias를 `YeonStatusBar`로 바꿔 raw/native UI primitive 스캔 오탐을 제거했다.
- 카드 리치 유틸의 `document`/`document.descendants` 변수명을 `yeonDocument`/`proseMirrorDocument`로 바꿔 실제 DOM 직접 접근이 아닌 ProseMirror 문서 모델 오탐을 줄였다.
- 상담/강사/학생관리/space/import/public-check/mockdata/tutorial 동결·상담 인접 경로는 변경하지 않았다.
- 사용자 지시대로 커밋하지 않고 워킹 디렉토리에 누적했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고: `apps/web/postcss.config.js` package type warning
  - 기존 경고: prerender 중 Node `localStorage is not available because --localstorage-file was not provided`
- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm exec vitest run apps/mobile/src/lib/mobile-preview.test.ts apps/mobile/src/components/ui/ui-a11y-contract.test.ts` 통과: 2 files / 5 tests
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과(작업 worktree는 `.git` 파일 구조라 프로젝트 검사는 건너뜀)
- `/Users/osuma/coding_stuffs/yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- `git diff --check` 통과
- 유지보수 web/mobile 범위 browser/runtime 직접 호출 스캔: 0건
- 유지보수 web/mobile 범위 직접 platform import 스캔: 0건
- JSX 중심 raw lowercase 앱 태그 스캔: 동결 인접 `apps/web/src/app/check/layout.tsx`의 `<div>`만 잔여
- 넓은 raw 문자열 스캔의 card editor `<p>/<img>` 표시는 JSX가 아니라 HTML regex/테스트 문자열로 확인
- direct platform/runtime broad scan 잔여: 동결 인접 `apps/web/src/app/check/[token]/page.tsx`의 public-check `next/navigation`만 잔여
- 유지보수 web/mobile/packages UI/design-token 금지 orange/amber/yellow/warm 색상 스캔: 0건
- 동결 범위 diff 스캔: `counsel|instructor|student-management|space-settings|cloud-import|onedrive-import|public-check|mockdata|tutorial` 변경 파일 없음

### 상태

- 커밋하지 않음. PR/머지도 하지 않음.
- 백로그 전체 완료 선언 전까지 public-check 동결 인접 예외와 rich-content/native no-op 경계는 별도 판단 대상으로 유지한다.

## 2026-06-02 추가 진행 — Codex

### 작업 내용

- `@yeon/ui` 런타임/프리미티브 확장
  - `YeonPortal`, `YeonScript`, `YeonMetadataRoute`, `YeonOgImageResponse` subpath wrapper 추가.
  - `YeonBrowserRuntime`에 URLSearchParams, 위치, body class, object URL, audio/canvas/image/anchor 생성, GA gtag, 타이머/랜덤/클립보드 헬퍼를 보강.
  - `react-dom` peer/dev 의존성을 `@yeon/ui`에 추가하고 lockfile 갱신.
- 비동결 웹/모바일 직접 런타임 의존 축소
  - `app/page`, `robots`, `sitemap`, `seo`, `subdomain-routing`, `app-route-paths`, `route-state/search-params`를 Yeon runtime/type wrapper 기준으로 정리.
  - `privacy`, `terms`, 인증 페이지 metadata를 `YeonPageMetadata`로 정리하고, raw `a/strong/option` 일부를 `YeonLink/YeonText/YeonOption`으로 치환.
  - `login-modal`의 portal/body class/location/searchParams 처리를 Yeon wrapper/hook으로 이동.
  - `star-lobby-live-panel`, `audio-file`, `analytics`, `use-sprite-validation-runtime`, `sprite-frame-editor`, mobile `format`의 직접 `window/document/URL/Date/Math/navigator` 의존을 runtime wrapper로 일부 이동.
- 빌드 안정화
  - `YeonOgImageResponse`는 root barrel export에서 제거해 client bundle로 `next/og`가 유입되지 않도록 유지.
  - Turbopack에서 Colyseus 브라우저 번들을 사용하도록 `apps/web/src/lib/colyseus-browser-shim.ts`와 `next.config.ts` alias를 추가.

### 검증

- `pnpm --filter @yeon/ui typecheck` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/mobile typecheck` ✅
- `pnpm --filter @yeon/ui lint` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/mobile lint` ✅
- `pnpm --filter @yeon/web build` ✅
  - 참고: `postcss.config.js` module type 경고와 `localStorage is not available` 실험 경고만 출력됨.
- `git diff --check` ✅
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` ✅
- `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` in `/Users/osuma/coding_stuffs/yeon` ✅
- worktree `/Users/osuma/coding_stuffs/yeon-4`의 `verify-ssot.sh --project-only`는 `.git`이 파일인 worktree 구조 때문에 프로젝트 검사를 스킵함. base worktree에서 SSOT OK 확인.

### 잔여 스캔 결과

- raw JSX non-frozen: `apps/web/src/app/check/layout.tsx`만 남음 (`public-check` 동결/제외 범위).
- direct Next import non-frozen:
  - `apps/web/src/app/check/*`는 `public-check` 동결/제외 범위.
  - `apps/web/src/app/page.tsx`의 `cookies/headers`는 서버 요청 데이터 조회용으로 유지.
- runtime 직접 의존 잔여:
  - `spline-hero.tsx`의 복잡한 Spline load/error/RAF 처리.
  - `layout.tsx`의 GA script 문자열 내부 `window.dataLayer`.
  - `room-voice-call`의 `RTCPeerConnection` 타입 참조.
- 금지 warm/orange 색상 스캔: 추가 적발 없음.
- 상담/CRM 동결 경로 diff: 없음.

### 지시 준수

- 사용자 지시대로 커밋/푸시/PR/머지하지 않음. 모든 변경은 워킹 디렉토리에 유지.

## 2026-06-02 추가 진행 2 — Codex

### 작업 내용

- `spline-hero.tsx`의 잔여 직접 browser runtime 의존을 `YeonBrowserRuntime` 경계로 이동했다.
  - `matchMedia`, `requestAnimationFrame/cancelAnimationFrame`, idle callback, window load/error listener, `window.onerror`, `document.readyState` 접근을 Yeon wrapper로 치환.
  - Spline 런타임 오류 fallback 흐름은 유지하되 앱 코드에서 직접 `window/document`를 만지지 않게 했다.
- `room-voice-call`의 WebRTC 타입/권한 오류 분기를 Yeon runtime 타입·헬퍼로 이동했다.
  - `RTCPeerConnection`, `RTCIceServer`, `RTCIceCandidateInit`, `MediaStream`, `HTMLAudioElement`, `DOMException` 직접 참조를 `YeonRtc*`, `YeonMediaStream`, `YeonAudioElement`, `isYeonUserMediaPermissionDenied`로 치환.
- `layout.tsx` GA bootstrap 문자열을 `createYeonGoogleAnalyticsBootstrapScript`로 이동해 앱 layout의 직접 `window.dataLayer` 문자열을 제거했다.
- 유지보수 서비스 주변 서버 보조 경로도 추가 정리했다.
  - auth route/server, community presence, card image storage, chat-service Spring client, typing deck Spring client의 `new URL`, `Date.now`, `Math.random`, `crypto.randomUUID`, `URLSearchParams`를 Yeon runtime wrapper로 치환.
  - 상담/스페이스/import/public-check/mockdata/tutorial 동결·인접 경로는 계속 제외했다.
- `@yeon/ui` root/native barrel에 새 runtime helper 일부를 노출해 web/native 공용 import 경계를 유지했다.

### 검증

- `pnpm --filter @yeon/ui typecheck` ✅
- `pnpm --filter @yeon/ui lint` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/mobile typecheck` ✅
- `pnpm --filter @yeon/mobile lint` ✅
- `pnpm --filter @yeon/web build` ✅
  - 기존 경고: `apps/web/postcss.config.js` module type warning.
  - 기존 경고: prerender 중 Node `localStorage is not available because --localstorage-file was not provided`.
- `git diff --check` ✅
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` ✅
- `/Users/osuma/coding_stuffs/yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` ✅

### 잔여 스캔 결과

- 앱 UI raw lowercase JSX 스캔: JSX 잔여 없음. `add-card-form.tsx`의 `<img` 표시는 HTML 정규식 문자열이라 제외.
- 모바일 raw React Native/Expo runtime 스캔: 0건.
- 유지보수 범위 직접 browser/runtime broad scan 잔여: `next/headers`의 `cookies/headers` 2건만 남음. 서버 요청 쿠키/헤더 조회용 Next runtime이라 UI primitive 이관 대상에서 제외.
- 동결 범위 diff 스캔: `counsel|instructor|student-management|space-settings|cloud-import|onedrive-import|public-check|mockdata|tutorial|check/` 변경 파일 없음.
- 금지 warm/orange/yellow 스캔: 신규 오렌지/앰버/옐로우 적발 없음. `globals.css`의 상담 테마 CSS 변수와 `icon.svg` 기존 색상만 잔여로 표시됨.

### 지시 준수

- 사용자 지시대로 커밋/푸시/PR/머지하지 않음. 모든 변경은 워킹 디렉토리에 유지.

## 2026-06-02 추가 진행 3 — Codex

- `@yeon/ui/runtime/YeonServerRequest` 서버 런타임 래퍼를 추가해 Next 서버 요청 저장소 접근을 UI 패키지 경계로 이동.
- `HomePage`와 root auth session 조회에서 `next/headers` 직접 import를 제거하고 `getYeonRequestCookies`/`getYeonRequestHeaders` 경유로 교체.
- native 엔트리에는 no-op request cookie/header stub을 추가해 Universal UI 패키지 subpath가 플랫폼별로 해석되도록 구성.
- `@yeon/ui` package export에 `./runtime/YeonServerRequest` subpath를 추가하되 root barrel export는 하지 않아 client bundle로 `next/headers`가 새어 들어가지 않게 유지.
- 비동결 유지보수 대상 스캔 기준에서 raw web JSX 태그/브라우저 런타임 직접 의존/mobile raw native control 잔여를 재확인.
- 상담 워크스페이스 관련 경로 변경 없음 재확인.

## 2026-06-02 추가 진행 3 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/design-tokens typecheck && pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 기존 경고 유지: `apps/web/postcss.config.js` module type warning, Node `localStorage is not available because --localstorage-file was not provided` experimental warning.
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/Users/osuma/coding_stuffs/yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` 통과
- 비동결 유지보수 대상 direct runtime scan: 잔여 없음.
- 비동결 앱 raw web JSX scan: 실제 JSX 잔여 없음(`add-card-form.tsx`의 `<img` 정규식 문자열만 검출).
- 모바일 raw native/runtime scan: 잔여 없음.
- frozen/counseling 경로 변경 스캔: 잔여 없음.

## 2026-06-02 DOM 런타임/정규 색상 추가 정리

- `@yeon/ui/runtime/YeonBrowserRuntime`에 `isYeonFile`, `isYeonInputElement`, `YeonServerRequest` 계열 경계를 보강해 앱 코드의 직접 `File`/`FormData`/`HTMLInputElement` 사용을 줄였다.
- `card-deck-assets` 업로드와 카드덱 asset route의 `FormData`/`File` 판정을 `YeonFormData`/`YeonFile`/`isYeonFile` 경유로 전환했다.
- auth redirect URL 타입, slime validation keyboard event 타입, auth/admin/star-lobby form event 타입을 Yeon 공용 타입으로 전환했다.
- `sprite-editor`의 `HTMLCanvasElement`/`HTMLImageElement`/`HTMLInputElement` 직접 타입과 input ref 판정을 Yeon 런타임 타입/가드로 전환했다.
- 신규 추가 색상에서 `#111111/#666666/#aaaaaa`를 `#111/#666/#aaa` 정규값으로 정리하고, `warm` 명명은 색상 스캔 오탐을 막기 위해 `prefetch` 명명으로 바꿨다.
- 상담/CRM 동결 범위(`integrations`, `members/profile-import`, `counseling-*`, `student-management` 등)는 직접 수정하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 하지 않고 워킹 디렉토리에 누적했다.

## 2026-06-02 DOM 런타임/정규 색상 검증

- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only`는 원본 `yeon` 워크트리에서 통과
- diff 추가분 색상 스캔: disallowed hex 0건, orange/amber/yellow/warm 추가 0건
- 비동결 app 직접 DOM 타입 스캔: 남은 항목은 동결 범위 또는 문자열 URL 라벨로 확인

## 2026-06-02 raw JSX / untracked token 추가 정리

- 비동결 앱 raw JSX 스캔에서 실제로 남은 `<br />` 2건을 제거했다.
  - `star-lobby-mvp-page`의 줄바꿈은 `whitespace-pre-line` 텍스트로 전환.
  - `landing-features-section`의 줄바꿈도 `whitespace-pre-line` 텍스트로 전환.
- Next App Router root layout 필수 태그인 `<html>/<body>`만 raw JSX 후보로 남겼다.
- untracked `packages/design-tokens` 색상까지 포함해 다시 검사한 뒤, `mobile/semantic` 토큰의 파랑/빨강/유사 회색을 정규 중립 토큰으로 정리했다.
  - mobile accent/error → `#111`
  - mobile border → `#e5e5e5`
  - semantic accent/error → `#111`
- 상담/CRM 동결 범위는 계속 수정하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 하지 않고 워킹 디렉토리에 누적했다.

## 2026-06-02 raw JSX / untracked token 검증

- `pnpm --filter @yeon/design-tokens typecheck` 통과
- `pnpm --filter @yeon/design-tokens lint` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- 원본 `yeon` 기준 `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` 통과
- 비동결 현재 색상 스캔: disallowed hex 0건, orange/amber/yellow/warm 0건
- 비동결 raw JSX 스캔: Next root `<html>/<body>` 2건만 잔여
- 비동결 direct import 스캔: `next/link`, `next/image`, `lucide-react`, `framer-motion`, raw `react-native` 잔여 없음
- 모바일 raw native primitive 스캔: 잔여 없음

## 2026-06-02 비동결 CSS Module 잔여 제거

- `apps/web/src/features/life-os/life-os.module.css`를 제거하고 `life-os.tsx` 내부 `LIFE_OS_CLASS` 상수로 정규 토큰 기반 클래스만 남김.
- `apps/web/src/features/landing-home/landing-workspace.module.css`를 제거하고 `spline-hero.tsx` 내부 `SPLINE_HERO_CLASS` 상수로 Spline fallback/레이어 스타일을 이관함.
- Spline fallback의 중립 배경/보더/텍스트는 `#ffffff/#fafafa/#e5e5e5/#111/#666/#aaa` 범위와 중립 rgba만 사용하도록 유지함.
- 상담 워크스페이스/CRM 동결 경로는 변경 대상에서 제외함.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지함.

## 2026-06-02 비동결 CSS Module 제거 검증

- `find apps/web/src apps/mobile/src packages/ui/src -name '*.module.css' ...` 비동결 영역 결과 0개.
- `rg '\.module\.css|styles\.' ...` 비동결 앱 영역 결과 없음.
- 비동결 direct platform/library import 점검: `next/link`, `next/image`, `lucide-react`, `framer-motion`, `react-native`, `expo-*` 직접 import 결과 없음.
- 비동결 raw JSX 태그 점검: 앱 루트 `html/body`만 남음.
- 비동결 색상 점검: 금지 hex 0개, `orange/amber/yellow` 계열 0개.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과. 단, 기존 `postcss.config.js` module type 경고와 Node localStorage experimental 경고는 출력됨.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/design-tokens typecheck` 통과.
- `pnpm --filter @yeon/design-tokens lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` 통과.

## 2026-06-02 비동결 fetch/http 런타임 경계 정리

- `@yeon/ui/runtime/YeonBrowserRuntime`에 `YeonRequest`, `YeonHeaders`, `YeonHeadersInit`, `YeonCanvasRenderingContext2D`, `createYeonHeaders`, `createYeonResponse`를 추가하고 web/native export를 연결함.
- card-service, typing-service, community/chat-service, auth, star-lobby, room-voice-call, life-os WIP 범위의 직접 `fetch`, `RequestInit`, `Headers`, `Response`, `URLSearchParams`, `CanvasRenderingContext2D` 사용을 Yeon 런타임 타입/함수 경유로 전환함.
- `spaces-spring-client`, cloud/oauth, import-stream, file-analysis/import-ocr, member-tabs/risk 등 상담/스페이스/AI import 계열 동결 또는 범위 외 서버 유틸은 변경하지 않음.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지함.

## 2026-06-02 fetch/http 런타임 경계 검증

- 비동결 strict 스캔: 직접 `fetch`, `RequestInit`, `Headers`, `Response`, `Request`, `URLSearchParams`, `CanvasRenderingContext2D` 잔여 없음(Yeon alias/함수 및 동결/범위 외 경로 제외).
- 비동결 CSS Module 파일 0개.
- 비동결 direct platform/library import 점검: `next/link`, `next/image`, `lucide-react`, `framer-motion`, `react-native`, `expo-*` 직접 import 잔여 없음.
- 비동결 색상 점검: 금지 hex 0개, `orange/amber/yellow` 계열 0개.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/design-tokens typecheck` 통과.
- `pnpm --filter @yeon/design-tokens lint` 통과.
- `pnpm --filter @yeon/web build` 통과. 단, 기존 `postcss.config.js` module type 경고와 Node localStorage experimental 경고는 출력됨.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" bash bin/verify-ssot.sh --project-only` 통과.

## 2026-06-02 비동결 ProductShell / 도움말 패턴 유니버설화

- `packages/ui/src/patterns/YeonProductShell/`에 웹/네이티브 공용 패턴을 추가했다.
  - `YeonProductHeader`
  - `YeonProductHeaderActionButton`
  - `YeonServiceHelpDialog`
- 기존 웹 전용 `apps/web/src/components/product-shell/service-help-dialog.tsx`를 제거하고, 타자/카드/커뮤니티 도움말 모달 사용처를 `@yeon/ui` 공용 패턴으로 전환했다.
- 기존 웹 전용 `ProductHeader`/`ProductHeaderSettingsButton`은 앱별 BGM/auth/profile 연결만 담당하는 얇은 alias로 축소했다.
- `@yeon/ui` public barrel에 누락된 primitive export를 추가하고, 비동결 범위의 `@yeon/ui/primitives/*` 직접 subpath import를 모두 public import로 정리했다.
- Next 서버 컴포넌트 import 경계에서 안전하도록 `YeonBrowserHooks`에 명시적 client boundary를 추가했다.
- 자동 import 정리 과정에서 실수로 변경된 상담/CRM/동결 및 범위 외 경로는 전부 `git restore --`로 원복했다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 ProductShell 유니버설화 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
  - 기존 `apps/web/postcss.config.js` module type 경고와 Node `localStorage` experimental 경고는 계속 출력됨.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- 비동결 `@yeon/ui/primitives/*` subpath import 스캔: 0건.
- 비동결 same-line import 잔여 스캔: 0건.
- 비동결 direct runtime/browser construct strict 스캔: 0건.
- 비동결 금지 hex 색상 스캔: 0건.
- 비동결 warm/orange/amber/yellow 계열 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 변경 잔여 없음.

## 2026-06-02 LegalDocument / ProfileMenu 공용 패턴 추가

- `packages/ui/src/patterns/YeonLegalDocument/`에 웹/네이티브 공용 법적 문서 레이아웃 패턴을 추가했다.
  - `YeonLegalDocumentPage`
  - `YeonLegalSection`
  - `YeonLegalList`
  - `YeonLegalLink`
- `/terms`, `/privacy` 페이지의 직접 HTML/인라인 style 기반 문서 레이아웃을 `@yeon/ui` LegalDocument 패턴으로 전환했다.
  - 두 페이지의 `style=` 사용과 로컬 `Section`/`PolicyList` 컴포넌트 정의를 제거했다.
- `YeonProductShell`에 `YeonProductProfileMenu` 웹/네이티브 공용 패턴을 추가했다.
- 웹 `ProductHeaderProfileButton`은 인증 조회와 로그아웃 연결만 담당하고, 드롭다운 UI/닫힘 처리/메뉴 마크업은 `@yeon/ui` 공용 패턴으로 이동했다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 LegalDocument / ProfileMenu 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
  - 기존 `apps/web/postcss.config.js` module type 경고와 Node `localStorage` experimental 경고는 계속 출력됨.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- 비동결 앱 직접 platform import 스캔: 0건.
- 비동결 `@yeon/ui/primitives/*` subpath import 스캔: 0건.
- `/terms`, `/privacy`의 `style=` 및 로컬 문서 섹션 컴포넌트 잔여 스캔: 0건.
- style/class/token 문맥의 비정규 hex 색상 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-02 Life OS 모바일 패턴 / OG 이미지 public export 정리

- `packages/ui/src/patterns/YeonLifeOsMobile/index.native.tsx`를 추가해 모바일 Life OS 화면의 로그인 카드, 시간표, 시간별 편집기, 메모 그리드, 데일리 리포트 카드를 `@yeon/ui/native` 패턴으로 이동했다.
- `apps/mobile/src/features/life-os/life-os-screen.tsx`에서 직접 React Native 컴포넌트/style sheet/인라인 style 의존을 제거하고 상태·API·도메인 계산만 남겼다.
- `createYeonOgImageResponse`를 `@yeon/ui` public barrel로 노출하고, `apps/web/src/app/_lib/og-image.tsx`의 `@yeon/ui/patterns/*`, `@yeon/ui/runtime/*` 직접 subpath import를 public import로 정리했다.
- 새 패턴은 `yeonMobileAppColors`/`yeonMobileAppSpacing`/`yeonMobileAppShadow`만 사용했고, 오렌지·앰버·노랑 계열 및 신규 arbitrary hex를 추가하지 않았다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 Life OS 모바일 패턴 / OG 이미지 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- `apps/mobile/src/features/life-os/life-os-screen.tsx`의 `style=`/`createYeonStyleSheet`/직접 RN UI 의존 스캔: 0건.
- 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 신규 Life OS 패턴/OG 이미지 변경 범위의 warm/orange/amber/yellow/직접 hex 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-02 Sprite/StatusBar 유니버설 UI 정리

- `packages/ui/src/patterns/YeonSpriteSheet/`를 추가해 웹 슬라임 검증 화면의 sprite sheet 렌더링을 공용 패턴으로 이동했다.
- `packages/ui/src/patterns/YeonSlimeSwordAttackEffect/`를 추가해 슬라임 검증 화면의 검격 이펙트 위치/변환 UI 계산을 공용 패턴으로 이동했다.
- `apps/web/src/features/slime-game/slime-game-stage.tsx`, `slime-collision-validation-runtime.tsx`, `slime-combat-validation-runtime.tsx`는 로컬 `SpriteSheet`/`SlimeSwordAttackEffect` 대신 `@yeon/ui` public export를 사용하도록 정리했다.
- 기존 웹 로컬 UI 파일 `apps/web/src/features/slime-game/sprite-sheet.tsx`, `slime-sword-attack-effect.tsx`를 제거했다.
- `YeonStatusBar`에 `tone` alias를 추가하고 `apps/mobile/src/providers/app-providers.tsx`의 `style="dark"` 직접 prop 사용을 `tone="dark"`로 바꿨다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 Sprite/StatusBar 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- 비동결 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet` 잔여 파일 스캔: 4건.
  - `apps/web/src/features/slime-game/slime-game-stage.tsx`
  - `apps/web/src/features/slime-game/slime-collision-validation-runtime.tsx`
  - `apps/web/src/features/slime-game/slime-combat-validation-runtime.tsx`
  - `apps/web/src/features/landing-home/spline-hero.tsx`
- 신규 Sprite/StatusBar 변경 범위의 warm/orange/amber/yellow/직접 hex 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-02 PositionedBox 기반 잔여 style 제거

- `packages/ui/src/patterns/YeonPositionedBox/`를 추가해 동적 위치/크기 같은 런타임 배치값을 `style=` 대신 공용 `box` prop으로 받는 패턴으로 분리했다.
- `apps/web/src/features/slime-game/slime-game-stage.tsx`, `slime-collision-validation-runtime.tsx`, `slime-combat-validation-runtime.tsx`의 검증용 동적 배치 UI를 `YeonPositionedBox`로 이동했다.
- `apps/web/src/features/landing-home/spline-hero.tsx`의 Spline 표시 레이어 transition duration도 `YeonPositionedBox`의 `box` prop으로 이동했다.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet`, `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*`, 로컬 `components/yeon-ui` import 스캔을 다시 0건으로 만들었다.
- raw JSX 스캔의 1건은 실제 JSX가 아니라 카드 입력 sanitizing 정규식 `/<img\b/i` false positive로 확인했다.
- 색상 스캔의 잔여 15건은 기존 `apps/web/src/app/globals.css` 레거시 토큰 색상이며, 이번 PositionedBox 정리 범위에는 오렌지/앰버/노랑 및 신규 arbitrary hex를 추가하지 않았다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 PositionedBox 검증

- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `pnpm --filter @yeon/design-tokens typecheck` 통과.
- `pnpm --filter @yeon/design-tokens lint` 통과.
- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet` 잔여 파일 스캔: 0건.
- 비동결 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 비동결 앱 경로의 로컬 `components/yeon-ui` import 스캔: 0건.
- 비동결 앱 경로의 직접 `react-native` import 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.

## 2026-06-02 Life OS 패턴 웹 parity 추가

- `packages/ui/src/patterns/YeonLifeOsMobile/index.tsx`를 추가해 기존 native 전용 Life OS 패턴에 웹 대응 구현을 붙였다.
- 웹/네이티브 양쪽에서 `YeonLifeOsLoginCard`, `YeonLifeOsHourlySheet`, `YeonLifeOsHourEditor`, `YeonLifeOsMemoGrid`, `YeonLifeOsDailyReportCard` 타입/컴포넌트 이름을 동일하게 제공하도록 `packages/ui/src/index.ts` public export를 맞췄다.
- `packages/ui/src/patterns/YeonTextField/index.tsx`의 `keyboardType`에 native와 맞춰 `email-address`를 추가하고 웹에서는 `type="email"`로 매핑했다.
- 패턴 parity 스캔 결과 `packages/ui/src/patterns/*`의 `index.tsx`/`index.native.tsx` 누락은 0건이다.
- 신규 Life OS 웹 패턴에는 오렌지/앰버/노랑 계열 및 비정규 신규 색상을 추가하지 않았다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 Life OS 패턴 웹 parity 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet` 잔여 파일 스캔: 0건.
- 비동결 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 비동결 앱 경로의 로컬 `components/yeon-ui` import 스캔: 0건.
- 비동결 앱 경로의 직접 `react-native` import 스캔: 0건.
- raw JSX 스캔의 1건은 실제 JSX가 아니라 카드 입력 sanitizing 정규식 `/<img\b/i` false positive로 확인했다.
- 신규 변경 범위의 forbidden/warm 색상 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-02 Primitive native parity 추가

- `packages/ui/src/primitives/YeonStructuredData/index.native.tsx`를 추가해 웹 구조화 데이터 primitive의 native no-op 대응을 마련했다.
- `packages/ui/src/primitives/YeonGlobalStyle/index.native.tsx`를 추가해 웹 전역 스타일 primitive의 native no-op 대응을 마련했다.
- `packages/ui/src/primitives/YeonContextMenu/index.native.tsx`를 추가해 웹 컨텍스트 메뉴 primitive의 native 대응 렌더링을 마련했다.
- `packages/ui/src/index.native.ts`에 위 3종 primitive export/type export를 추가해 native public barrel에서도 같은 이름으로 접근 가능하게 했다.
- 신규 native context menu는 `yeonMobileAppColors`/`yeonMobileAppShadow` 기존 토큰만 사용했고, 오렌지/앰버/노랑 계열 및 신규 arbitrary hex를 추가하지 않았다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 Primitive native parity 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- `packages/ui/src/primitives`, `patterns`, `hooks`, `rich-content`의 web/native index parity 누락 스캔: 0건.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet` 잔여 파일 스캔: 0건.
- 비동결 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 비동결 앱 경로의 로컬 `components/yeon-ui` import 스캔: 0건.
- 비동결 앱 경로의 직접 `react-native` import 스캔: 0건.
- raw JSX 스캔의 1건은 실제 JSX가 아니라 카드 입력 sanitizing 정규식 `/<img\b/i` false positive로 확인했다.
- 신규 변경 범위의 forbidden/warm 색상 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-02 Runtime native export parity 추가

- `packages/ui/src/runtime/YeonRealtimeClient/shared.ts`를 추가해 Colyseus realtime client wrapper 구현을 단일 source of truth로 분리했다.
- `packages/ui/src/runtime/YeonRealtimeClient/index.ts`, `index.native.ts`가 같은 shared 구현을 재수출하도록 정리했다.
- `packages/ui/src/runtime/YeonStateStore/shared.ts`를 추가해 Zustand store wrapper 구현을 단일 source of truth로 분리했다.
- `packages/ui/src/runtime/YeonStateStore/index.ts`, `index.native.ts`가 같은 shared 구현을 재수출하도록 정리했다.
- `packages/ui/package.json`의 `./runtime/YeonRealtimeClient`, `./runtime/YeonStateStore` export condition에 `react-native` native entry를 명시했다.
- `packages/ui/src/index.native.ts`의 StateStore export도 native entry를 보도록 정리했다.
- 이번 runtime parity 작업은 색상 UI 변경이 아니며, 오렌지/앰버/노랑 계열 및 신규 arbitrary hex를 추가하지 않았다.
- 상담/CRM/동결 및 범위 외 경로는 변경하지 않았다.
- 사용자 지시대로 커밋/PR/머지는 수행하지 않고 `yeon-4` 워킹 디렉토리에 WIP 누적 상태를 유지했다.

## 2026-06-02 Runtime native export parity 검증

- `pnpm --filter @yeon/ui typecheck` 통과.
- `pnpm --filter @yeon/ui lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/mobile lint` 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 종료 코드 0.
  - 단, 출력에는 `git 저장소가 아니어서 프로젝트 SSOT 점검 건너뜀` 경고가 포함되어 실제 프로젝트 검사는 스크립트가 건너뛴 것으로 기록함.
- `packages/ui/src/primitives`, `patterns`, `runtime`, `hooks`, `rich-content`의 web/native index parity 누락 스캔: 0건.
- 비동결 앱 경로의 `style=`/`createYeonStyleSheet` 잔여 파일 스캔: 0건.
- 비동결 앱 경로의 `@yeon/ui/primitives/*`, `@yeon/ui/patterns/*` 직접 subpath import 스캔: 0건.
- 비동결 앱 경로의 로컬 `components/yeon-ui` import 스캔: 0건.
- 비동결 앱 경로의 직접 `react-native` import 스캔: 0건.
- raw JSX 스캔의 1건은 실제 JSX가 아니라 카드 입력 sanitizing 정규식 `/<img\b/i` false positive로 확인했다.
- 신규 변경 범위의 forbidden/warm 색상 스캔: 0건.
- 동결/범위 외 경로 status 스캔: 0건.

## 2026-06-03 전체 마이그레이션 최종 검증 + OG 배럴 빌드 회귀 수정 (claude)

### 검증 결과 — 비상담 전체 표면 Universal UI 이관 완료 확인

- 비동결(card-service/typing-service/community + room-shared/room-voice-call/life-os/slime-game/landing-home/auth-credentials/admin/product-shell/branding/analytics) 웹 feature·app 라우트: raw JSX DOM 태그 0건.
- 모바일 features/components/app: raw RN primitive(View/Text/Pressable/TextInput/ScrollView/Image/Switch...) 0건.
- 비동결 앱: 금지 플랫폼 직접 의존(next/link·image·navigation·dynamic·script, lucide-react, framer-motion, @tiptap, dompurify, react-markdown, mermaid, @colyseus/sdk, @radix-ui, zustand, @uiw/react-md-editor) 0건.
- 비동결 앱: `@yeon/ui/primitives|patterns` 직접 subpath import 0건(런타임/hooks subpath는 정식 경계라 허용).
- 비동결 web feature: 직접 브라우저 글로벌(addEventListener/new Audio/DOMParser/document.body.style) 0건.
- orange/amber/#e8630a/#e87310 금지색: 비동결 범위 0건.
- 잔여 raw DOM/브라우저 글로벌은 전부 **동결 상담 CRM**(student-management·cloud-import·space-settings·public-check·mockdata 데모)에만 존재 → 사용자 지시대로 미이관.

### 발견·수정한 회귀: @yeon/ui 공개 배럴의 OG 응답 누수

- 증상: `pnpm --filter @yeon/web build`가 `child_process`/`fs` Module not found 4건으로 실패.
- 원인: 공개 배럴 `packages/ui/src/index.ts`가 서버 전용 `createYeonOgImageResponse`(`next/og`→`@vercel/og`)를 재수출. 클라이언트 컴포넌트(`card-service/deck-play-screen.tsx`)가 `@yeon/ui` 배럴을 import할 때 Node 내장 모듈이 브라우저 번들로 끌려옴. (직전 "OG 이미지 public export 정리" 단계가 유발.)
- 수정:
  - `packages/ui/src/index.ts`·`index.native.ts` 배럴에서 `createYeonOgImageResponse` 및 타입 export 제거(web/native parity 유지).
  - 유일 소비처 `apps/web/src/app/_lib/og-image.tsx`를 `@yeon/ui/runtime/YeonOgImageResponse` subpath 직접 import로 전환.

### 최종 검증 (모두 통과)

- `pnpm --filter @yeon/web build` 통과(exit 0, Module not found 0). OG 라우트 정상 생성.
- `pnpm --filter @yeon/{design-tokens,ui,web,mobile} typecheck` 전부 통과.
- `pnpm --filter @yeon/{design-tokens,ui,web,mobile} lint` 전부 통과.
- `git diff --check` 통과.
- 배럴 경유 OG 함수/타입 사용처 0건(subpath만 사용).
- 사용자 지시대로 커밋/PR/머지 없이 `yeon-4` 워킹 디렉토리에 WIP 누적(변경 487파일).
