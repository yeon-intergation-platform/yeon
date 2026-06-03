import type { ChatServiceAskKind } from "@yeon/api-contract/chat-service";
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
  YeonFormStack as FormStack,
  YeonMobileScreen as MobileScreen,
  YeonPillBadge as PillBadge,
  YeonPollOption as PollOption,
  YeonPostAuthorHeader as PostAuthorHeader,
  YeonPostText as PostText,
  YeonSectionCard as SectionCard,
  YeonSegmentedControl as SegmentedControl,
  YeonStateBlock as StateBlock,
  YeonTextField as TextField,
  YeonTopBar as TopBar,
} from "@yeon/ui/native";
import { formatRelativeTime } from "../../../lib/format";
import { useChatServiceSession } from "../../../providers/chat-service-session-provider";
import { chatServiceApi } from "../../../services/chat-service/client";
import { chatServiceQueryKeys } from "../../../services/chat-service/query-keys";

const defaultPollOptions = ["", ""];
const askKindOptions = [
  { label: "질문", value: "question" },
  { label: "투표", value: "poll" },
] satisfies { label: string; value: ChatServiceAskKind }[];

export function AskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, status } = useChatServiceSession();
  const [question, setQuestion] = useState("");
  const [kind, setKind] = useState<ChatServiceAskKind>("question");
  const [options, setOptions] = useState<string[]>(defaultPollOptions);
  const isSignedIn = status === "signed_in";
  const sessionToken = session?.token ?? "";

  const askQuery = useQuery({
    enabled: isSignedIn,
    queryFn: async () => {
      return chatServiceApi.listChatServiceAskPosts(sessionToken);
    },
    queryKey: chatServiceQueryKeys.ask,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return chatServiceApi.createChatServiceAskPost(sessionToken, {
        kind,
        options:
          kind === "poll"
            ? options
                .map((label) => label.trim())
                .filter((label) => label.length > 0)
                .map((label) => ({ label }))
            : undefined,
        question: question.trim(),
      });
    },
    onSuccess: async () => {
      setQuestion("");
      setOptions(defaultPollOptions);
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.ask,
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      optionIndex,
      postId,
    }: {
      postId: string;
      optionIndex: number;
    }) => {
      return chatServiceApi.voteChatServiceAskPost(sessionToken, postId, {
        optionIndex,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.ask,
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (postId: string) => {
      return chatServiceApi.createChatServiceReport(sessionToken, {
        reason: "에스크 게시글 신고",
        targetId: postId,
        targetType: "ask_post",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return chatServiceApi.blockChatServiceProfile(sessionToken, profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.ask,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.friends,
      });
      await queryClient.invalidateQueries({
        queryKey: chatServiceQueryKeys.profile,
      });
    },
  });

  async function handleCreate() {
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "에스크 작성에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleVote(postId: string, optionIndex: number) {
    try {
      await voteMutation.mutateAsync({ optionIndex, postId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "투표 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  async function handleReport(postId: string) {
    try {
      await reportMutation.mutateAsync(postId);
      showYeonAlert("신고 완료", "운영팀이 게시글을 검토합니다.");
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
        "이 사용자의 게시글은 더 이상 보이지 않습니다."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "차단 처리에 실패했습니다.";
      showYeonAlert("오류", message);
    }
  }

  function pushProfile({ id }: { id: string }) {
    router.push(`/profile/${id}`);
  }

  return (
    <MobileScreen>
      <TopBar
        subtitle="질문과 투표를 따로 모아 반응을 모으는 공간"
        title="에스크"
      />

      <SectionCard>
        <FormStack>
          <SegmentedControl
            onValueChange={setKind}
            options={askKindOptions}
            value={kind}
          />

          <TextField
            label={kind === "poll" ? "투표 주제" : "질문"}
            multiline
            onChangeText={setQuestion}
            placeholder={
              kind === "poll"
                ? "둘 중 어떤 선택이 더 끌리는지 물어보세요"
                : "친구들에게 묻고 싶은 질문을 적어보세요"
            }
            value={question}
          />

          {kind === "poll" ? (
            <FormStack gap="compact">
              {options.map((option, index) => (
                <TextField
                  key={`${index}`}
                  label={`선택지 ${index + 1}`}
                  onChangeText={(next) => {
                    setOptions((current) =>
                      current.map((value, currentIndex) =>
                        currentIndex === index ? next : value
                      )
                    );
                  }}
                  placeholder={`선택지 ${index + 1}`}
                  value={option}
                />
              ))}
              {options.length < 4 ? (
                <ActionButton
                  label="선택지 추가"
                  onPress={() => {
                    setOptions((current) => [...current, ""]);
                  }}
                  variant="secondary"
                />
              ) : null}
            </FormStack>
          ) : null}

          <ActionButton
            disabled={createMutation.isPending || question.trim().length < 1}
            label={kind === "poll" ? "투표 올리기" : "질문 올리기"}
            onPress={handleCreate}
          />
        </FormStack>
      </SectionCard>

      {askQuery.isLoading ? (
        <StateBlock
          loading
          message="에스크 목록을 준비하고 있습니다."
          title="질문 불러오는 중"
        />
      ) : null}

      {askQuery.isError ? (
        <StateBlock
          message="목록을 가져오지 못했습니다. 잠시 뒤 다시 시도해 주세요."
          title="에스크 로드 실패"
        />
      ) : null}

      {askQuery.data?.posts.map((post) => (
        <SectionCard key={post.id}>
          <PostAuthorHeader
            avatarSize={42}
            imageUrl={post.author.avatarUrl}
            label={post.author.nickname}
            meta={`${post.author.regionLabel} ${post.author.ageLabel} · ${formatRelativeTime(post.createdAt)}`}
            onPress={() => pushProfile(post.author)}
            title={post.author.nickname}
            trailingLayout="column"
            trailingSlot={
              <>
                <PillBadge
                  label={post.kind === "poll" ? "투표" : "질문"}
                  tone={post.kind === "poll" ? "accent" : "neutral"}
                />
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
            verticalAlign="center"
          />

          <PostText>{post.question}</PostText>

          {post.kind === "poll" ? (
            <FormStack gap="compact">
              {post.options.map((option) => {
                const selected = post.userVoteIndex === option.index;

                return (
                  <PollOption
                    countLabel={`${option.voteCount}표`}
                    key={option.index}
                    label={option.label}
                    onPress={() => void handleVote(post.id, option.index)}
                    selected={selected}
                  />
                );
              })}
              <PostText variant="meta">총 {post.totalVotes}명 참여</PostText>
            </FormStack>
          ) : (
            <PostText variant="hint">
              공개 피드에서 이어서 대화를 열거나 친구 탭에서 관계를 이어갈 수
              있습니다.
            </PostText>
          )}
        </SectionCard>
      ))}
    </MobileScreen>
  );
}
