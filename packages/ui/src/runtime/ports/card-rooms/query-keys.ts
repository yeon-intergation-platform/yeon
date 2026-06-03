// 카드룸 queryKey SSOT.
//
// 현재 카드룸은 web 전용(모바일 부재)이라 drift 파트너가 없지만, queryKey 패턴을
// card-deck/life-os/typing과 동일하게 단일 출처로 둔다. 모바일 카드룸 도입 시 여기서 파생한다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml (id: card-rooms-query-keys)

export const cardRoomsQueryKey = () => ["card-rooms"] as const;
