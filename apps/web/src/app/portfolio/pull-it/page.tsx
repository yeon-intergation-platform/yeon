import Link from "next/link";

const PULLIT_REPOSITORIES = [
  {
    label: "Frontend",
    href: "https://github.com/Hyeonjun0527/Team2_FE",
  },
  {
    label: "Backend",
    href: "https://github.com/Hyeonjun0527/Team2_BE",
  },
  {
    label: "Docs",
    href: "https://github.com/Hyeonjun0527/pullit-docs-server",
  },
] as const;

export default function PullitRecoveryPage() {
  return (
    <main className="min-h-screen bg-[#f6f5f2] px-5 py-16 text-[#111] sm:px-8 lg:py-24">
      <section className="mx-auto max-w-4xl rounded-3xl border border-[#d8d8d5] bg-white p-7 shadow-[0_20px_70px_rgba(17,17,17,0.07)] sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d4aff]">
          PULL-IT Revival
        </p>
        <h1 className="mt-4 break-keep text-4xl font-black tracking-[-0.05em] sm:text-6xl">
          학습 자료를 문제로 바꾸는 AI 학습 서비스
        </h1>
        <p className="mt-6 max-w-2xl break-keep text-base leading-8 text-[#5f5f5f]">
          프런트엔드, Spring 백엔드, 온보딩 문서를 하나의
          <strong className="mx-1 text-[#111]">
            portfolio.yeon.world/pull-it
          </strong>
          경로로 복구하고 있습니다. 운영 원본 연결값이 설정되면 이 안내 화면은
          실제 서비스로 자동 전환됩니다.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {PULLIT_REPOSITORIES.map((repository) => (
            <a
              key={repository.label}
              href={repository.href}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-2xl border border-[#dedede] p-5 font-bold text-[#111] no-underline transition-colors hover:border-[#6d4aff] hover:bg-[#f8f6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff]"
            >
              {repository.label} 저장소 ↗
            </a>
          ))}
        </div>

        <Link
          href="/portfolio"
          className="mt-10 inline-flex min-h-11 items-center rounded-full bg-[#111] px-5 text-sm font-bold text-white no-underline hover:bg-[#333] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff]"
        >
          포트폴리오로 돌아가기
        </Link>
      </section>
    </main>
  );
}
