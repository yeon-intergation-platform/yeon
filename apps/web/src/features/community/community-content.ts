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
