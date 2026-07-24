function toCharArray(value: string) {
  return Array.from(value);
}

export function getLockedInputLength(
  promptChars: readonly string[],
  inputChars: readonly string[]
) {
  const max = Math.min(promptChars.length, inputChars.length);
  let lockedLength = 0;

  while (
    lockedLength < max &&
    inputChars[lockedLength] === promptChars[lockedLength]
  ) {
    lockedLength += 1;
  }

  return lockedLength;
}

export function normalizeTypingInput(
  nextRawValue: string,
  promptLength: number
) {
  return toCharArray(nextRawValue).slice(0, promptLength).join("");
}
