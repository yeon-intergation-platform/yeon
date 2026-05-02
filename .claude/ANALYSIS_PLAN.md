# Yeon 모노레포 4개 서비스 코드 패턴 분석 계획

## 목표

Yeon 모노레포에서 4개 주요 서비스(Typing Race, Card Decks, Counseling Workspace, Auth)의 코드 구조, UI 패턴, 설계 철학의 차이를 체계적으로 분석하여 보고서 작성

## 수집된 정보 요약

### 1. 식별된 4개 주요 서비스

#### Service 1: Typing Race (타이핑 레이스)

- **위치**: `apps/web/src/features/typing-service/`
- **역할**: 미니멀 레이스 UI + 작은 픽셀 게임 감성
- **주요 파일**:
  - `typing-service-home.tsx` - 홈 화면 (흰 배경, 검정 CTA)
  - `typing-race-solo-screen.tsx`, `typing-race-multiplayer-screen.tsx` - 레이스 화면
  - `typing-room-lobby-screen.tsx` - 방 로비
  - `use-typing-decks.ts`, `use-race-room.ts` - 상태 관리
- **디자인 톤**: 흰 배경, 검정 CTA, 얇은 보더, 회색 보조 텍스트 (미니멀)
- **주요 특징**: 기능이 먼저 보이는 UI, 게임 엔진 통합 (Phaser)
- **서버**: `apps/race-server`, `packages/typing-race-engine`

#### Service 2: Card Decks (카드/덱 학습)

- **위치**: `apps/web/src/features/card-service/`
- **역할**: 생산성형 카드 학습 UI
- **주요 파일**:
  - `card-service-home.tsx` - 홈 (덱 목록, 생성 CTA)
  - `deck-detail-screen.tsx` - 덱 상세 편집
  - `deck-play-screen.tsx` - 카드 플레이
  - `hooks/use-deck-list.ts` - 덱 목록 쿼리 (로컬/서버 분기)
- **디자인 톤**: 흰 배경, 검정 CTA, 얇은 회색 보더 (생산성)
- **주요 특징**: Guest/로그인 상태 데이터 분리, 덱 병합 UX
- **클라이언트**: `apps/mobile/src/features/card-service/`

#### Service 3: Counseling Workspace (상담 기록 관리)

- **위치**: `apps/web/src/features/counseling-record-workspace/`
- **역할**: 업무형 AI 학생관리 CRM
- **주요 파일**:
  - `counseling-record-workspace.tsx` - 메인 레이아웃 (다중 훅 조율)
  - `components/transcript-viewer.tsx` - 원문 열람
  - `components/assistant-panel.tsx` - AI 채팅
  - `components/record-sidebar.tsx` - 기록 목록/필터
  - `hooks/use-recording-machine.ts` - 녹음 상태
- **디자인 톤**: 차분한 업무형, 정보 밀도 높음
- **주요 특징**: 원문 신뢰 중심, STT→요약→AI 채팅 흐름, 학생/멤버 연결
- **관련**: `apps/web/src/features/student-management/`

#### Service 4: Auth Credentials (인증)

- **위치**: `apps/web/src/features/auth-credentials/`
- **역할**: 신뢰 중심의 인증 플로우
- **주요 파일**:
  - `auth-shell.tsx` - 인증 레이아웃 (다크 오렌지 톤)
  - `login-form.tsx`, `register-form.tsx` - 폼 컴포넌트
  - `reset-password-form.tsx`, `resend-verification-form.tsx` - 복구 흐름
- **디자인 톤**: 어두운 표면, 오렌지 CTA/focus, 높은 대비 (신뢰)
- **주요 특징**: 계정 연결/검증/복구 상태 명확성, 정책 문서화 부족
- **API**: `packages/api-contract/src/auth.ts`, `credential.ts`

### 2. 모바일 앱 구조

#### Mobile Services

- **위치**: `apps/mobile/src/services/`, `apps/mobile/src/features/`
- **3개 주요 서비스**:
  1. `chat-service` - 채팅 서비스
  2. `card-service` - 카드 덱 학습 (웹과 공유 API)
  3. `life-os` - 생활 OS
- **패턴**:
  - API 클라이언트 (`services/{service}/client.ts`)
  - React Query 키 (`services/{service}/query-keys.ts`)
  - 세션 스토리지 (`services/primary-auth/storage.ts`)
  - Screen 컴포넌트 (`features/{service}/*-screen.tsx`)
- **색상**: `colors.ts` - 통일된 color palette (accent: #4B57FF 파란색)

### 3. 디자인 토큰 구조

- **위치**: `packages/design-tokens/`
- **현황**: 매우 미니멀 (`src/index.ts`는 거의 비어있음)
- **내용**: Cross-platform 토큰만 포함 (color names, spacing, radius, typography)
- **특징**: 서비스별 분리 없음, 각 서비스가 인라인 색상값 사용
  - Typing: `bg-white`, `text-[#111]`, `hover:bg-[#333]`
  - Card: `bg-[#111]`, `text-[#111]`, orange accent `#e87310`
  - Auth: radial-gradient, `#f8f7f3`, `rgba(232,99,10,0.16)`
  - Mobile: `colors.ts` - 통일된 palette

### 4. API 계약 (Packages)

- **위치**: `packages/api-contract/src/`
- **주요 계약**:
  - `typing-decks.ts` - 타이핑 덱/문장 계약
  - `card-decks.ts` - 카드 덱 계약
  - `card-deck-merge-guest.ts` - 게스트 덱 병합
  - `counseling-records.ts` - 상담 기록
  - `auth.ts`, `credential.ts` - 인증
  - `chat-service.ts` - 채팅
  - `spaces.ts`, `student-board.ts` - 학생/스페이스 관리

### 5. 서비스 컨텍스트 스킬

5개 SSOT 파일 (`.claude/skills/service-context-*.md`):

1. **typing-race**: 기능 우선 미니멀 UI + 게임 감성, anti-AI 설계
2. **card-decks**: 생산성 UI, guest/auth 분기, 기획 부족
3. **counseling-workspace**: 업무형 CRM, 원문 신뢰, 수강생 우선
4. **auth-credential**: 신뢰 중심, 정책 미문서화
5. **contest**: 공모전 자료 (추가 서비스)

---

## 분석 틀

### 섹션 1: 서비스별 주요 경로 및 파일 구조

- 각 서비스의 디렉토리 구조
- 중요 진입점 (index.ts, Home 컴포넌트)
- 관련 패키지 및 서버 코드

### 섹션 2: UI 패턴 차이

- 디자인 톤 비교 (색상, 타이포그래피, 스페이싱)
- 컴포넌트 구조 (Shell, Screen, Form 패턴)
- 상태 관리 방식 (discriminated union vs local state)
- 접근성/에러 처리 철학

### 섹션 3: 기능 아키텍처 차이

- 데이터 흐름 (API → Query → Component)
- 인증/권한 처리 방식
- 상태 동기화 메커니즘
- 폼/입력 처리 패턴

### 섹션 4: 디자인 토큰 구조

- 현재 상태 (분산적 인라인 값)
- 서비스별 색상 스키마
- 타이포그래피 규칙
- 모바일 vs 웹 일관성

### 섹션 5: 팀 작업 경계 (코드리뷰 체크리스트)

- 각 서비스의 크로스커팅 영향
- 타입 계약 확인 포인트
- 상태/캐시 일관성 검증

---

## 다음 단계

1. ✅ 탐사 완료 (디렉토리, 파일, 컨텍스트 스킬 수집)
2. 📝 분석 보고서 작성 (이 계획)
