// 온라인 카드방 2-browser 라이브 E2E (skip-gate: RUN_CARD_ROOM_ONLINE_E2E=1).
//
// 격리 스택 기동 레시피(사용자 dev 포트 8081/3000/2567/5432와 충돌 금지):
//   postgres: 기존 yeon-local-postgres(5432) 재사용.
//   spring(18081):
//     cd apps/backend && source ~/.sdkman/bin/sdkman-init.sh && \
//     AUTH_SECRET=local-dev-e2e-auth-secret-0123456789abcdef \
//     SPRING_INTERNAL_TOKEN=local-dev-internal-token SPRING_PROFILES_ACTIVE=dev.local \
//     DATABASE_URL=postgresql://yeon_local:yeon_local@localhost:5432/yeon_local \
//     CARD_ASSET_LOCAL_FALLBACK=true ./gradlew bootRun --args='--server.port=18081' --no-daemon
//   race-server(12567):
//     cd apps/race-server && PORT=12567 SPRING_BACKEND_BASE_URL=http://127.0.0.1:18081 \
//     SPRING_INTERNAL_TOKEN=local-dev-internal-token pnpm dev
//   web(3100): NEXT_PUBLIC_RACE_SERVER_URL은 빌드 시 인라인되므로 빌드/기동 양쪽에 주입한다.
//     사용자 dev 서버(3000)와 같은 디렉터리 락 충돌을 피하려고 prod 빌드+start로 띄운다:
//     cd apps/web && NEXT_PUBLIC_RACE_SERVER_URL=ws://localhost:12567 \
//     SPRING_BACKEND_BASE_URL=http://127.0.0.1:18081 SPRING_INTERNAL_TOKEN=local-dev-internal-token \
//     pnpm build && PORT=3100 NEXT_PUBLIC_RACE_SERVER_URL=ws://localhost:12567 \
//     SPRING_BACKEND_BASE_URL=http://127.0.0.1:18081 SPRING_INTERNAL_TOKEN=local-dev-internal-token \
//     pnpm exec next start -p 3100
//   실행:
//     cd apps/web && RUN_CARD_ROOM_ONLINE_E2E=1 CARD_ROOM_WEB_BASE_URL=http://localhost:3100 \
//     RACE_SERVER_HTTP_URL=http://localhost:12567 \
//     pnpm exec playwright test e2e/card-room-online.spec.ts --project=chromium --reporter=line
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

const RUN_CARD_ROOM_ONLINE_E2E = process.env.RUN_CARD_ROOM_ONLINE_E2E === "1";
const WEB_BASE = process.env.CARD_ROOM_WEB_BASE_URL ?? "http://localhost:3100";
const RACE_HTTP = process.env.RACE_SERVER_HTTP_URL ?? "http://localhost:12567";
const ROOMS_PATH = "/card-service/rooms";

const HOST_NAME = `카드호스트 ${Date.now().toString(36)}`;
const CHECKER_NAME = `카드체커 ${Date.now().toString(36)}`;

// 게스트 덱 시드: guest-card-service-store.ts의 DB_NAME/DB_VERSION/objectStore 구조와 정확히 일치해야
// listGuestDecks / getGuestDeckDetail가 읽어낸다(decks keyPath=publicId + by-created-at,
// items keyPath=publicId + by-deck 인덱스).
const GUEST_DECK = {
  publicId: `e2e-deck-${Date.now().toString(36)}`,
  title: "E2E 카드방 덱",
  cards: [
    { frontText: "사과는 영어로?", backText: "apple" },
    { frontText: "바나나는 영어로?", backText: "banana" },
  ],
} as const;

async function setCardRoomIdentity(
  context: BrowserContext,
  nickname: string,
  guestId: string
) {
  await context.addInitScript(
    ({ nickname: name, guestId: id }) => {
      window.localStorage.setItem("yeon-card-room-guest-id", id);
      window.localStorage.setItem(
        "yeon-card-room-profile",
        JSON.stringify({ nickname: name, characterId: "camel" })
      );
    },
    { nickname, guestId }
  );
}

