type TypingInputClampResult = {
  nextInput: string;
  lockedLength: number;
};

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

export function applyTypingInputClamp(
  nextRawValue: string,
  promptChars: readonly string[],
  currentInput: string
): TypingInputClampResult {
  const nextChars = toCharArray(nextRawValue).slice(0, promptChars.length);
  const currentChars = toCharArray(currentInput);
  const lockedLength = getLockedInputLength(promptChars, currentChars);

  if (nextChars.length < lockedLength) {
    return { nextInput: currentInput, lockedLength };
  }

  for (let i = 0; i < lockedLength; i += 1) {
    if (nextChars[i] !== currentChars[i]) {
      return { nextInput: currentInput, lockedLength };
    }
  }

  return {
    nextInput: nextChars.join(""),
    lockedLength,
  };
}
