# 작업 로그 - slime sprite magenta artifacts

- 원인: GPT image-gen 원본의 magenta separator가 안티앨리어싱/번짐으로 프레임 내부에 남았고, 기존 정규화에서 일부 pale/fuchsia 픽셀이 제거되지 않았다.
- 수정: 원본 시트를 다시 정규화하면서 separator 주변을 더 보수적으로 제외하고 checkerboard/ fuchsia artifact 픽셀을 투명 처리했다.
- 결과: `slime-bounce-guide-sample.png`, `slime-bounce-sample-sheet.png`를 재생성했다.
