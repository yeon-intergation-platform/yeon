package world.yeon.backend.space_access.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.space_access.repository.SpaceAccessRepository;

@ExtendWith(MockitoExtension.class)
class SpaceAccessServiceTests {
	@Mock private SpaceAccessRepository repository;
	private SpaceAccessService service;
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000971");
	@BeforeEach void setUp() { service = new SpaceAccessService(repository); }
	@Test void owned면ok다() {
		when(repository.existsOwnedSpace("space-1", OWNER_ID)).thenReturn(true);
		assertThat(service.requireOwnedSpace("space-1", OWNER_ID)).isTrue();
	}
	@Test void missing이면404계열예외다() {
		when(repository.existsOwnedSpace("space-1", OWNER_ID)).thenReturn(false);
		assertThatThrownBy(() -> service.requireOwnedSpace("space-1", OWNER_ID)).isInstanceOf(NoSuchElementException.class);
	}
}
