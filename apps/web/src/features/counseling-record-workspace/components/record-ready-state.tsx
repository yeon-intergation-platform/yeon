import { Loader2, Link2, Link2Off } from "lucide-react";
import { AnalysisCards } from "@/features/counseling-record-workspace/components/analysis-cards";
import { RecordAudioPlayer } from "@/features/counseling-record-workspace/components/record-audio-player";
import { TranscriptDetails } from "@/features/counseling-record-workspace/components/transcript-details";
import type { RecordItem } from "@/features/counseling-record-workspace/lib/types";

interface ReadyStateMismatchWarning {
  title: string;
  description: string;
  evidence: string[];
}

interface RecordReadyStateProps {
  selected: RecordItem;
  className: string;
  transcriptLoading: boolean;
  analyzing: boolean;
  isPlaying: boolean;
  audioPosition: number;
  totalSeconds: number;
  onTogglePlay: () => void;
  onSeek: (pct: number) => void;
  onLinkMember: () => void;
  mismatchWarning: ReadyStateMismatchWarning | null;
}

export function RecordReadyState({
  selected,
  className,
  transcriptLoading,
  analyzing,
  isPlaying,
  audioPosition,
  totalSeconds,
  onTogglePlay,
  onSeek,
  onLinkMember,
  mismatchWarning,
}: RecordReadyStateProps) {
  return (
    <div key={selected.id} className={className}>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-[15px] font-semibold tracking-[-0.3px] truncate">
            {selected.title}
          </h1>
          <div className="text-[11px] text-text-dim flex items-center gap-1.5 flex-wrap">
            <span>{selected.studentName || "수강생 미지정"}</span>
            <span>·</span>
            <span>{selected.type}</span>
            <span>·</span>
            <span>{selected.duration}</span>
            <span>·</span>
            <span>원문 완료</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLinkMember}
          data-tutorial="link-member-btn"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border flex-shrink-0 transition-all duration-150 ${
            selected.memberId
              ? "bg-accent-dim border-accent-border text-accent hover:bg-accent hover:text-bg"
              : "bg-surface-2 border-border text-text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          {selected.memberId ? <Link2 size={12} /> : <Link2Off size={12} />}
          {selected.memberId ? "연결됨" : "수강생 연결"}
        </button>
      </div>

      {mismatchWarning && (
        <div className="mx-5 mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-amber">⚠️</span>
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-semibold text-amber">
                {mismatchWarning.title}
              </p>
              <p className="mt-1 mb-0 text-[12px] leading-relaxed text-text-secondary">
                {mismatchWarning.description}
              </p>
              <ul className="mt-2 mb-0 pl-4 text-[11px] leading-relaxed text-text-dim">
                {mismatchWarning.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <RecordAudioPlayer
        audioAvailable={selected.recordSource === "audio_upload"}
        isPlaying={isPlaying}
        audioPosition={audioPosition}
        totalSeconds={totalSeconds}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
        unavailableMessage="텍스트 메모에는 재생할 원본 음성이 없습니다."
      />

      <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-4">
        {analyzing && !selected.analysisResult && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-accent-dim border border-accent-border rounded-lg text-accent text-[13px] font-medium">
            <Loader2 size={14} className="animate-spin" />
            AI 분석 중...
          </div>
        )}

        {selected.analysisResult && (
          <AnalysisCards analysis={selected.analysisResult} />
        )}

        <TranscriptDetails
          transcript={selected.transcript}
          loading={transcriptLoading}
          emptyMessage="전사 내용이 없습니다."
          defaultOpen={!selected.analysisResult}
        />
      </div>
    </div>
  );
}
