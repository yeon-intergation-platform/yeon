package world.yeon.backend.card_decks.recall.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CardRecallTextPolicyTests {
	@Test void 일반텍스트와이미지대체설명은채점가능하다() {
		assertThat(CardRecallTextPolicy.hasGradeableText("<p>세포의 역할은?</p>")).isTrue();
		assertThat(CardRecallTextPolicy.hasGradeableText("<img src='cell.png' alt='세포 구조'>")).isTrue();
	}

	@Test void 설명없는미디어와빈마크업은채점하지않는다() {
		assertThat(CardRecallTextPolicy.hasGradeableText("<img src='cell.png'>")).isFalse();
		assertThat(CardRecallTextPolicy.hasGradeableText("<p><br>&nbsp;</p>")).isFalse();
	}
}
