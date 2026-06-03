import type { ChatServiceFeedPostDto } from "@yeon/api-contract/chat-service";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import { useYeonRouter as useRouter } from "@yeon/ui/native";
import { useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonFormIntro as FormIntro,
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonPillBadge as PillBadge,
  YeonPostAuthorHeader as PostAuthorHeader,
  YeonPostFooter as PostFooter,
  YeonPostText as PostText,
  YeonReplyListItem as ReplyListItem,
  YeonSectionCard as SectionCard,
  YeonStateBlock as StateBlock,
  YeonTextField as TextField,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { formatRelativeTime } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

export function FeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, status } = useChatServiceSession();
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";
  const [draft, setDraft] = useState("");
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(
    null
  );
  const [replyDraft, setReplyDraft] = useState("");

  const feedQuery = useQuery({
    enabled: isSignedIn,
    queryFn: async () => {
      return chatServiceApi.listChatServiceFeed(sessionToken);
    },
    queryKey: chatServiceQueryKeys.feed,
  });

  const createPostMutation = useMutation({
    mutationFn: async (body: string) => {
      return chatServiceApi.createChatServiceFeedPost(sessionToken, { body });
    },
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.feed,
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ body, postId }: { postId: string; body: string }) => {
      return chatServiceApi.replyToChatServiceFeedPost(sessionToken, postId, {
        body,
      });
    },
    onSuccess: async (_result, variables) => {
      setReplyDraft("");
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.replies(variables.postId),
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.feed,
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (postId: string) => {
      return chatServiceApi.createChatServiceReport(sessionToken, {
        reason: "피드 게시글 신고",
        targetId: postId,
        targetType: "feed_post",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return chatServiceApi.blockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.feed,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
    },
  });

  async function handleCreatePost() {
    try {
      await createPostMutation.mutateAsync(draft.trim());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "글 작성에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleReply(postId: string) {
    try {
      await replyMutation.mutateAsync({ body: replyDraft.trim(), postId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "답글 작성에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleReport(postId: string) {
    try {
      await reportMutation.mutateAsync(postId);
      showYeonAlert("신고 완료", "운영팀이 내용을 검토합니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "신고 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleBlock(profileId: string) {
    try {
      await blockMutation.mutateAsync(profileId);
      showYeonAlert(
        "차단 완료",
        "이 사용자는 더 이상 피드에 보이지 않게 처리됩니다."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "차단 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  function pushProfile(post: ChatServiceFeedPostDto) {
    router.push(`/profile/${post.author.id}`);
  }

  return (
    <MobileScreen>
      <TopBar
        rightLabel="새로고침"
        onRightPress={() => {
          void feedQuery.refetch();
        }}
        subtitle="모두의 짧은 대화가 빠르게 쌓이는 공개 피드"
        title="피드"
      />

      <SectionCard>
        <FormStack>
          <FormIntro hint="400자 이하 공개 글" title="한 줄 올리기" />
          <TextField
            label="내용"
            multiline
            onChangeText={setDraft}
            placeholder="지금 생각나는 말을 남겨보세요"
            value={draft}
          />
          <ActionButton
            disabled={createPostMutation.isPending || draft.trim().length < 1}
            label="피드에 올리기"
            onPress={handleCreatePost}
          />
        </FormStack>
      </SectionCard>

      {feedQuery.isLoading ? (
        <StateBlock
          loading
          message="피드를 불러오는 중입니다."
          title="목록 준비 중"
        />
      ) : null}

      {feedQuery.isError ? (
        <StateBlock
          message="공개 대화를 가져오지 못했습니다. 상단 새로고침으로 다시 시도해 주세요."
          title="피드 로드 실패"
        />
      ) : null}

      {feedQuery.data?.posts.map((post) => (
        <SectionCard key={post.id}>
          <PostAuthorHeader
            avatarTone="neutral"
            imageUrl={post.author.avatarUrl}
            label={post.author.nickname}
            meta={`${post.author.regionLabel} ${post.author.ageLabel} · ${formatRelativeTime(post.createdAt)}`}
            onPress={() => pushProfile(post)}
            title={post.author.nickname}
            titleSize="lg"
            trailingSlot={
              <>
                <PillBadge
                  label="신고"
                  onPress={() => void handleReport(post.id)}
                />
                <PillBadge
                  label="차단"
                  onPress={() => void handleBlock(post.author.id)}
                />
              </>
            }
          />

          <PostText>{post.body}</PostText>

          <PostFooter
            actionLabel={
              activeReplyPostId === post.id ? "답글 닫기" : "답글 보기"
            }
            label={`답글 ${post.replyCount}`}
            onActionPress={() => {
              setReplyDraft("");
              setActiveReplyPostId((current) =>
                current === post.id ? null : post.id
              );
            }}
          />

          {activeReplyPostId === post.id ? (
            <FeedRepliesPanel
              onReply={() => void handleReply(post.id)}
              postId={post.id}
              replyDraft={replyDraft}
              replyDraftPending={replyMutation.isPending}
              setReplyDraft={setReplyDraft}
              sessionToken={sessionToken}
            />
          ) : null}
        </SectionCard>
      ))}
    </MobileScreen>
  );
}

function FeedRepliesPanel({
  onReply,
  postId,
  replyDraft,
  replyDraftPending,
  sessionToken,
  setReplyDraft,
}: {
  postId: string;
  sessionToken: string;
  replyDraft: string;
  setReplyDraft: (value: string) => void;
  onReply: () => void;
  replyDraftPending: boolean;
}) {
  const repliesQuery = useQuery({
    queryFn: async () => {
      return chatServiceApi.listChatServiceFeedReplies(sessionToken, postId);
    },
    queryKey: chatServiceQueryKeys.replies(postId),
  });

  return (
    <FormStack>
      {repliesQuery.data?.replies.map((reply) => (
        <ReplyListItem
          body={reply.body}
          imageUrl={reply.author.avatarUrl}
          key={reply.id}
          label={reply.author.nickname}
          meta={`${reply.author.nickname} · ${formatRelativeTime(reply.createdAt)}`}
        />
      ))}

      {repliesQuery.isLoading ? (
        <PostText variant="meta">답글을 불러오는 중입니다.</PostText>
      ) : null}

      <TextField
        label="답글 작성"
        multiline
        onChangeText={setReplyDraft}
        placeholder="답글을 남겨보세요"
        value={replyDraft}
      />
      <ActionButton
        disabled={replyDraftPending || replyDraft.trim().length < 1}
        label="답글 등록"
        onPress={onReply}
        variant="secondary"
      />
    </FormStack>
  );
}
