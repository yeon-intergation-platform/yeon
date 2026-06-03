import {
  YeonImage,
  YeonList,
  YeonListItem,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import type { SheetAsset } from "./asset-manifest";

export function AssetUseCard({ asset }: { asset: SheetAsset }) {
  return (
    <YeonSurface as="article" className="rounded-3xl p-4">
      <YeonView className="flex items-start gap-3">
        <YeonView className="h-16 w-16 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#fafafa]">
          <YeonImage
            src={asset.src}
            alt=""
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        </YeonView>
        <YeonView>
          <YeonText as="h3" variant="label" className="text-sm">
            {asset.title}
          </YeonText>
          <YeonText
            variant="caption"
            className="mt-1 font-semibold text-[#666]"
          >
            {asset.cell}
          </YeonText>
          <YeonText variant="caption" className="mt-2 text-[#666]">
            {asset.purpose}
          </YeonText>
        </YeonView>
      </YeonView>
      <YeonList className="mt-3 space-y-1 text-xs leading-5 text-[#666]">
        {asset.evidence.map((item) => (
          <YeonListItem key={item} className="flex gap-2">
            <YeonView
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111]"
            />
            <YeonText as="span" variant="caption" className="text-[#666]">
              {item}
            </YeonText>
          </YeonListItem>
        ))}
      </YeonList>
    </YeonSurface>
  );
}
