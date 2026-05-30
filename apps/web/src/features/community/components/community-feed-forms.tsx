"use client";

import {
  WRITABLE_CATEGORIES,
  type WritableCommunityCategory,
} from "../community-post-format";

export function FeedGuestIdentityRow(props: {
  guestNickname: string;
  guestPassword: string;
  isWriteOpen: boolean;
  onChangeNickname: (value: string) => void;
  onChangePassword: (value: string) => void;
  onToggleWrite: () => void;
}) {
  const {
    guestNickname,
    guestPassword,
    isWriteOpen,
    onChangeNickname,
    onChangePassword,
    onToggleWrite,
  } = props;

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_104px] sm:items-end">
        <label className="text-[12px] font-semibold text-[#4b5563]">
          게스트 닉네임
          <input
            value={guestNickname}
            onChange={(event) => onChangeNickname(event.target.value)}
            placeholder="닉네임 입력"
            maxLength={40}
            className="mt-1 h-10 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[14px] font-normal text-[#111827] outline-none transition-colors focus:border-[#111827]"
          />
        </label>
        <label className="text-[12px] font-semibold text-[#4b5563]">
          비밀번호
          <input
            value={guestPassword}
            onChange={(event) => onChangePassword(event.target.value)}
            placeholder="수정/삭제용 비밀번호"
            type="password"
            maxLength={128}
            className="mt-1 h-10 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[14px] font-normal text-[#111827] outline-none transition-colors focus:border-[#111827]"
          />
        </label>
        <button
          type="button"
          onClick={onToggleWrite}
          className="h-10 rounded-xl bg-[#111827] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#374151]"
          aria-expanded={isWriteOpen}
        >
          글쓰기
        </button>
      </div>
      <p className="mt-2 text-[11px] font-normal text-[#9ca3af]">
        자동 생성된 게스트 닉네임이에요. 직접 바꿀 수 있고, 비밀번호는 글
        수정·삭제에 사용해요.
      </p>
    </div>
  );
}

export function FeedPostEditForm(props: {
  draft: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}) {
  const { draft, isSubmitting, onChange, onCancel, onSubmit } = props;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-3"
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={400}
        className="w-full resize-y rounded-xl border border-[#d1d5db] bg-white px-3 py-3 text-[15px] leading-[1.55] text-[#111827] outline-none transition-colors focus:border-[#111827]"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[12px] text-[#6b7280]">{draft.length}/400</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#d1d5db] px-4 py-2 text-[13px] font-bold text-[#111827] transition-colors hover:bg-white"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !draft.trim()}
            className="rounded-xl bg-[#111827] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
          >
            {isSubmitting ? "저장 중" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function FeedPostReplyForm(props: {
  postId: string;
  replyDraft: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const { postId, replyDraft, isSubmitting, onChange, onSubmit } = props;

  return (
    <form
      className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <label htmlFor={`community-reply-${postId}`} className="sr-only">
        댓글 입력
      </label>
      <textarea
        id={`community-reply-${postId}`}
        value={replyDraft}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        maxLength={400}
        placeholder="댓글을 입력하세요"
        className="min-h-[58px] w-full resize-y border-0 bg-transparent text-[15px] leading-[1.5] text-[#111827] outline-none placeholder:text-[#9ca3af]"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="h-9 rounded-xl bg-[#111827] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
          disabled={isSubmitting || !replyDraft.trim()}
        >
          {isSubmitting ? "게시 중" : "댓글"}
        </button>
      </div>
    </form>
  );
}

export function WritePostPanel(props: {
  category: WritableCommunityCategory;
  title: string;
  content: string;
  isCreatingPost: boolean;
  onChangeCategory: (value: WritableCommunityCategory) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const {
    category,
    title,
    content,
    isCreatingPost,
    onChangeCategory,
    onChangeTitle,
    onChangeContent,
    onCancel,
    onSubmit,
  } = props;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mt-3 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={category}
          onChange={(event) =>
            onChangeCategory(event.target.value as WritableCommunityCategory)
          }
          className="h-10 rounded-xl border border-[#d1d5db] bg-white px-3 text-[13px] font-bold text-[#111827] outline-none transition-colors focus:border-[#111827]"
          aria-label="카테고리"
        >
          {WRITABLE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#d1d5db] bg-white px-4 py-2 text-[13px] font-bold text-[#111827] transition-colors hover:bg-[#f3f4f6]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreatingPost || !title.trim() || !content.trim()}
            className="rounded-xl bg-[#111827] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#374151] disabled:bg-[#d1d5db]"
          >
            {isCreatingPost ? "게시 중" : "게시"}
          </button>
        </div>
      </div>
      <input
        value={title}
        onChange={(event) => onChangeTitle(event.target.value)}
        placeholder="제목을 입력하세요"
        maxLength={80}
        className="mt-4 h-11 w-full rounded-xl border border-[#d1d5db] bg-white px-3 text-[15px] font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#111827]"
      />
      <textarea
        value={content}
        onChange={(event) => onChangeContent(event.target.value)}
        placeholder="내용을 입력하세요"
        rows={4}
        maxLength={280}
        className="mt-2 w-full resize-y rounded-xl border border-[#d1d5db] bg-white px-3 py-3 text-[15px] leading-[1.55] text-[#111827] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#111827]"
      />
      <div className="mt-2 text-right text-[12px] font-semibold text-[#6b7280]">
        {title.length + content.length}/360
      </div>
    </form>
  );
}
