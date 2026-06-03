import {
  YeonBadge,
  YeonList,
  YeonListItem,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { StarLobbyLivePanel } from "./star-lobby-live-panel";

const SAMPLE_ROOMS = [
  {
    title: "랜타디 초보 환영",
    players: "3/6",
    age: "방금",
    status: "관측됨",
  },
  {
    title: "빨무 팀플 ㄱㄱ",
    players: "5/8",
    age: "8초 전",
    status: "관측됨",
  },
  {
    title: "컴까기 헌터",
    players: "4/7",
    age: "21초 전",
    status: "사라짐 가능",
  },
] as const;

const SAMPLE_RULES = [
  {
    name: "랜타디",
    include: ["랜타디", "랜덤타워디펜스", "RTD"],
    exclude: ["고수", "빡겜", "노초보"],
  },
  {
    name: "빠른무한",
    include: ["빨무", "빠른무한", "fastest"],
    exclude: ["고수만"],
  },
] as const;

export function StarLobbyMvpPage() {
  return (
    <YeonView as="main" className="min-h-screen bg-white text-[#111]">
      <YeonView
        as="section"
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16"
      >
        <YeonView className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <YeonView className="space-y-6">
            <YeonBadge variant="accent" className="w-fit px-3 py-1">
              스타 로비 키워드 감지 MVP
            </YeonBadge>
            <YeonView className="space-y-4">
              <YeonText
                as="h1"
                variant="title"
                className="whitespace-pre-line text-4xl sm:text-6xl"
              >
                {"랜타디 뜨면\n바로 알려줘."}
              </YeonText>
              <YeonText className="max-w-2xl text-lg leading-8 text-[#666]">
                스타 유즈맵 방은 금방 뜨고 금방 사라집니다. 원하는 방제 키워드를
                걸어두면 로비에서 관측되는 순간 실시간으로 알려주는
                서비스입니다.
              </YeonText>
            </YeonView>
            <YeonView className="flex flex-wrap gap-3">
              <YeonBadge variant="accent" className="px-4 py-2">
                방제 키워드 감지
              </YeonBadge>
              <YeonBadge className="px-4 py-2">실시간 로비 피드</YeonBadge>
              <YeonBadge className="px-4 py-2">제외 키워드 조건</YeonBadge>
            </YeonView>
          </YeonView>

          <YeonSurface className="rounded-[2rem] p-5 shadow-[0_18px_45px_rgba(17,17,17,0.08)]">
            <YeonSurface variant="panel" className="rounded-[1.5rem] p-5">
              <YeonView className="mb-4 flex items-center justify-between gap-3">
                <YeonView>
                  <YeonText variant="label" className="text-[#666]">
                    실시간 피드
                  </YeonText>
                  <YeonText as="h2" variant="subtitle">
                    지금 뜬 방
                  </YeonText>
                </YeonView>
                <YeonBadge variant="success" className="px-3 py-1">
                  마지막 관측 4초 전
                </YeonBadge>
              </YeonView>
              <YeonView className="space-y-3">
                {SAMPLE_ROOMS.map((room) => (
                  <YeonSurface
                    as="article"
                    variant="outlined"
                    className="p-4"
                    key={room.title}
                  >
                    <YeonView className="flex items-start justify-between gap-3">
                      <YeonView>
                        <YeonText as="h3" variant="label">
                          {room.title}
                        </YeonText>
                        <YeonText
                          variant="caption"
                          className="mt-1 text-[#666]"
                        >
                          {room.age} · {room.status}
                        </YeonText>
                      </YeonView>
                      <YeonBadge variant="accent" className="px-3 py-1">
                        {room.players}
                      </YeonBadge>
                    </YeonView>
                  </YeonSurface>
                ))}
              </YeonView>
            </YeonSurface>
          </YeonSurface>
        </YeonView>

        <YeonView as="section" className="grid gap-5 lg:grid-cols-2">
          <StarLobbyLivePanel />

          <YeonSurface className="rounded-[2rem] p-6">
            <YeonText variant="label" className="text-[#666]">
              알림 조건 예시
            </YeonText>
            <YeonText as="h2" variant="subtitle" className="mt-2">
              방제에 이 단어가 뜨면 알림
            </YeonText>
            <YeonView className="mt-5 space-y-4">
              {SAMPLE_RULES.map((rule) => (
                <YeonSurface
                  variant="panel"
                  as="article"
                  className="p-4"
                  key={rule.name}
                >
                  <YeonText as="h3" variant="label" className="text-[15px]">
                    {rule.name}
                  </YeonText>
                  <YeonText variant="label" className="mt-3 text-[#666]">
                    포함 키워드
                  </YeonText>
                  <YeonView className="mt-2 flex flex-wrap gap-2">
                    {rule.include.map((keyword) => (
                      <YeonBadge variant="accent" key={keyword}>
                        {keyword}
                      </YeonBadge>
                    ))}
                  </YeonView>
                  <YeonText variant="label" className="mt-3 text-[#666]">
                    제외 키워드
                  </YeonText>
                  <YeonView className="mt-2 flex flex-wrap gap-2">
                    {rule.exclude.map((keyword) => (
                      <YeonBadge variant="neutral" key={keyword}>
                        {keyword}
                      </YeonBadge>
                    ))}
                  </YeonView>
                </YeonSurface>
              ))}
            </YeonView>
          </YeonSurface>

          <YeonSurface className="rounded-[2rem] p-6 lg:col-span-2">
            <YeonText variant="label" className="text-[#666]">
              관측 기반 안내
            </YeonText>
            <YeonText as="h2" variant="subtitle" className="mt-2">
              100% 확정 정보처럼 말하지 않습니다
            </YeonText>
            <YeonText className="mt-4 text-[#666]">
              이 서비스는 스타크래프트 로비 화면을 관측해 방 정보를 제공합니다.
              일부 방은 누락되거나 늦게 반영될 수 있고, OCR/방제 표기 차이로
              잘못 감지될 수 있습니다.
            </YeonText>
            <YeonSurface variant="panel" className="mt-6 p-4">
              <YeonText variant="label">초기 MVP에서 하지 않는 것</YeonText>
              <YeonList className="mt-3 space-y-2 text-sm text-[#666]">
                <YeonListItem>스타 방 자동 입장</YeonListItem>
                <YeonListItem>게임 내 자동 채팅</YeonListItem>
                <YeonListItem>맵별 대기 채팅/파티 모집</YeonListItem>
                <YeonListItem>커뮤니티 게시판 중심 기능</YeonListItem>
              </YeonList>
            </YeonSurface>
          </YeonSurface>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
