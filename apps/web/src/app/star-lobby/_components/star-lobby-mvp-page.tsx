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
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
              스타 로비 키워드 감지 MVP
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
                랜타디 뜨면
                <br /> 바로 알려줘.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                스타 유즈맵 방은 금방 뜨고 금방 사라집니다. 원하는 방제 키워드를
                걸어두면 로비에서 관측되는 순간 실시간으로 알려주는
                서비스입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white px-4 py-2 text-slate-950">
                방제 키워드 감지
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2 text-slate-200">
                실시간 로비 피드
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2 text-slate-200">
                제외 키워드 조건
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-950/80 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-cyan-200">실시간 피드</p>
                  <h2 className="text-2xl font-black">지금 뜬 방</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  마지막 관측 4초 전
                </span>
              </div>
              <div className="space-y-3">
                {SAMPLE_ROOMS.map((room) => (
                  <article
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                    key={room.title}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">{room.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {room.age} · {room.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-300 px-3 py-1 text-sm font-black text-slate-950">
                        {room.players}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          <StarLobbyLivePanel />

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <p className="text-sm font-bold text-cyan-200">알림 조건 예시</p>
            <h2 className="mt-2 text-2xl font-black">
              방제에 이 단어가 뜨면 알림
            </h2>
            <div className="mt-5 space-y-4">
              {SAMPLE_RULES.map((rule) => (
                <article
                  className="rounded-2xl bg-slate-900 p-4"
                  key={rule.name}
                >
                  <h3 className="text-lg font-black">{rule.name}</h3>
                  <p className="mt-3 text-sm font-bold text-slate-300">
                    포함 키워드
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rule.include.map((keyword) => (
                      <span
                        className="rounded-full bg-cyan-300/15 px-3 py-1 text-sm text-cyan-100"
                        key={keyword}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-300">
                    제외 키워드
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rule.exclude.map((keyword) => (
                      <span
                        className="rounded-full bg-rose-300/15 px-3 py-1 text-sm text-rose-100"
                        key={keyword}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white">
            <p className="text-sm font-bold text-white">관측 기반 안내</p>
            <h2 className="mt-2 text-2xl font-black">
              100% 확정 정보처럼 말하지 않습니다
            </h2>
            <p className="mt-4 leading-7 text-white/85">
              이 서비스는 스타크래프트 로비 화면을 관측해 방 정보를 제공합니다.
              일부 방은 누락되거나 늦게 반영될 수 있고, OCR/방제 표기 차이로
              잘못 감지될 수 있습니다.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-950/60 p-4">
              <p className="text-sm font-bold text-white">
                초기 MVP에서 하지 않는 것
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                <li>스타 방 자동 입장</li>
                <li>게임 내 자동 채팅</li>
                <li>맵별 대기 채팅/파티 모집</li>
                <li>커뮤니티 게시판 중심 기능</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
