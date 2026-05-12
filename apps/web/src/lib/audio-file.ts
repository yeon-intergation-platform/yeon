const FALLBACK_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
  ".opus",
  ".mpga",
] as const;

const FALLBACK_AUDIO_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
]);

export const AUDIO_UPLOAD_ERROR_MESSAGE = "오디오 파일만 업로드할 수 있습니다.";

export function isAcceptedAudioFile(file: {
  type?: string | null;
  name?: string | null;
}) {
  const normalizedType = (file.type ?? "").trim().toLowerCase();
  const normalizedName = (file.name ?? "").trim().toLowerCase();

  if (normalizedType.startsWith("audio/")) {
    return true;
  }

  if (!FALLBACK_AUDIO_MIME_TYPES.has(normalizedType)) {
    return false;
  }

  return FALLBACK_AUDIO_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension)
  );
}

export async function readAudioDurationMs(file: File) {
  if (typeof window === "undefined") {
    return null;
  }

  return new Promise<number | null>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const audioElement = document.createElement("audio");
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audioElement.removeAttribute("src");
    };

    audioElement.preload = "metadata";
    audioElement.onloadedmetadata = () => {
      const durationSeconds = audioElement.duration;
      cleanup();
      resolve(
        Number.isFinite(durationSeconds) && durationSeconds > 0
          ? Math.round(durationSeconds * 1000)
          : null
      );
    };
    audioElement.onerror = () => {
      cleanup();
      resolve(null);
    };
    audioElement.src = objectUrl;
  });
}
