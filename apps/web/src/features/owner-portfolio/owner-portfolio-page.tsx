import Image from "next/image";
import {
  PORTFOLIO_DOCUMENTS,
  PORTFOLIO_EXTERNAL_LINKS,
  PORTFOLIO_GALLERY_ENTRIES,
  PORTFOLIO_PROFILE,
} from "./portfolio-content";

function ArrowIcon({
  direction = "external",
}: {
  direction?: "external" | "down";
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0"
    >
      {direction === "external" ? (
        <>
          <path d="M6 14 14 6" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M8 6h6v6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="square"
          />
        </>
      ) : (
        <>
          <path d="M10 4v11" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m5.5 10.5 4.5 4.5 4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </>
      )}
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0"
    >
      <path d="M10 3v9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6 8 4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PortfolioHeader() {
  return (
    <header className="border-b border-[#dedede] bg-white">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a
          href="/"
          className="text-[17px] font-black tracking-[-0.04em] text-[#111] no-underline sm:text-[19px]"
        >
          YEON Portfolio
        </a>
        <a
          href="https://yeon.world"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8d8d8] px-4 text-[13px] font-semibold text-[#333] no-underline transition-colors hover:border-[#111] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff]"
        >
          YEON 둘러보기
          <ArrowIcon />
        </a>
      </div>
    </header>
  );
}

function ResourceSection() {
  return (
    <section
      id="documents"
      aria-labelledby="documents-heading"
      className="border-b border-[#dedede] bg-white"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6d4aff]">
              Documents &amp; Links
            </p>
            <h2
              id="documents-heading"
              className="mt-3 text-[30px] font-black tracking-[-0.045em] text-[#111] sm:text-[38px]"
            >
              필요한 자료부터 바로 확인하세요.
            </h2>
          </div>
          <p className="max-w-[420px] break-keep text-[14px] leading-7 text-[#666]">
            PDF는 현재 공개 버전을 그대로 내려받으며, 외부 링크는 새 탭에서
            열립니다.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PORTFOLIO_DOCUMENTS.map((document) => (
            <a
              key={document.id}
              href={document.href}
              download={document.downloadName}
              className="group flex min-h-[220px] flex-col rounded-2xl border border-[#dcdcdc] bg-[#fafafa] p-6 text-[#111] no-underline transition duration-200 hover:-translate-y-1 hover:border-[#111] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#111] text-white">
                  <DownloadIcon />
                </span>
                <span className="text-[12px] font-semibold text-[#777]">
                  {document.version}
                </span>
              </div>
              <h3 className="mt-7 text-[20px] font-bold tracking-[-0.03em]">
                {document.label}
              </h3>
              <p className="mt-3 break-keep text-[13px] leading-6 text-[#666]">
                {document.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[13px] font-bold">
                다운로드
                <span className="transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none">
                  <ArrowIcon direction="down" />
                </span>
              </span>
            </a>
          ))}

          {PORTFOLIO_EXTERNAL_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex min-h-[220px] flex-col rounded-2xl border border-[#dcdcdc] bg-white p-6 text-[#111] no-underline transition duration-200 hover:-translate-y-1 hover:border-[#6d4aff] hover:bg-[#f9f7ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d8d0ff] bg-[#eee9ff] text-[12px] font-black text-[#5b3ce0]">
                  {link.id === "github" ? "GH" : "LOG"}
                </span>
                <ArrowIcon />
              </div>
              <h3 className="mt-7 text-[20px] font-bold tracking-[-0.03em]">
                {link.label}
              </h3>
              <p className="mt-2 truncate text-[13px] font-semibold text-[#5b3ce0]">
                {link.value}
              </p>
              <p className="mt-auto break-keep pt-5 text-[13px] leading-6 text-[#666]">
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section
      id="project-gallery"
      aria-labelledby="gallery-heading"
      className="bg-[#f5f5f2]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6d4aff]">
              Project Gallery
            </p>
            <h2
              id="gallery-heading"
              className="mt-3 text-[32px] font-black tracking-[-0.05em] text-[#111] sm:text-[44px]"
            >
              만들고, 측정하고, 고친 기록
            </h2>
          </div>
          <p className="max-w-[430px] break-keep text-[14px] leading-7 text-[#666]">
            프로젝트 이미지는 순차적으로 추가됩니다. 각 카드에는 어떤 문제를
            다뤘는지 먼저 남겨두었습니다.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PORTFOLIO_GALLERY_ENTRIES.map((entry) => (
            <article
              key={entry.id}
              className="group overflow-hidden rounded-2xl border border-[#d8d8d5] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#999] hover:shadow-[0_16px_40px_rgba(17,17,17,0.08)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[#dedede] bg-[#ebe9f5]">
                {entry.imageSrc ? (
                  <Image
                    src={entry.imageSrc}
                    alt={entry.imageAlt ?? entry.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full border border-[#cbc3f5] bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#5b3ce0] backdrop-blur-sm">
                        이미지 준비 중
                      </span>
                      <span className="text-[12px] font-semibold text-[#7667b7]">
                        {entry.category}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="self-end text-[84px] font-black leading-none tracking-[-0.08em] text-[#d1caef] sm:text-[104px]"
                    >
                      {entry.sequence}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4 text-[12px] font-semibold text-[#777]">
                  <span>{entry.category}</span>
                  <span>{entry.period}</span>
                </div>
                <h3
                  title={entry.title}
                  className="mt-4 truncate text-[20px] font-bold tracking-[-0.035em] text-[#111]"
                >
                  {entry.title}
                </h3>
                <p className="mt-3 break-keep text-[14px] leading-7 text-[#5f5f5f]">
                  {entry.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OwnerPortfolioPage() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <PortfolioHeader />
      <main>
        <section className="border-b border-[#dedede] bg-white">
          <div className="mx-auto grid min-h-[600px] max-w-[1440px] lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
            <div className="flex flex-col justify-between px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#111] px-3.5 py-2 text-[11px] font-bold tracking-[0.12em] text-white">
                    OWNER ARCHIVE
                  </span>
                  <span className="rounded-full border border-[#d8d0ff] bg-[#f3f0ff] px-3.5 py-2 text-[11px] font-bold text-[#5b3ce0]">
                    프로젝트 기록 갱신 중
                  </span>
                </div>
                <p className="mt-12 text-[14px] font-bold tracking-[-0.02em] text-[#6d4aff]">
                  {PORTFOLIO_PROFILE.nameEn} · {PORTFOLIO_PROFILE.role}
                </p>
                <h1 className="mt-4 max-w-[900px] break-keep text-[48px] font-black leading-[1.05] tracking-[-0.065em] text-[#111] sm:text-[72px] lg:text-[88px]">
                  문제를 확인하고,
                  <br />
                  끝까지 고칩니다.
                </h1>
                <p className="mt-8 max-w-[680px] break-keep text-[16px] leading-8 text-[#595959] sm:text-[18px] sm:leading-9">
                  {PORTFOLIO_PROFILE.introduction}
                </p>
              </div>
              <div className="mt-12 flex flex-wrap gap-3">
                <a
                  href={PORTFOLIO_DOCUMENTS[0].href}
                  download={PORTFOLIO_DOCUMENTS[0].downloadName}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#111] px-5 text-[14px] font-bold text-white no-underline transition-colors hover:bg-[#2d2d2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff]"
                >
                  포트폴리오 PDF
                  <DownloadIcon />
                </a>
                <a
                  href="#project-gallery"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#ccc] bg-white px-5 text-[14px] font-bold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4aff]"
                >
                  프로젝트 갤러리
                  <ArrowIcon direction="down" />
                </a>
              </div>
            </div>

            <aside className="relative flex min-h-[330px] flex-col justify-between overflow-hidden border-t border-[#dedede] bg-[#6d4aff] p-7 text-white sm:p-10 lg:min-h-full lg:border-l lg:border-t-0 lg:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/20" />
              <div className="absolute -bottom-32 -left-28 h-80 w-80 rounded-full border border-white/20" />
              <span className="relative text-[12px] font-bold uppercase tracking-[0.18em] text-white/75">
                Portfolio No. 09
              </span>
              <div className="relative mt-24 lg:mt-0">
                <p className="text-[72px] font-black leading-none tracking-[-0.08em] sm:text-[92px]">
                  09
                </p>
                <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em] sm:text-[34px]">
                  쥔장의 포트폴리오
                </h2>
                <p className="mt-4 max-w-[320px] break-keep text-[14px] leading-7 text-white/80">
                  운영 중인 서비스와 그 뒤에서 해결한 문제를 한곳에 모았습니다.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <ResourceSection />
        <GallerySection />
      </main>

      <footer className="border-t border-[#dedede] bg-[#111] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 px-5 py-9 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div>
            <p className="text-[15px] font-bold">{PORTFOLIO_PROFILE.name}</p>
            <p className="mt-1 text-[12px] text-white/55">
              Backend Engineer Portfolio · 2026
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] font-semibold">
            {PORTFOLIO_EXTERNAL_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-1.5 text-white/75 no-underline hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
                <ArrowIcon />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
