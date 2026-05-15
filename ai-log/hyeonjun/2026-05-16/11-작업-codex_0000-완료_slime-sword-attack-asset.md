# 슬라임 검 공격 에셋 개선 작업 로그

## 목표

- `/slime-game` 공격 모션이 팔을 뒤로 휘두르는 것처럼 보이지 않게 새 검 베기 에셋을 추가한다.
- J 키 공격이 실제 검을 휘두르는 시각 피드백으로 보이게 한다.

## 변경

- `sword_slash_attack.svg` 투명 검/슬래시 에셋을 추가했다.
- attack action 중 슬라임 앞쪽에 검 베기 에셋을 합성하도록 stage를 수정했다.
- 에셋 manifest와 attack 설명을 검 베기 합성 기준으로 갱신했다.
- 몬스터, 데미지, 히트박스, 원거리 판정은 추가하지 않았다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- Playwright(headless Chromium)로 `http://localhost:3000/slime-game`에서 `KeyJ` 입력 후 `data-testid="slime-sword-attack-effect"` 노출을 확인했다.
- Playwright 스크린샷: `/tmp/slime-sword-attack-localhost-headless.png`.

## 결과

- PR 생성/머지 예정.
