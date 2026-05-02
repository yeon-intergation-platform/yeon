# pets anime 22개 yeon raw 이관 + asuna(IP) 제거 [완료]

- 시간: 2026-05-03 06:39 → 06:40
- 주체: claude
- 출처: `~/OneDrive-Linux/Downloads/pets/anime/` (24개)
- 대상: `~/coding_stuffs/yeon/scripts/sprites/raw/pets/`, `~/coding_stuffs/yeon/apps/web/{public/sprites/characters,src/features/typing-service/characters/data}/`

## 작업 결과

### (1) 22개 pet 압축 풀어 raw/pets/로 이관

- 제외: `linnea` (yeon에 이미 등록됨), `thorny-shadow-v1` (사용자 지정 제외)
- 위치: `scripts/sprites/raw/pets/<id>/{spritesheet.webp, pet.json}`
- gitignore 적용: `scripts/sprites/raw/*` 이미 무시 (코드/PR에 안 잡힘)

이관된 22개 id:

```
amane, bluebell, cleria, diana, femme-soule, gopal, guga, hearthling,
kana, karen-chan, kumite-champ, mecha-rex, meizon, merry,
naruebi-chan-sansei, oguri, sakura, samo, senninha, skullfire,
tata-cat, yuki
```

### (2) asuna 캐릭터 IP 사유 제거

- `data/asuna.json` 삭제
- `public/sprites/characters/asuna/` 삭제
- `node scripts/build-character-registry.mjs` 실행 → registry 재생성
- 결과: 등록 캐릭터 3 → 2 (`camel`, `linnea` 잔류)

## 검증

- `data/`: `camel.json`, `linnea.json` 만 존재 ✓
- `public/sprites/characters/`: `camel`, `linnea` 만 존재 ✓
- `registry.generated.ts` head: `[character-registry] generated 2 characters` 로그 + camel/linnea 두 항목만 출력 확인 ✓

## 결정 / 메모

- raw 안에서 codex 명칭 제외하고 `pets/` 이름 사용 (사용자 지시: "코덱스랑 우리서비스는 관련 없음").
- yeon의 extract 파이프라인은 `<id>/spritesheet.webp` 를 raw 하위에서 읽도록 설계되어 있어, 추후 22개 중 사용할 캐릭터를 등록할 때 `data/<id>.json`에 `extract.rawSheet: "pets/<id>/spritesheet.webp"` 형태로 명시하면 호환됨.
- pet.json 메타 (id/displayName/description/spritesheetPath)도 함께 풀어둠 — 추후 등록 시 displayName/description 참고 가능.
- 출처 zip은 `~/OneDrive-Linux/Downloads/pets/anime/` 그대로 보존 (yeon에는 풀어진 결과물만).
- linnea/thorny-shadow-v1 zip도 `pets/anime/` 에 그대로 잔류.

## 후속 액션 (사용자 결정 필요)

- 이관된 22개 중 어느 것을 실제 캐릭터로 등록할지 → `data/<id>.json` 작성 + extract 스크립트 실행 흐름은 개별 작업으로 분리.
- pet zip의 spritesheet.webp는 9×8 chibi layout이 아닐 가능성 → 등록 시 layout 확인 후 extract 스크립트 인자/JSON에 반영 필요.
