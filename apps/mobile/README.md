# @yeon/mobile

Expo application workspace.

## Responsibilities

- Native UI and device capabilities
- Public API consumption
- Offline/mobile-specific state
- Push notification integration

## Build variants

- 익명친구 앱: 기본값(`EXPO_PUBLIC_MOBILE_VARIANT=anonymous`)
- 카드 서비스 앱: `EXPO_PUBLIC_MOBILE_VARIANT=card`

각 앱은 같은 소스코드 기반으로 동작하되, 실행 시점 환경변수로 진입 화면 및 앱 메타(이름/슬러그/스킴/앱 ID)를 분기합니다.

`pnpm dev:all` 실행 시에는 현재 익명친구/카드 두 버전이 각각 다른 포트로 동시에 기동됩니다.

- 익명친구: `EXPO_PUBLIC_MOBILE_VARIANT=anonymous` (기본 포트: `MOBILE_PORT` 또는 자동 탐색값)
- 카드서비스: `EXPO_PUBLIC_MOBILE_VARIANT=card` (기본 포트: `MOBILE_CARD_PORT` 또는 자동 탐색값)

익명친구 앱은 기본적으로 `EXPO_PUBLIC_SKIP_ANONYMOUS_CHAT_PHONE_AUTH=true`로 전화번호 인증 스킵 상태에서 실행됩니다.
카드서비스는 인증 흐름을 유지하려면 값은 false로 두거나 미설정하세요.

웹 브라우저에서 실행할 때는 모바일 화면 사이즈로 고정 검증되도록, 루트 레이아웃에서
아이폰 14 Pro 기준(393x852) 프리뷰 프레임을 적용했습니다.
해상도/프레임 관련 설정은 `apps/mobile/src/lib/mobile-preview.ts` 에서 일괄 관리됩니다.

원하면 직접 포트를 지정해서 실행해도 됩니다:

```bash
MOBILE_PORT=8081 MOBILE_CARD_PORT=8082 pnpm dev:all
```

개별 실행 예시:

```bash
pnpm dev:mobile:anonymous        # 익명친구 개발 서버
pnpm dev:mobile:anonymous:android # 익명친구 Android
pnpm dev:mobile:card             # 카드서비스 개발 서버
pnpm dev:mobile:card:android     # 카드서비스 Android
```

## Internal Structure

- `app`: Expo Router routes
- `src/components`: reusable native UI
- `src/features`: feature slices
- `src/services`: API clients and mobile orchestration
- `src/providers`: app providers
- `src/theme`: native theme mapping
