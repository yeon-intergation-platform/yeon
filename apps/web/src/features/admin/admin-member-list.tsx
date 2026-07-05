"use client";
import { useMemo, useState } from "react";
import { type UserDto } from "@yeon/api-contract/users";
import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import type { PlatformLanguage } from "@/lib/platform-language";
import { usePlatformLanguage } from "@/lib/use-platform-language";
import {
  getAdminMemberListText,
  type AdminMemberText,
} from "./admin-member-list-i18n";

const ADMIN_ROLE = "admin" as const;
const USER_ROLE = "user" as const;

type RoleFilter = "all" | typeof ADMIN_ROLE | typeof USER_ROLE;
type Feedback = { type: "ok" | "err"; text: string } | null;

function formatNullableDateTime(value: string | null, locale: string) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDisplayName(value: string | null, fallback: string) {
  return value?.trim() ? value : fallback;
}

function hasKnownRole(
  role: string
): role is typeof ADMIN_ROLE | typeof USER_ROLE {
  return role === ADMIN_ROLE || role === USER_ROLE;
}

function numberText(value: number, locale: string) {
  return value.toLocaleString(locale);
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
  language: PlatformLanguage
) {
  const data = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (language === "ko") {
    return data?.message ?? fallback;
  }

  return fallback;
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <YeonView className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-5">
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
      >
        {label}
      </YeonText>
      <YeonText
        variant="unstyled"
        tone="inherit"
        className="mt-3 text-[32px] font-black tracking-[-0.04em]"
      >
        {value}
      </YeonText>
    </YeonView>
  );
}

