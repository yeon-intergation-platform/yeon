import { fmtTime } from "@/features/counseling-record-workspace/lib/utils";

interface RecordAudioPlayerProps {
  audioAvailable: boolean;
  isPlaying: boolean;
  audioPosition: number;
  totalSeconds: number;
  onTogglePlay: () => void;
  onSeek: (pct: number) => void;
  unavailableMessage?: string;
}

export function RecordAudioPlayer({
  audioAvailable,
  isPlaying,
  audioPosition,
  totalSeconds,
  onTogglePlay,
  onSeek,
  unavailableMessage,
}: RecordAudioPlayerProps) {
  if (!audioAvailable) {
    if (!unavailableMessage) {
      return null;
    }

    return (
      <div className="bg-surface-2 border border-border rounded-lg px-[14px] py-3 mb-4 mx-5 mt-4 text-[13px] text-text-secondary">
        {unavailableMessage}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[10px] bg-surface-2 border border-border rounded-lg px-[14px] py-2 mb-4 mx-5 mt-4">
      <button
        type="button"
        className="w-[30px] h-[30px] rounded-full bg-text text-bg flex items-center justify-center border-none cursor-pointer flex-shrink-0"
        onClick={onTogglePlay}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="4" height="12" rx="1" />
            <rect x="8" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5L12 7L3 12.5V1.5Z" />
          </svg>
        )}
      </button>
      <span className="font-mono text-[11px] text-text-secondary">
        {fmtTime(audioPosition)}
      </span>
      <div
        className="flex-1 h-[3px] bg-surface-4 rounded-[2px] relative cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          onSeek(pct);
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 bg-accent rounded-[2px]"
          style={{
            width: `${totalSeconds > 0 ? (audioPosition / totalSeconds) * 100 : 0}%`,
          }}
        />
      </div>
      <span className="font-mono text-[11px] text-text-secondary">
        {fmtTime(totalSeconds)}
      </span>
    </div>
  );
}