// 호스트 컨텍스트에만 게스트 덱(덱1 + 카드2)을 idb에 직접 주입한다.
async function seedGuestDeck(page: Page) {
  await page.evaluate(
    async ({ deck }) => {
      const DB_NAME = "yeon-guest-card-service";
      const DB_VERSION = 2;
      const nowIso = new Date().toISOString();

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("decks")) {
            const decks = database.createObjectStore("decks", {
              keyPath: "publicId",
            });
            decks.createIndex("by-created-at", "createdAt");
          }
          if (!database.objectStoreNames.contains("items")) {
            const items = database.createObjectStore("items", {
              keyPath: "publicId",
            });
            items.createIndex("by-deck", "deckPublicId");
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["decks", "items"], "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore("decks").put({
          publicId: deck.publicId,
          title: deck.title,
          description: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        const itemsStore = tx.objectStore("items");
        deck.cards.forEach((card, index) => {
          itemsStore.put({
            publicId: `${deck.publicId}-item-${index}`,
            deckPublicId: deck.publicId,
            frontText: card.frontText,
            backText: card.backText,
            imageStorageKey: null,
            reviewDifficulty: null,
            lastReviewedAt: null,
            nextReviewAt: null,
            // createdAt를 index별로 미세 증가시켜 카드 정렬 순서를 고정한다.
            createdAt: new Date(Date.now() + index).toISOString(),
            updatedAt: nowIso,
          });
        });
      });
      db.close();
    },
    { deck: GUEST_DECK }
  );
}

async function createContext(
  browser: Browser,
  nickname: string,
  guestId: string
) {
  const context = await browser.newContext();
  await setCardRoomIdentity(context, nickname, guestId);
  const page = await context.newPage();
  return { context, page };
}

// 방 생성 응답(cardRoomResponseSchema)에는 participantToken이 없어 호스트는 토큰 없이
// 실시간에 입장하려다 거부될 수 있다. 호스트가 방에 도착한 뒤 participant 세션값을 비우고
// 새로고침하면 방 화면이 joinCardRoom을 호출해 동일 게스트로 재입장하면서 토큰을 발급받는다.
// (백엔드 joinRoom은 같은 정체성에 대해 멱등이며 기존 호스트 participant + 토큰을 반환한다.)
async function forceTokenBearingJoin(page: Page, roomUrl: string) {
  const roomId = roomUrl.split("/").pop() ?? "";
  await page.evaluate((id) => {
    window.sessionStorage.removeItem(`yeon-card-room-participant:${id}`);
    window.sessionStorage.removeItem(`yeon-card-room-participant-token:${id}`);
  }, roomId);
  await page.reload();
}

