interface RecordEmptyStateProps {
  className: string;
}

export function RecordEmptyState({ className }: RecordEmptyStateProps) {
  return (
    <div className={className}>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex flex-col items-center gap-4 text-center max-w-[360px]">
          <p className="text-base font-medium">
            좌측 목록에서 기록을 선택하세요
          </p>
          <p className="m-0 text-sm leading-relaxed text-text-secondary">
            기록을 클릭하면 전사 원문과 AI 분석 결과를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
