package world.yeon.backend.bootstrap.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BootstrapHeartbeatRepository
		extends JpaRepository<BootstrapHeartbeat, String> {
}
