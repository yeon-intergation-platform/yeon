interface CardMarkdownCopyErrorMessageInput {
  targetLabel: string;
  codeLength: number;
}

export function buildCardMarkdownCopyErrorMessage({
  targetLabel,
  codeLength,
}: CardMarkdownCopyErrorMessageInput): string {
  return `${targetLabel} 클립보드 복사에 실패했습니다. 복사 대상 길이: ${codeLength}자. 브라우저 클립보드 권한 또는 보안 컨텍스트를 확인해 주세요.`;
}
