import type { UserDto } from "@yeon/api-contract/users";

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
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[12px] font-bold",
        isAdmin ? "bg-[#111] text-white" : "bg-[#f2f2f2] text-[#555]",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

export function AdminMemberList({ users }: { users: UserDto[] }) {
  const totalCount = users.length;
  const adminCount = users.filter((user) => user.role === ADMIN_ROLE).length;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-10 text-[#111] md:px-12">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#888]">
            total users
          </p>
          <p className="mt-3 text-[32px] font-black tracking-[-0.04em]">
            {totalCount.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#888]">
            admin users
          </p>
          <p className="mt-3 text-[32px] font-black tracking-[-0.04em]">
            {adminCount.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#888]">
            scope
          </p>
          <p className="mt-4 text-[14px] font-semibold leading-6 text-[#555]">
            1차 회원관리는 읽기 전용입니다. 정보 수정, 권한 변경, 상세 화면은
            제공하지 않습니다.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white">
        <div className="border-b border-[#e5e5e5] px-5 py-4">
          <h2 className="text-[18px] font-black tracking-[-0.03em]">
            회원 목록
          </h2>
          <p className="mt-1 text-[13px] text-[#777]">
            이메일, 표시 이름, 권한, 가입일, 최근 로그인 기준으로 가입 현황을
            확인합니다.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-16 text-center text-[14px] text-[#777]">
            아직 표시할 회원이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
              <thead className="bg-[#fafafa] text-[12px] uppercase tracking-[0.12em] text-[#777]">
                <tr>
                  <th className="px-5 py-3 font-bold">이메일</th>
                  <th className="px-5 py-3 font-bold">표시 이름</th>
                  <th className="px-5 py-3 font-bold">role</th>
                  <th className="px-5 py-3 font-bold">가입일</th>
                  <th className="px-5 py-3 font-bold">최근 로그인</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-[#eeeeee]">
                    <td className="px-5 py-4 font-semibold text-[#111]">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {formatDisplayName(user.displayName)}
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {formatNullableDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {formatNullableDateTime(user.lastLoginAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
