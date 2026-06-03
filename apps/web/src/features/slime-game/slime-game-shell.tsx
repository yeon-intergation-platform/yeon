import { YeonButton, YeonSurface, YeonText, YeonView } from "@yeon/ui";
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
    <YeonView as="main" className="min-h-screen bg-white text-[#111]">
      <YeonSurface
        as="section"
        className="rounded-none border-x-0 border-t-0 px-6 py-4 shadow-[0_18px_45px_rgba(17,17,17,0.08)]"
      >
        <YeonView className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <YeonView>
            <YeonText
              variant="caption"
              className="font-bold uppercase tracking-[0.34em] text-[#666]"
            >
              Slime validation lab
            </YeonText>
            <YeonText
              as="h1"
              data-testid="slime-active-page-title"
              variant="subtitle"
              className="mt-2 text-2xl"
            >
              {activePage.pageNumber}페이지 · {activePage.title}
            </YeonText>
            <YeonText variant="caption" className="mt-1 text-[#666]">
              {activePage.description}
            </YeonText>
          </YeonView>

          <YeonView className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <YeonView className="flex gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] p-1">
              {SLIME_VALIDATION_PAGE_LIST.map((page) => {
                const isActive = page.id === activePageId;
                return (
                  <YeonButton
                    key={page.id}
                    type="button"
                    onClick={() => onChangePage(page.id)}
                    data-testid={`slime-page-tab-${page.id}`}
                    className={
                      isActive
                        ? "rounded-full bg-[#111] px-4 py-2 text-sm font-black text-white"
                        : "rounded-full border-transparent bg-transparent px-4 py-2 text-sm font-bold text-[#666] hover:bg-white hover:text-[#111]"
                    }
                    variant={isActive ? "primary" : "ghost"}
                  >
                    {page.pageNumber}. {page.shortTitle}
                  </YeonButton>
                );
              })}
            </YeonView>

            <YeonView className="flex gap-2">
              <YeonButton
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
                className="h-10 rounded-full px-4 text-sm font-bold"
                variant="secondary"
              >
                이전
              </YeonButton>
              <YeonButton
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
                className="h-10 rounded-full px-4 text-sm font-black"
                variant="primary"
              >
                다음
              </YeonButton>
            </YeonView>
          </YeonView>
        </YeonView>
      </YeonSurface>

      {children}
    </YeonView>
  );
}
