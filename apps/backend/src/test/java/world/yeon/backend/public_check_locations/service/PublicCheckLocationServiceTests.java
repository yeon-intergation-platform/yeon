package world.yeon.backend.public_check_locations.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.public_check_locations.repository.PublicCheckLocationRepository;

@ExtendWith(MockitoExtension.class)
class PublicCheckLocationServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000961");
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Mock private PublicCheckLocationRepository repository;
	@Mock private KakaoLocationGateway gateway;
	private PublicCheckLocationService service;

	@BeforeEach void setUp() {
		service = new PublicCheckLocationService(repository, gateway);
	}

	@Test void 짧은query는빈결과를반환한다() {
		when(repository.isOwnedSpace(OWNER_ID, "space_alpha")).thenReturn(true);
		var result = service.search(OWNER_ID, "space_alpha", "가");
		assertThat(result.results()).isEmpty();
	}

	@Test void ownership없으면404다() {
		when(repository.isOwnedSpace(OWNER_ID, "space_alpha")).thenReturn(false);
		assertThatThrownBy(() -> service.search(OWNER_ID, "space_alpha", "강남"))
			.isInstanceOf(PublicCheckLocationServiceException.class)
			.hasMessage("스페이스를 찾지 못했습니다.");
	}

	@Test void keyword와address를정규화한다() throws Exception {
		when(repository.isOwnedSpace(OWNER_ID, "space_alpha")).thenReturn(true);
		when(gateway.keywordSearch(eq("test-kakao-key"), eq("강남"))).thenReturn(objectMapper.readTree("""
			{"documents":[{"id":"1","place_name":"강남역","address_name":"서울 강남구","road_address_name":"서울 강남구 테헤란로","x":"127.0","y":"37.5"}]}
			"""));
		when(gateway.addressSearch(eq("test-kakao-key"), eq("강남"))).thenReturn(objectMapper.readTree("""
			{"documents":[{"address_name":"서울 강남구","x":"127.0","y":"37.5","address":{"address_name":"서울 강남구"},"road_address":{"address_name":"서울 강남구 테헤란로","building_name":"강남역"}}]}
			"""));

		var original = System.getProperty("KAKAO_REST_API_KEY");
		try {
			System.setProperty("KAKAO_REST_API_KEY", "test-kakao-key");
			var result = service.search(OWNER_ID, "space_alpha", "강남");
			assertThat(result.results()).hasSize(1);
			assertThat(result.results().getFirst().label()).contains("강남역");
		} finally {
			if (original == null) {
				System.clearProperty("KAKAO_REST_API_KEY");
			} else {
				System.setProperty("KAKAO_REST_API_KEY", original);
			}
		}
	}
}
