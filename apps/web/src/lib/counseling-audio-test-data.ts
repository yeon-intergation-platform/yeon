import { PUBLIC_MP3_ASSET_URLS } from "./public-mp3-assets";

export const COUNSELING_AUDIO_TEST_DATA = [
  {
    id: "ultra-light",
    label: "초경량 테스트 데이터",
    shortLabel: "초경량",
    description: "짧은 상담 흐름 확인용",
    fileName: "test-counseling.mp3",
    href: PUBLIC_MP3_ASSET_URLS.counselingTestUltraLight,
  },
  {
    id: "light",
    label: "경량 테스트 데이터",
    shortLabel: "경량",
    description: "20분 전사 품질 확인용",
    fileName: "상담기록_테스트음성_20분.mp3",
    href: PUBLIC_MP3_ASSET_URLS.counselingTestLight,
  },
  {
    id: "heavy",
    label: "중량 테스트 데이터",
    shortLabel: "중량",
    description: "1시간 장문 전사 확인용",
    fileName: "test-bootcamp-counseling-1hour.mp3",
    href: PUBLIC_MP3_ASSET_URLS.counselingTestHeavy,
  },
] as const;

export type CounselingAudioTestDataId =
  (typeof COUNSELING_AUDIO_TEST_DATA)[number]["id"];

export function getCounselingAudioTestDataById(id: CounselingAudioTestDataId) {
  return COUNSELING_AUDIO_TEST_DATA.find((sample) => sample.id === id) ?? null;
}
