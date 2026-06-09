const UNREADABLE_ERROR_KIND = "처리할 수 없는 오류 형식";

type UnknownErrorDescription = {
  isNativeError: boolean;
  message: string;
};

function describeUnknownError(error: unknown): UnknownErrorDescription {
  if (error instanceof Error) {
    return { isNativeError: true, message: error.message };
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return { isNativeError: false, message: error.trim() };
  }

  return {
    isNativeError: false,
    message: `${UNREADABLE_ERROR_KIND}(${String(error)})`,
  };
}

export function getCardServiceCauseMessage(error: unknown): string {
  return describeUnknownError(error).message;
}

export function getCardServiceErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const description = describeUnknownError(error);

  if (description.isNativeError) {
    return description.message;
  }

  return `${fallbackMessage} 원인: ${description.message}`;
}
