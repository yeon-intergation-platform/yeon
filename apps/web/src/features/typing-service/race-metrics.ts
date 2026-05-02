export function calculateAccuracy(prompt: string, input: string) {
  const promptChars = Array.from(prompt);
  const inputChars = Array.from(input);
  if (inputChars.length === 0) return 100;
  const matched = inputChars.reduce(
    (count, char, i) => count + Number(char === promptChars[i]),
    0
  );
  return Math.max(0, Math.round((matched / inputChars.length) * 100));
}

export function calculateTypingSpeed(input: string, elapsedSeconds: number) {
  const len = Array.from(input).length;
  if (elapsedSeconds <= 0 || len === 0) return 0;
  return Math.round((len / elapsedSeconds) * 60);
}

export function getProgress(prompt: string, input: string) {
  const promptLen = Array.from(prompt).length;
  if (promptLen === 0) return 0;
  return Math.min(
    100,
    Math.round((Array.from(input).length / promptLen) * 100)
  );
}
