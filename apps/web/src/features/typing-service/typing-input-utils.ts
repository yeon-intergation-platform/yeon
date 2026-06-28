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

  // 오타가 나면 그 지점에서 입력을 멈춘다: 정타 프리픽스 + 오타 1글자까지만 허용하고
  // 그 뒤 글자는 잘라낸다. 사용자가 backspace로 오타를 지워야 계속 입력할 수 있다.
  // (현재 글자가 IME 조합 중인 정타 후보일 수 있으므로 1글자는 항상 허용한다.)
  const nextCorrectPrefix = getLockedInputLength(promptChars, nextChars);
  const maxLength = Math.min(nextCorrectPrefix + 1, promptChars.length);

  return {
    nextInput: nextChars.slice(0, maxLength).join(""),
    lockedLength,
  };
}
