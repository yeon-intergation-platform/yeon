"use client";
import {
  YeonButton,
  YeonField,
  YeonSurface,
  YeonText,
  YeonLabel,
  YeonView,
  YeonOption,
} from "@yeon/ui";
import {
  WRITABLE_CATEGORIES,
  type WritableCommunityCategory,
} from "../community-post-format";

export function FeedWriteControl(props: {
  isWriteOpen: boolean;
  onToggleWrite: () => void;
}) {
  const { isWriteOpen, onToggleWrite } = props;

  return (
    <YeonSurface className="p-3">
      <YeonView className="flex flex-wrap items-center justify-between gap-3">
        <YeonView>
          <YeonText
            as="h3"
            variant="unstyled"
            tone="inherit"
            className="text-[14px] font-black tracking-[-0.02em] text-[#111]"
          >
            새 글
          </YeonText>
        </YeonView>
        <YeonButton
          type="button"
          variant="primary"
          onClick={onToggleWrite}
          className="h-10 px-4 text-[14px] font-bold"
          aria-expanded={isWriteOpen}
        >
          글쓰기
        </YeonButton>
      </YeonView>
    </YeonSurface>
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
    <YeonSurface
      as="form"
      variant="panel"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="p-3"
    >
      <YeonField
        as="textarea"
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={400}
        className="resize-y text-[15px] leading-[1.55]"
      />
      <YeonView className="mt-3 flex items-center justify-between gap-2">
        <YeonText variant="caption" tone="secondary">
          {draft.length}/400
        </YeonText>
        <YeonView className="flex gap-2">
          <YeonButton type="button" size="sm" onClick={onCancel}>
            취소
          </YeonButton>
          <YeonButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={isSubmitting || !draft.trim()}
          >
            {isSubmitting ? "저장 중" : "저장"}
          </YeonButton>
        </YeonView>
      </YeonView>
    </YeonSurface>
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
    <YeonSurface
      as="form"
      className="mt-4 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <YeonLabel htmlFor={`community-reply-${postId}`} className="sr-only">
        댓글 입력
      </YeonLabel>
      <YeonField
        as="textarea"
        id={`community-reply-${postId}`}
        value={replyDraft}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        maxLength={400}
        placeholder="댓글을 입력하세요"
        className="min-h-[58px] resize-y border-0 bg-transparent text-[15px] leading-[1.5]"
      />
      <YeonView className="mt-2 flex justify-end">
        <YeonButton
          type="submit"
          size="sm"
          variant="primary"
          className="h-9 px-4"
          disabled={isSubmitting || !replyDraft.trim()}
        >
          {isSubmitting ? "게시 중" : "댓글"}
        </YeonButton>
      </YeonView>
    </YeonSurface>
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
    <YeonSurface
      as="form"
      variant="panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mt-3 p-4"
    >
      <YeonView className="flex flex-wrap items-center justify-between gap-3">
        <YeonField
          as="select"
          value={category}
          onChange={(event) =>
            onChangeCategory(event.target.value as WritableCommunityCategory)
          }
          className="h-10 w-auto text-[13px] font-bold"
          aria-label="카테고리"
        >
          {WRITABLE_CATEGORIES.map((item) => (
            <YeonOption key={item} value={item}>
              {item}
            </YeonOption>
          ))}
        </YeonField>
        <YeonView className="flex gap-2">
          <YeonButton type="button" size="sm" onClick={onCancel}>
            취소
          </YeonButton>
          <YeonButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={isCreatingPost || !title.trim() || !content.trim()}
          >
            {isCreatingPost ? "게시 중" : "게시"}
          </YeonButton>
        </YeonView>
      </YeonView>
      <YeonField
        value={title}
        onChange={(event) => onChangeTitle(event.target.value)}
        placeholder="제목을 입력하세요"
        maxLength={80}
        className="mt-4 h-11 text-[15px] font-semibold"
      />
      <YeonField
        as="textarea"
        value={content}
        onChange={(event) => onChangeContent(event.target.value)}
        placeholder="내용을 입력하세요"
        rows={4}
        maxLength={280}
        className="mt-2 resize-y text-[15px] leading-[1.55]"
      />
      <YeonText
        variant="caption"
        tone="secondary"
        className="mt-2 text-right font-semibold"
      >
        {title.length + content.length}/360
      </YeonText>
    </YeonSurface>
  );
}
