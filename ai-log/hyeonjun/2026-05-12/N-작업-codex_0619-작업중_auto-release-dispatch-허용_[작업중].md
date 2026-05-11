# Auto release workflow_dispatch 허용 작업 로그

- 시작: 2026-05-12 06:19 KST
- 목표: Docker 배포 workflow가 push뿐 아니라 workflow_dispatch로 성공해도 자동 SemVer 릴리즈가 생성되게 보정
- 근거: main 배포 run 25697146490은 workflow_dispatch 성공이었고 기존 auto-release 조건이 push만 허용해 skipped 처리됨
- 변경: auto-release workflow 조건에 workflow_dispatch 배포 성공도 허용
