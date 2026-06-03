import type { AdminUserItem } from "@yeon/api-contract/user-experience";
import { YeonLink, YeonText, YeonView } from "@yeon/ui";
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

function formatDisplayName(value: string | null) {
  return value?.trim() ? value : "이름 없음";
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

export function AdminUserExperienceList({ users }: { users: AdminUserItem[] }) {
  const totalCount = users.length;
  const totalDecks = users.reduce((sum, user) => sum + user.cardDeckCount, 0);

  return (
    <YeonView
      as="section"
      className="mx-auto max-w-[1200px] px-6 py-10 text-[#111] md:px-12"
    >
      <YeonView className="grid gap-4 md:grid-cols-2">
        <YeonView className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            total users
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[32px] font-black tracking-[-0.04em]"
          >
            {formatNumber(totalCount)}
          </YeonText>
        </YeonView>
        <YeonView className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            total card decks
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[32px] font-black tracking-[-0.04em]"
          >
            {formatNumber(totalDecks)}
          </YeonText>
        </YeonView>
      </YeonView>

      <YeonView className="mt-6 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white">
        <YeonView className="border-b border-[#e5e5e5] px-5 py-4">
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[18px] font-black tracking-[-0.03em]"
          >
            사용자 · 경험치
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Secondary + " mt-1"}
          >
            레벨, 총 경험치, 카드덱 수를 확인하고 사용자별 카드 상세로
            이동합니다.
          </YeonText>
        </YeonView>

        {users.length === 0 ? (
          <YeonView className="px-5 py-16 text-center text-[14px] text-[#666]">
            아직 표시할 사용자가 없습니다.
          </YeonView>
        ) : (
          <YeonView className="overflow-x-auto">
            <YeonView
              as="table"
              className="w-full min-w-[960px] border-collapse text-left text-[14px]"
            >
              <YeonView
                as="thead"
                className="bg-[#fafafa] text-[12px] uppercase tracking-[0.12em] text-[#666]"
              >
                <YeonView as="tr">
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    이메일
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    표시 이름
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    레벨
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    총 XP
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    카드덱 수
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    가입일
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    상세
                  </YeonView>
                </YeonView>
              </YeonView>
              <YeonView as="tbody">
                {users.map((user) => (
                  <YeonView
                    as="tr"
                    key={user.id}
                    className="border-t border-[#e5e5e5]"
                  >
                    <YeonView
                      as="td"
                      className="px-5 py-4 font-semibold text-[#111]"
                    >
                      {user.email}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatDisplayName(user.displayName)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 font-semibold">
                      {`Lv.${user.level}`}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNumber(user.totalXp)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNumber(user.cardDeckCount)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNullableDateTime(user.createdAt)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4">
                      <YeonLink
                        href={`/admin/users/${user.id}/card-decks`}
                        className={SHARED_FEATURE_CLASS.ghostButtonMd13}
                      >
                        카드 상세
                      </YeonLink>
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
