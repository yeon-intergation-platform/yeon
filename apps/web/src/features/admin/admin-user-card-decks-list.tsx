import type { AdminCardDeckItem } from "@yeon/api-contract/user-experience";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

function formatNullableDateTime(value: string | null) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

export function AdminUserCardDecksList({
  cardDecks,
}: {
  cardDecks: AdminCardDeckItem[];
}) {
  return (
    <YeonView
      as="section"
      className="mx-auto max-w-[1200px] px-6 py-10 text-[#111] md:px-12"
    >
      <YeonView className="overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white">
        <YeonView className="border-b border-[#e5e5e5] px-5 py-4">
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[18px] font-black tracking-[-0.03em]"
          >
            카드덱 목록
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Secondary + " mt-1"}
          >
            이 사용자가 만든 카드덱의 제목, 카드 수, 생성일을 확인합니다.
          </YeonText>
        </YeonView>

        {cardDecks.length === 0 ? (
          <YeonView className="px-5 py-16 text-center text-[14px] text-[#666]">
            아직 만든 카드덱이 없습니다.
          </YeonView>
        ) : (
          <YeonView className="overflow-x-auto">
            <YeonView
              as="table"
              className="w-full min-w-[720px] border-collapse text-left text-[14px]"
            >
              <YeonView
                as="thead"
                className="bg-[#fafafa] text-[12px] uppercase tracking-[0.12em] text-[#666]"
              >
                <YeonView as="tr">
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    제목
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    카드 수
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    생성일
                  </YeonView>
                </YeonView>
              </YeonView>
              <YeonView as="tbody">
                {cardDecks.map((deck) => (
                  <YeonView
                    as="tr"
                    key={deck.id}
                    className="border-t border-[#e5e5e5]"
                  >
                    <YeonView
                      as="td"
                      className="px-5 py-4 font-semibold text-[#111]"
                    >
                      {deck.title}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNumber(deck.itemCount)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNullableDateTime(deck.createdAt)}
                    </YeonView>
                  </YeonView>
                ))}
              </YeonView>
            </YeonView>
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
