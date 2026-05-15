import type { SheetAsset } from "./asset-manifest";

export function AssetUseCard({ asset }: { asset: SheetAsset }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={asset.src}
            alt=""
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-950">{asset.title}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {asset.cell}
          </p>
          <p className="mt-2 text-sm text-slate-700">{asset.purpose}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-600">
        {asset.evidence.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
