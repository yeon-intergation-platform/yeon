# @yeon/ui

Universal UI package for Yeon card-service, typing-service, and community.

- Web entry: React DOM/RNW-compatible components for Next.js (`@yeon/ui` or `@yeon/ui/web`).
- Native entry: React Native primitives for Expo (`@yeon/ui/native`, and the `react-native` export condition).
- Primitive subpaths such as `@yeon/ui/primitives/YeonButton` are server-safe for Next.js RSC imports.
- Client/runtime subpaths such as `@yeon/ui/runtime/YeonBrowserRuntime` and `@yeon/ui/hooks/YeonBrowserHooks` stay opt-in so server routes do not import browser hooks accidentally.
- Tokens come from `@yeon/design-tokens`; do not introduce raw service colors here.
- Counseling workspace is intentionally excluded from this migration.

## NativeWind/RNW wiring

- `apps/mobile` owns the NativeWind Metro/Babel/Tailwind wiring and imports `global.css` from the Expo root layout.
- `apps/web` keeps Next.js for SSR/SEO, aliases `react-native` to `react-native-web`, transpiles `@yeon/ui`, `nativewind`, and `react-native-css-interop`, and includes `packages/ui` in Tailwind content scanning.
- `@yeon/design-tokens/tailwind-preset` is the shared Tailwind/NativeWind token preset; app configs should extend that preset instead of duplicating ad-hoc colors.

## Current M1 primitives

- `YeonButton`
- `YeonCanvas`
- `YeonAudio`
- `YeonBrandIcon`
- `YeonBadge`
- `YeonSurface`
- `YeonText`
- `YeonField`
- `YeonCheckbox`
- `YeonSwitch`
- `YeonLabel`
- `YeonForm`
- `YeonView`
- `YeonList`
- `YeonTable`
- `YeonModal`
- `YeonOption`
- `YeonIcon`
- `YeonPositionedButton`
- `YeonSpriteFrame`
- `YeonProgressBar`
- `YeonOgImageFrame`

The package is additive while screens are migrated route-by-route.
