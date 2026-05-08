package world.yeon.backend.space_access.service;

import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.space_access.repository.SpaceAccessRepository;

@Service
@Profile("jdbc")
public class SpaceAccessService {
	private final SpaceAccessRepository repository;
	public SpaceAccessService(SpaceAccessRepository repository) { this.repository = repository; }
	public boolean requireOwnedSpace(String spaceId, UUID userId) {
		if (!repository.existsOwnedSpace(spaceId, userId)) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		return true;
	}
}
