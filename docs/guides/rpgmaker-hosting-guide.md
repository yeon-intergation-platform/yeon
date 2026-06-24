# RPG Maker 게임 yeon 호스팅 가이드 (MV·MZ·XP·VX·VX Ace·RM2000/2003)

> 게임 허브(game.yeon.world)에 RPG Maker 계열 게임을 **합법적으로** 올리기 위한 환경/절차 문서.
> ⚠️ 법률 자문이 아니라 실무 참고용. 핵심 원칙: **로컬 검증은 자유, 공개 배포는 제작자 허락/CC0 필수.**

## 엔진별 실행 방식 (로컬 검증 완료)

| 엔진 | 스크립트 | 브라우저 실행 방법 | 난이도 |
|---|---|---|---|
| **MV / MZ** | JavaScript | 네이티브 HTML5(pixi.js). `www` 폴더를 그대로 호스팅 | ⭐ |
| **XP / VX / VX Ace** | RGSS(Ruby) | **mkxp-web**(Emscripten/WebAssembly)로 구동 | ⭐⭐⭐ |
| **RM2000 / 2003** | (구세대) | **EasyRPG Player**(WebAssembly)로 구동 | ⭐⭐⭐ |

검증 기록(로컬, 비공개):
- XP 게임을 mkxp-web 런타임으로 **yeon이 직접 서빙하는 URL**에서 실행 확인(타이틀·메뉴까지 렌더).
- MV는 `corescript`(pixi.js 기반)로 HTML5 엔진임을 확인.
- 세 방식 모두 게임 상세의 **`kind: "iframe"`** 으로 `embedUrl`을 self-host한 `index.html`로 가리키면 동작한다(별도 플레이어 컴포넌트 불필요. SWF만 `kind: "swf"` + Ruffle).

## 올리는 절차

1. **(필수) 권리 확인** — 제작자 허락 또는 CC0/퍼블릭도메인/"재배포 허용" 명시.
   - **"무료 다운로드" ≠ "재배포 허락"**. itch 무료 게임도 라이선스를 개별 확인한다.
   - 허락 절차/메일 템플릿: `docs/guides/flash-game-permission-guide.md`.
2. **패키징**
   - MV/MZ: 배포된 `www` 폴더(또는 MZ 루트) 그대로.
   - XP/VX/VXAce: mkxp-web으로 게임을 패키징(런타임+`gameasync` per-game 빌드).
   - RM2000/2003: EasyRPG Player 런타임 + 게임 폴더.
3. **배치**: `apps/web/public/games/{slug}/` 에 둔다(허락받은 게임만).
4. **카탈로그 등록**: `game-catalog.ts`에 `GameEntry` 추가 — `kind: "iframe"`, `embedUrl: "/games/{slug}/index.html"`, 출처(제작/배급) 표기.
5. **검증 → 배포**: 로컬에서 실제 실행 확인 후 commit → PR → main.

## 라이선스 주의 (런타임)

- **mkxp / mkxp-web**: GPL v2+ → 런타임을 함께 배포하면 **GPL 라이선스 고지 + 소스(원본 저장소) 링크** 필요.
- **EasyRPG Player**: GPLv3 → 동일.
- 게임 콘텐츠 저작권은 런타임과 별개로 **각 제작자**에게 있다.

## 로컬 테스트 vs 공개 배포 (경계)

- **로컬(localhost) 검증** = 사적 이용 → 자유. 테스트 런타임/샘플은 `public/games-engine/`에 두고 **`.gitignore`로 커밋 제외**.
- **main 공개(game.yeon.world, 광고 가능)** = 공중송신 → **제작자 허락/CC0 필수**. 무단 게임은 AdSense 정지·DMCA·법적 위험.

## 현재 올라간 게임 (허락받음)

- **만화캐릭RPG3** — SWF/Ruffle, 제작자 바버플금 허락(2026-06-23). `kind: "swf"`.

## 후속

- itch.io 등에서 **CC0/재배포 허용 명시 게임**만 선별해 추가.
- EasyRPG/mkxp 런타임의 공개 배포가 필요한 시점에 GPL 고지 페이지 추가.
