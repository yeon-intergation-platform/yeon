import type { WritableCommunityCategory } from "./community-post-format";

export const COMMUNITY_SEO_HEADING = "YEON 커뮤니티 소개";

export const COMMUNITY_SEO_INTRO = [
  "YEON 커뮤니티는 타자연습과 플래시카드 학습을 함께하는 사람들이 모이는 공간입니다. 실시간 채팅과 게시판으로 같이 연습할 친구를 찾고 자유롭게 이야기를 나눌 수 있습니다.",
  "로그인 없이도 게시글을 둘러볼 수 있고, 닉네임과 비밀번호만 입력하면 바로 글을 남길 수 있습니다.",
] as const;

export const COMMUNITY_CATEGORY_DESCRIPTIONS: Record<
  WritableCommunityCategory,
  string
> = {
  잡담: "자유롭게 이야기를 나누는 게시판입니다.",
  "타자친구 모집": "함께 타자 연습할 친구를 찾는 게시판입니다.",
  "카드친구 모집": "함께 플래시카드로 공부할 친구를 찾는 게시판입니다.",
  "관리자에게 아무말/조언": "운영진에게 의견이나 조언을 전하는 게시판입니다.",
};

export const COMMUNITY_FEATURES = [
  {
    title: "실시간 채팅",
    description:
      "서비스를 이용하는 사람들과 가볍게 대화하고 함께 연습할 친구를 찾습니다.",
  },
  {
    title: "게시판 분류",
    description:
      "잡담, 타자친구 모집, 카드친구 모집처럼 목적별 게시판에 글을 남깁니다.",
  },
  {
    title: "게스트 글쓰기",
    description:
      "닉네임과 비밀번호만 입력해 로그인 없이도 글과 댓글을 작성합니다.",
  },
  {
    title: "운영진 의견 전달",
    description:
      "서비스 사용 중 떠오른 제안이나 조언을 운영진에게 바로 전합니다.",
  },
] as const;

export const COMMUNITY_FAQS = [
  {
    question: "로그인 없이 글을 쓸 수 있나요?",
    answer:
      "가능합니다. 닉네임과 비밀번호를 입력하면 게스트로 글과 댓글을 남길 수 있습니다.",
  },
  {
    question: "어떤 게시판을 쓰면 되나요?",
    answer:
      "자유 대화는 잡담, 함께 연습할 사람을 찾을 때는 타자친구 모집 또는 카드친구 모집을 사용합니다.",
  },
  {
    question: "작성한 글을 나중에 수정하거나 삭제할 수 있나요?",
    answer:
      "글을 쓸 때 사용한 게스트 비밀번호로 본인 확인을 거쳐 수정하거나 삭제할 수 있습니다.",
  },
] as const;
