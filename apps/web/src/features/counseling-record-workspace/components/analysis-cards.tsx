"use client";

import type { AnalysisResult } from "@/features/counseling-record-workspace/lib/types";

export function AnalysisCards({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* 핵심 요약 */}
      <div className="bg-surface-2 border border-border rounded-lg p-4">
        <h3 className="text-[13px] font-semibold text-accent mb-2">
          핵심 요약
        </h3>
        <p className="text-[13px] leading-relaxed text-text-secondary m-0">
          {analysis.summary}
        </p>
      </div>

      {/* 수강생 정보 */}
      {analysis.member.name && (
        <div className="bg-surface-2 border border-border rounded-lg p-4">
          <h3 className="text-[13px] font-semibold text-accent mb-2">
            수강생 정보
          </h3>
          <div className="flex flex-col gap-1 text-[13px]">
            <div>
              <span className="text-text-dim">이름:</span>{" "}
              <span className="text-text font-medium">
                {analysis.member.name}
              </span>
            </div>
            {analysis.member.traits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.member.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-0.5 bg-surface-3 rounded text-[11px] text-text-secondary"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-1">
              <span className="text-text-dim">감정/태도:</span>{" "}
              <span className="text-text-secondary">
                {analysis.member.emotion}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 주요 이슈 */}
      {analysis.issues.length > 0 && (
        <div className="bg-surface-2 border border-border rounded-lg p-4">
          <h3 className="text-[13px] font-semibold text-accent mb-2">
            주요 이슈
          </h3>
          <div className="flex flex-col gap-2">
            {analysis.issues.map((issue, index) => (
              <div key={index} className="flex gap-2 text-[13px]">
                <span className="text-accent font-semibold flex-shrink-0">
                  {index + 1}.
                </span>
                <div>
                  <div className="font-medium text-text">{issue.title}</div>
                  <div className="text-text-secondary leading-relaxed mt-0.5">
                    {issue.detail}
                  </div>
                  {issue.timestamp && (
                    <span className="text-[11px] text-text-dim font-mono">
                      {issue.timestamp}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 후속 조치 */}
      <div className="bg-surface-2 border border-border rounded-lg p-4">
        <h3 className="text-[13px] font-semibold text-accent mb-2">
          후속 조치
        </h3>
        <div className="flex flex-col gap-3 text-[13px]">
          {analysis.actions.mentor.length > 0 && (
            <div>
              <div className="text-text-dim font-medium mb-1">멘토 액션</div>
              <ul className="m-0 pl-4 flex flex-col gap-0.5">
                {analysis.actions.mentor.map((action, index) => (
                  <li key={index} className="text-text-secondary">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.actions.member.length > 0 && (
            <div>
              <div className="text-text-dim font-medium mb-1">수강생 과제</div>
              <ul className="m-0 pl-4 flex flex-col gap-0.5">
                {analysis.actions.member.map((action, index) => (
                  <li key={index} className="text-text-secondary">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.actions.nextSession.length > 0 && (
            <div>
              <div className="text-text-dim font-medium mb-1">
                다음 상담 방향
              </div>
              <ul className="m-0 pl-4 flex flex-col gap-0.5">
                {analysis.actions.nextSession.map((action, index) => (
                  <li key={index} className="text-text-secondary">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 키워드 */}
      {analysis.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {analysis.keywords.map((keyword) => (
            <span
              key={keyword}
              className="px-2 py-0.5 bg-accent-dim border border-accent-border rounded text-[11px] text-accent font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