export function AdminMemberList({
  currentAdminUserId,
  initialLanguage,
  users: initialUsers,
}: {
  currentAdminUserId: string;
  initialLanguage: PlatformLanguage;
  users: UserDto[];
}) {
  const { language } = usePlatformLanguage(initialLanguage);
  const text: AdminMemberText = getAdminMemberListText(language);
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [displayNameDrafts, setDisplayNameDrafts] = useState(() =>
    Object.fromEntries(
      initialUsers.map((user) => [user.id, user.displayName ?? ""])
    )
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const stats = useMemo(() => {
    const adminCount = users.filter((user) => user.role === ADMIN_ROLE).length;
    return {
      total: users.length,
      admin: adminCount,
      activeSessions: users.reduce((sum, user) => sum + user.sessionCount, 0),
      serviceData: users.reduce(
        (sum, user) => sum + user.cardDeckCount + user.typingDeckCount,
        0
      ),
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        (user.displayName ?? "").toLowerCase().includes(normalizedQuery) ||
        user.id.toLowerCase().includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const replaceUser = (nextUser: UserDto) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === nextUser.id ? nextUser : user))
    );
    setDisplayNameDrafts((prev) => ({
      ...prev,
      [nextUser.id]: nextUser.displayName ?? "",
    }));
  };

  const handleSaveDisplayName = async (user: UserDto) => {
    const actionKey = `name:${user.id}`;
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      const response = await fetchYeon(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: displayNameDrafts[user.id]?.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, text.saveNameFailed, language)
        );
      }
      const data = (await response.json()) as { user: UserDto };
      replaceUser(data.user);
      setFeedback({ type: "ok", text: text.saveNameSuccess });
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.saveNameFailed,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleRoleChange = async (user: UserDto, role: string) => {
    if (!hasKnownRole(role) || role === user.role) return;
    const actionKey = `role:${user.id}`;
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      const response = await fetchYeon(`/api/v1/users/${user.id}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, text.roleFailed, language)
        );
      }
      const data = (await response.json()) as { user: UserDto };
      replaceUser(data.user);
      setFeedback({ type: "ok", text: text.roleSuccess });
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.roleFailed,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleInvalidateSessions = async (user: UserDto) => {
    const actionKey = `sessions:${user.id}`;
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      const response = await fetchYeon(`/api/v1/users/${user.id}/sessions`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, text.sessionsFailed, language)
        );
      }
      const data = (await response.json()) as { invalidatedSessions: number };
      replaceUser({ ...user, sessionCount: 0 });
      setFeedback({
        type: "ok",
        text: text.sessionsSuccess(
          data.invalidatedSessions.toLocaleString(text.locale)
        ),
      });
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.sessionsFailed,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteUser = async (user: UserDto) => {
    const confirmation = window.prompt(text.deletePrompt(user.email));
    if (confirmation !== user.email) return;

    const actionKey = `delete:${user.id}`;
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      const response = await fetchYeon(`/api/v1/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseErrorMessage(response, text.deleteFailed, language)
        );
      }
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setFeedback({ type: "ok", text: text.deleteSuccess });
    } catch (error) {
      setFeedback({
        type: "err",
        text: error instanceof Error ? error.message : text.deleteFailed,
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <YeonView
      as="section"
      className="mx-auto max-w-[1400px] px-6 py-10 text-[#111] md:px-12"
    >
      <YeonView className="grid gap-4 md:grid-cols-4">
        <StatCard
          label={text.stats.total}
          value={numberText(stats.total, text.locale)}
        />
        <StatCard
          label={text.stats.admin}
          value={numberText(stats.admin, text.locale)}
        />
        <StatCard
          label={text.stats.activeSessions}
          value={numberText(stats.activeSessions, text.locale)}
        />
        <StatCard
          label={text.stats.serviceData}
          value={numberText(stats.serviceData, text.locale)}
        />
      </YeonView>

      <YeonView className="mt-6 rounded-3xl border border-[#e5e5e5] bg-white">
        <YeonView className="grid gap-3 border-b border-[#e5e5e5] px-5 py-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <YeonView>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="text-[18px] font-black tracking-[-0.03em]"
            >
              {text.heading}
            </YeonText>
            <YeonText
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Secondary + " mt-1"}
            >
              {text.description}
            </YeonText>
          </YeonView>
          {feedback ? (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#666]"
            >
              {feedback.text}
            </YeonText>
          ) : null}
        </YeonView>

        <YeonView className="grid gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.searchPlaceholder}
            className="h-11 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[14px] outline-none focus:border-[#111]"
          />
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as RoleFilter)
            }
            className="h-11 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[14px] font-semibold text-[#111] outline-none focus:border-[#111]"
          >
            <option value="all">{text.allRoles}</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </YeonView>

        {filteredUsers.length === 0 ? (
          <YeonView className="px-5 py-16 text-center text-[14px] text-[#666]">
            {text.empty}
          </YeonView>
        ) : (
          <YeonView className="overflow-x-auto">
            <YeonView
              as="table"
              className="w-full min-w-[1180px] border-collapse text-left text-[14px]"
            >
              <YeonView
                as="thead"
                className="bg-[#fafafa] text-[12px] uppercase tracking-[0.12em] text-[#666]"
              >
                <YeonView as="tr">
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.member}
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.displayName}
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.role}
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.data}
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.lastLogin}
                  </YeonView>
                  <YeonView as="th" className="px-5 py-3 font-bold">
                    {text.columns.actions}
                  </YeonView>
                </YeonView>
              </YeonView>
              <YeonView as="tbody">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentAdminUserId;
                  const isPending = pendingAction?.endsWith(user.id) ?? false;
                  return (
                    <YeonView
                      as="tr"
                      key={user.id}
                      className="border-t border-[#e5e5e5] align-top"
                    >
                      <YeonView as="td" className="px-5 py-4">
                        <YeonText
                          variant="unstyled"
                          tone="inherit"
                          className="font-semibold text-[#111]"
                        >
                          {user.email}
                        </YeonText>
                        <YeonText
                          variant="unstyled"
                          tone="inherit"
                          className="mt-1 text-[12px] text-[#aaa]"
                        >
                          {user.id}
                        </YeonText>
                        <YeonText
                          variant="unstyled"
                          tone="inherit"
                          className="mt-2 text-[12px] text-[#666]"
                        >
                          {text.joinedAt(
                            formatNullableDateTime(user.createdAt, text.locale)
                          )}
                        </YeonText>
                      </YeonView>
                      <YeonView as="td" className="px-5 py-4">
                        <input
                          value={
                            displayNameDrafts[user.id] ?? user.displayName ?? ""
                          }
                          onChange={(event) =>
                            setDisplayNameDrafts((prev) => ({
                              ...prev,
                              [user.id]: event.target.value,
                            }))
                          }
                          placeholder={formatDisplayName(null, text.noName)}
                          className="h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-[13px] outline-none focus:border-[#111]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDisplayName(user)}
                          disabled={pendingAction === `name:${user.id}`}
                          className="mt-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[12px] font-bold text-[#111] hover:border-[#111] disabled:opacity-50"
                        >
                          {text.save}
                        </button>
                      </YeonView>
                      <YeonView as="td" className="px-5 py-4">
                        <RoleBadge role={user.role} />
                        <select
                          value={
                            hasKnownRole(user.role) ? user.role : USER_ROLE
                          }
                          onChange={(event) =>
                            handleRoleChange(user, event.target.value)
                          }
                          disabled={pendingAction === `role:${user.id}`}
                          className="mt-2 block h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[13px] font-semibold text-[#111] outline-none focus:border-[#111] disabled:opacity-50"
                        >
                          <option value="admin">admin</option>
                          <option value="user">user</option>
                        </select>
                      </YeonView>
                      <YeonView as="td" className="px-5 py-4 text-[#666]">
                        <YeonText variant="unstyled" tone="inherit">
                          {text.sessionSummary(
                            numberText(user.sessionCount, text.locale)
                          )}
                        </YeonText>
                        <YeonText variant="unstyled" tone="inherit">
                          {text.dataSummary(
                            numberText(user.cardDeckCount, text.locale),
                            numberText(user.typingDeckCount, text.locale)
                          )}
                        </YeonText>
                        <YeonText
                          variant="unstyled"
                          tone="inherit"
                          className="mt-2 text-[12px] text-[#aaa]"
                        >
                          {user.identityProviders.length > 0
                            ? user.identityProviders.join(", ")
                            : text.noProviders}
                        </YeonText>
                      </YeonView>
                      <YeonView as="td" className="px-5 py-4 text-[#666]">
                        {formatNullableDateTime(user.lastLoginAt, text.locale)}
                        <YeonText
                          variant="unstyled"
                          tone="inherit"
                          className="mt-2 text-[12px] text-[#aaa]"
                        >
                          {text.emailVerified(
                            formatNullableDateTime(
                              user.emailVerifiedAt,
                              text.locale
                            )
                          )}
                        </YeonText>
                      </YeonView>
                      <YeonView as="td" className="px-5 py-4">
                        <YeonView className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleInvalidateSessions(user)}
                            disabled={pendingAction === `sessions:${user.id}`}
                            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-bold text-[#111] hover:border-[#111] disabled:opacity-50"
                          >
                            {text.invalidateSessions}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isSelf || isPending}
                            title={
                              isSelf ? text.selfDeleteTitle : text.deleteTitle
                            }
                            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-bold text-[#111] hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {text.delete}
                          </button>
                        </YeonView>
                      </YeonView>
                    </YeonView>
                  );
                })}
              </YeonView>
            </YeonView>
          </YeonView>
        )}
      </YeonView>
    </YeonView>
  );
}
