import {
  SLIME_VALIDATION_PAGE_LIST,
  getSlimeValidationPageByOffset,
} from "./slime-game-pages";
import type { SlimeValidationPageId } from "./slime-game-pages";

export function SlimeGameShell({
  activePageId,
  children,
  onChangePage,
}: {
  activePageId: SlimeValidationPageId;
  children: React.ReactNode;
  onChangePage: (pageId: SlimeValidationPageId) => void;
}) {
  const activePage =
    SLIME_VALIDATION_PAGE_LIST.find((page) => page.id === activePageId) ??
    SLIME_VALIDATION_PAGE_LIST[0];
  const isFirstPage = activePage.pageNumber === 1;
  const isLastPage =
    activePage.pageNumber === SLIME_VALIDATION_PAGE_LIST.length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="border-b border-white/10 bg-neutral-950/95 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-lime-300">
              Slime validation lab
            </p>
            <h1
              data-testid="slime-active-page-title"
              className="mt-2 text-2xl font-black tracking-[-0.04em] text-white"
            >
              {activePage.pageNumber}페이지 · {activePage.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {activePage.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
              {SLIME_VALIDATION_PAGE_LIST.map((page) => {
                const isActive = page.id === activePageId;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => onChangePage(page.id)}
                    data-testid={`slime-page-tab-${page.id}`}
                    className={
                      isActive
                        ? "rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-neutral-950"
                        : "rounded-full px-4 py-2 text-sm font-bold text-neutral-300 transition hover:bg-white/10 hover:text-white"
                    }
                  >
                    {page.pageNumber}. {page.shortTitle}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isFirstPage}
                onClick={() =>
                  onChangePage(
                    getSlimeValidationPageByOffset({
                      pageId: activePageId,
                      offset: -1,
                    })
                  )
                }
                data-testid="slime-page-prev"
                className="h-10 rounded-full border border-white/15 px-4 text-sm font-bold text-white transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <button
                type="button"
                disabled={isLastPage}
                onClick={() =>
                  onChangePage(
                    getSlimeValidationPageByOffset({
                      pageId: activePageId,
                      offset: 1,
                    })
                  )
                }
                data-testid="slime-page-next"
                className="h-10 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 text-sm font-black text-lime-100 transition enabled:hover:bg-lime-300/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
