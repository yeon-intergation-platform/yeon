export function normalizeQueryText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeDisplaySeconds(totalSeconds: number): number {
  return Math.max(0, Math.floor(totalSeconds));
}

export function formatRemainingSeconds(totalSeconds: number): string {
  const normalizedSeconds = normalizeDisplaySeconds(totalSeconds);
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatElapsedSeconds(totalSeconds: number): string {
  const normalizedSeconds = normalizeDisplaySeconds(totalSeconds);
  if (normalizedSeconds < 60) return `${normalizedSeconds}초`;

  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;
  return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
}
