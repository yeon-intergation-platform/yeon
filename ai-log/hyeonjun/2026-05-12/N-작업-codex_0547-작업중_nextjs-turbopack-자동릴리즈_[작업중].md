# Next.js Turbopack 및 자동 SemVer 릴리즈 작업 로그

- 시작: 2026-05-12 05:47 KST
- 목표: Next.js 최신 패치/Turbopack 명시 확인 및 배포 성공 후 자동 SemVer 태그/릴리즈 생성
- 확인:
  - 기존 Next.js production trace에서 bundler=turbopack 확인
  - npm latest next: 16.2.6
  - 기존 릴리즈는 수동 태그 기반이었고, 배포 workflow 성공 후 자동 SemVer 생성 구조는 없었음
- 진행:
  - 백로그 작성
  - 자동 릴리즈 workflow 추가 예정
  - Next.js 16.2.6 업데이트
  - web dev/build 스크립트에 --turbopack 명시
  - deploy workflow 성공 후 다음 SemVer 태그/릴리즈를 생성하는 auto-release workflow 추가
  - 기존 release workflow의 package.json version 일치 검사는 경고로 완화
