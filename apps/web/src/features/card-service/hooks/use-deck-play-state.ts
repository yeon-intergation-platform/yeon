"use client";
import {
  useYeonPathname,
  useYeonRouter,
  useYeonSearchParams,
} from "@yeon/ui/runtime/YeonNavigation";
import {
  createYeonUrlSearchParams,
  getYeonRandom,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import {
  canMoveToNextCardDeckPlayItem,
  canMoveToPreviousCardDeckPlayItem,
  clampCardDeckPlayIndex,
  parseCardDeckPlayIndexParam,
} from "@yeon/ui/runtime/ports/card-deck";

function shuffleInPlace<T>(source: readonly T[]): T[] {
  const out = source.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(getYeonRandom() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function useDeckPlayState(items: CardDeckItemDto[]) {
  const router = useYeonRouter();
  const pathname = useYeonPathname();
  const searchParams = useYeonSearchParams();

  const [isShuffled, setShuffled] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<CardDeckItemDto[]>(items);

  // items prop이 바뀌면 섞인 상태 초기화
  const itemsSignatureRef = useRef<string>(items.map((i) => i.id).join(","));
  useEffect(() => {
    const nextSignature = items.map((i) => i.id).join(",");
    if (nextSignature === itemsSignatureRef.current) {
      return;
    }
    itemsSignatureRef.current = nextSignature;
    setShuffled(false);
    setShuffledItems(items);
  }, [items]);

  const visibleItems = isShuffled ? shuffledItems : items;

  const rawIndex = parseCardDeckPlayIndexParam(searchParams.get("i"));
  const currentIndex = clampCardDeckPlayIndex(rawIndex, visibleItems.length);
  const [isFlipped, setFlipped] = useState(false);

  // 인덱스 변경 렌더에서는 이전 카드의 뒷면 상태를 보여주지 않고 즉시 앞면을 보여준다.
  const prevIndexRef = useRef(currentIndex);
  const isNavigatingToAnotherCard = prevIndexRef.current !== currentIndex;
  const visibleIsFlipped = isNavigatingToAnotherCard ? false : isFlipped;
  const shouldAnimateFlip = !isNavigatingToAnotherCard;

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      setFlipped(false);
    }
  }, [currentIndex]);

  const updateIndex = useCallback(
    (nextIndex: number) => {
      const bounded = clampCardDeckPlayIndex(nextIndex, visibleItems.length);
      const nextParams = createYeonUrlSearchParams(searchParams.toString());
      if (bounded === 0) {
        nextParams.delete("i");
      } else {
        nextParams.set("i", String(bounded));
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams, visibleItems.length]
  );

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    if (
      !canMoveToPreviousCardDeckPlayItem({
        currentIndex,
        itemCount: visibleItems.length,
      })
    ) {
      return;
    }
    updateIndex(currentIndex - 1);
  }, [currentIndex, updateIndex]);

  const handleFirst = useCallback(() => {
    updateIndex(0);
  }, [updateIndex]);

  const handleNext = useCallback(() => {
    if (
      !canMoveToNextCardDeckPlayItem({
        currentIndex,
        itemCount: visibleItems.length,
      })
    ) {
      return;
    }
    updateIndex(currentIndex + 1);
  }, [currentIndex, updateIndex, visibleItems.length]);

  const handleToggleShuffle = useCallback(() => {
    setShuffled((prev) => {
      const next = !prev;
      if (next) {
        setShuffledItems(shuffleInPlace(items));
      } else {
        setShuffledItems(items);
      }
      return next;
    });
    updateIndex(0);
  }, [items, updateIndex]);

  const currentItem = visibleItems[currentIndex] ?? null;

  return useMemo(
    () => ({
      items: visibleItems,
      currentIndex,
      currentItem,
      isFlipped: visibleIsFlipped,
      shouldAnimateFlip,
      isShuffled,
      handleFlip,
      handlePrev,
      handleNext,
      handleFirst,
      handleToggleShuffle,
    }),
    [
      visibleItems,
      currentIndex,
      currentItem,
      visibleIsFlipped,
      shouldAnimateFlip,
      isShuffled,
      handleFlip,
      handlePrev,
      handleNext,
      handleFirst,
      handleToggleShuffle,
    ]
  );
}