test.describe("온라인 카드방 2-browser 검증", () => {
  test.skip(
    !RUN_CARD_ROOM_ONLINE_E2E,
    "Set RUN_CARD_ROOM_ONLINE_E2E=1 after starting an isolated web + race-server + backend stack."
  );

  test("host와 checker가 실시간으로 학습을 진행해 종료까지 도달한다", async ({
    browser,
    request,
  }) => {
    const raceHealth = await request.get(`${RACE_HTTP}/health`);
    expect(
      raceHealth.ok(),
      "race-server /health should respond before browser flow"
    ).toBeTruthy();

    const webHealth = await request.get(`${WEB_BASE}${ROOMS_PATH}`);
    expect(
      webHealth.ok(),
      "web card room lobby page should respond before browser flow"
    ).toBeTruthy();

    const host = await createContext(browser, HOST_NAME, "guest_e2e_host");
    const checker = await createContext(
      browser,
      CHECKER_NAME,
      "guest_e2e_checker"
    );

    try {
      // 1) 호스트: 정체성 + 게스트 덱 시드 후 로비 진입.
      await host.page.goto(`${WEB_BASE}${ROOMS_PATH}`);
      await seedGuestDeck(host.page);
      await host.page.reload();

      await host.page
        .getByRole("button", { name: "카드방 만들기" })
        .first()
        .click();

      // 생성 다이얼로그: 방 제목 입력 + 기본 덱(decks[0]) 사용.
      const roomTitle = `E2E 카드방 ${Date.now()}`;
      await host.page.getByLabel("방 제목").fill(roomTitle);
      await expect(
        host.page.getByRole("button", { name: "카드방 만들고 입장하기" })
      ).toBeEnabled({ timeout: 10_000 });
      await host.page
        .getByRole("button", { name: "카드방 만들고 입장하기" })
        .click();

      // 2) 방 상세로 이동했는지 확인 후 roomUrl 확보.
      await host.page.waitForURL(/\/card-service\/rooms\/[^/]+$/, {
        timeout: 15_000,
      });
      const roomUrl = host.page.url();
      // 호스트에게 토큰 발급용 재입장을 강제해 실시간 연결을 성립시킨다.
      await forceTokenBearingJoin(host.page, roomUrl);
      await expect(
        host.page.getByText(HOST_NAME, { exact: true }).first()
      ).toBeVisible({ timeout: 15_000 });

      // 3) 체커: 같은 roomUrl로 자동 입장(서버 nextRole로 CHECKER 배정).
      await checker.page.goto(roomUrl);
      await expect(
        checker.page.getByText(CHECKER_NAME, { exact: true }).first()
      ).toBeVisible({ timeout: 15_000 });
      // 호스트/체커 모두 상대 닉네임이 참가자 목록에 보인다.
      await expect(
        host.page.getByText(CHECKER_NAME, { exact: true }).first()
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        checker.page.getByText(HOST_NAME, { exact: true }).first()
      ).toBeVisible({ timeout: 15_000 });

      // 4) 역할 보정: 호스트=외우는 사람, 체커=봐주는 사람.
      //    헤더 역할 토글(외우는 사람/봐주는 사람)로 결정적으로 맞춘다.
      await host.page
        .getByRole("button", { name: "외우는 사람", exact: true })
        .first()
        .click();
      await checker.page
        .getByRole("button", { name: "봐주는 사람", exact: true })
        .first()
        .click();

      // 7) 가드(선택적): 준비 전에는 호스트 학습 시작 버튼이 비활성.
      await expect(
        host.page.getByRole("button", { name: "학습 시작" })
      ).toBeDisabled();

      // 5) 양쪽 모두 준비 상태로 만든다.
      //    호스트는 방 생성 시 이미 isReady=true(준비 완료)일 수 있으므로,
      //    "준비하기"가 보일 때만 클릭한다(준비 완료를 다시 눌러 해제하지 않도록).
      await checker.page
        .getByRole("button", { name: "준비하기", exact: true })
        .click();
      const hostReadyButton = host.page.getByRole("button", {
        name: "준비하기",
        exact: true,
      });
      if (await hostReadyButton.isVisible().catch(() => false)) {
        await hostReadyButton.click();
      }

      // 6) 전원 준비 + memorizer&checker 존재 → 호스트 학습 시작 활성화 후 시작.
      await expect(
        host.page.getByRole("button", { name: "학습 시작" })
      ).toBeEnabled({ timeout: 15_000 });
      await host.page.getByRole("button", { name: "학습 시작" }).click();

      // 8) 카드1 진행: 체커가 정답 공개 → 뒷면 노출 → 체커 OK 확정.
      const revealButton = checker.page.getByRole("button", {
        name: /클릭해서 정답 공개/,
      });
      await expect(revealButton).toBeVisible({ timeout: 15_000 });
      await revealButton.click();
      // 뒷면(첫 카드 backText)이 노출되는지 확인.
      await expect(
        checker.page.getByText(GUEST_DECK.cards[0]!.backText).first()
      ).toBeVisible({ timeout: 10_000 });
      await checker.page
        .getByRole("button", { name: "OK", exact: true })
        .click();

      // 9) 결과 확정 → 호스트가 다음 카드로.
      await expect(
        host.page.getByRole("button", { name: "다음 카드" })
      ).toBeVisible({ timeout: 15_000 });
      await host.page.getByRole("button", { name: "다음 카드" }).click();

      // 10) 카드2: 외우는 사람(호스트)이 포기 → 확정 → 결과 보기 → 종료.
      await expect(
        host.page.getByText(GUEST_DECK.cards[1]!.frontText).first()
      ).toBeVisible({ timeout: 15_000 });
      await host.page
        .getByRole("button", { name: "포기", exact: true })
        .click();
      await expect(
        host.page.getByRole("button", { name: "결과 보기" })
      ).toBeVisible({ timeout: 15_000 });
      await host.page.getByRole("button", { name: "결과 보기" }).click();

      // 11) 양 브라우저에서 종료/결과 화면 단언(FINISHED → "학습 완료").
      await expect(
        host.page.getByRole("heading", { name: "학습 완료" })
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        checker.page.getByRole("heading", { name: "학습 완료" })
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await host.context.close();
      await checker.context.close();
    }
  });
});
