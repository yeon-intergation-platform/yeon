# Design System — 서비스별 색상 토큰 규칙

> SSOT. `.claude/rules/design-system.md`와 `.codex/skills/SHARED/design-system/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## 핵심 규칙 (항상 적용)

- **새 코드에 arbitrary hex 값 직접 추가 금지** — 아래 정규 값 목록에 없는 값은 쓰지 않는다
- **유사 회색 신규 추가 금지** — `#333`, `#555`, `#888`, `#ccc`, `#ddd`, `#f3f3f3`, `#f5f5f5`, `#f8f8f8` 등은 기존 사용처 외 신규 추가 불가
- 서비스 맥락을 모를 때: 해당 서비스 rule 파일 확인 → 기존 컴포넌트 색상 참조 → 이 파일 대조

---

## 상담 서비스 (counseling-service-shell, instructor-workspace)

`.app-theme` 클래스 범위 안 — **CSS 변수 기반 Tailwind 시맨틱 토큰만 사용**. hex 직접 사용 금지.

| 용도 | 토큰 |
|------|------|
| 배경 레이어 | `bg-bg` `bg-surface` `bg-surface-2` `bg-surface-3` `bg-surface-4` |
| 텍스트 | `text-text` `text-text-secondary` `text-text-dim` |
| 보더 | `border-border` `border-border-light` |
| 강조(인디고) | `text-accent` `bg-accent` `bg-accent-dim` `border-accent-border` |
| 상태 색상 | `text-green` `text-red` `text-amber` `text-rose` `text-cyan` |
| 상태 배경 | `bg-green-dim` `bg-red-dim` `bg-amber-dim` |
| 상태 보더 | `border-green-border` `border-amber-border` |
| 반경 | `rounded-sm`(6px) `rounded`(10px) `rounded-lg`(14px) |

CSS Module 파일(`.module.css`)에서는 `var(--bg)`, `var(--text)` 등 직접 참조.

---

## 카드 서비스, 타이핑 서비스 (흰 배경)

CSS 변수 시스템 미적용 구간. 아래 **정규 값만** 사용.

| 용도 | 정규 값 | Tailwind |
|------|---------|----------|
| 배경 | `#ffffff` | `bg-white` |
| 주 텍스트 | `#111` | `text-[#111]` |
| 보조 텍스트 | `#666` | `text-[#666]` |
| 3차 텍스트 | `#aaa` | `text-[#aaa]` |
| 보더 | `#e5e5e5` | `border-[#e5e5e5]` |
| 표면 배경 | `#fafafa` | `bg-[#fafafa]` |
| 검정 CTA | `#111` | `bg-[#111] text-white` |
| 오렌지 강조(타이핑 전용) | `#e8630a` | `text-[#e8630a]` `bg-[#e8630a]` |

**`#e8630a` vs `#e87310` 주의**: 타이핑 서비스 오렌지는 `#e8630a`. auth의 `#e87310`과 혼용 금지.

---

## 인증 서비스 (auth-credentials) — 다크 오렌지 테마

| 용도 | 정규 값 | Tailwind |
|------|---------|----------|
| 배경 | `#080808` | `bg-[#080808]` |
| 카드/표면 | `#111318` | `bg-[#111318]` |
| 텍스트 | `#f8f7f3` | `text-[#f8f7f3]` |
| CTA 오렌지 | `#e87310` | `bg-[#e87310]` |
| 보더 | `rgba(255,255,255,0.08)` | `border-[rgba(255,255,255,0.08)]` |

**auth는 `#e87310`, 타이핑은 `#e8630a`** — 각 서비스 범위 밖 사용 금지.

---

## 서비스 판별 빠른 참조

| 경로 | 테마 | 색상 규칙 |
|------|------|----------|
| `features/counseling-*` `features/instructor-workspace` | 다크(인디고) | CSS 변수 토큰 |
| `features/card-service` `features/typing-service` | 흰 배경 | 정규 hex 목록 |
| `features/auth-credentials` | 다크(오렌지) | auth 정규 hex 목록 |
| `features/student-management` `features/landing-home` | 흰 배경 | 카드/타이핑과 동일 |
