// 모바일 카드 아이템 Repository 어댑터 (YeonCardItemRepository 포트 구현).
//
// 게스트/서버 분기를 흡수한다. bulk 카드 생성은 모바일에 bulk 엔드포인트가 없어 기존처럼
// createCardDeckItem 루프로 처리한다(동작 보존). 세션은 화면 상태에서 주입받는다.
import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";

import { createMobileGuestCardItemRepository } from "./card-item-guest-repository";
import {
  resolveMobileCardSessionToken,
  type MobileCardSession,
} from "./card-item-session";
import { createMobileServerCardItemRepository } from "./card-item-server-repository";

export type { MobileCardSession } from "./card-item-session";

export function createMobileCardItemRepository(
  session: MobileCardSession
): YeonCardItemRepository {
  const token = resolveMobileCardSessionToken(session);
  return token
    ? createMobileServerCardItemRepository(token)
    : createMobileGuestCardItemRepository();
}
