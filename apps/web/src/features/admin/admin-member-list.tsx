import { type UserDto } from "@yeon/api-contract/users";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";

const ADMIN_ROLE = "admin" as const;

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

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === ADMIN_ROLE;

  return (
    <YeonText
      as="span"
      variant="unstyled"
      tone="inherit"
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[12px] font-bold",
        isAdmin ? "bg-[#111] text-white" : "bg-[#fafafa] text-[#666]",
      ].join(" ")}
    >
      {role}
    </YeonText>
  );
}

export function AdminMemberList({ users }: { users: UserDto[] }) {
  const totalCount = users.length;
  const adminCount = users.filter((user) => user.role === ADMIN_ROLE).length;

  return (
    <YeonView
      as="section"
      className="mx-auto max-w-[1200px] px-6 py-10 text-[#111] md:px-12"
    >
      <YeonView className="grid gap-4 md:grid-cols-3">
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
            {totalCount.toLocaleString("ko-KR")}
          </YeonText>
        </YeonView>
        <YeonView className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            admin users
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[32px] font-black tracking-[-0.04em]"
          >
            {adminCount.toLocaleString("ko-KR")}
          </YeonText>
        </YeonView>
        <YeonView className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            scope
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-4 text-[14px] font-semibold leading-6 text-[#666]"
          >
            1차 회원관리는 읽기 전용입니다. 정보 수정, 권한 변경, 상세 화면은
            제공하지 않습니다.
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
            회원 목록
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text13Secondary + " mt-1"}
          >
            이메일, 표시 이름, 권한, 가입일, 최근 로그인 기준으로 가입 현황을
            확인합니다.
          </YeonText>
        </YeonView>

        {users.length === 0 ? (
          <YeonView className="px-5 py-16 text-center text-[14px] text-[#666]">
            아직 표시할 회원이 없습니다.
          </YeonView>
        ) : (
          <YeonView className="overflow-x-auto">
            <YeonView
              as="table"
              className="w-full min-w-[860px] border-collapse text-left text-[14px]"
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
                    role
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    가입일
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    최근 로그인
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
                    <YeonView as="td" className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNullableDateTime(user.createdAt)}
                    </YeonView>
                    <YeonView as="td" className="px-5 py-4 text-[#666]">
                      {formatNullableDateTime(user.lastLoginAt)}
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
