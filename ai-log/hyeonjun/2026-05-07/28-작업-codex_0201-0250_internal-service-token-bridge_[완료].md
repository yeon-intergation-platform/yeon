# internal service token bridge

- 작업 목표: Next BFF -> Spring internal GET transport의 401 blocker 해소
- 작업 범위: backend internal token filter, web helper header 추가, 보안 테스트/route test 갱신
- 기준: outward auth source of truth는 여전히 Next
- 비목표: 브라우저 public auth 변경, JWT migration

## 재발방지 메모

- internal contract가 있어도 transport auth가 없으면 runtime에서는 바로 401 blocker가 난다.
- BFF migration 단계에서는 domain contract뿐 아니라 internal service auth bridge도 함께 확인해야 한다.
