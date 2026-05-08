package world.yeon.backend.bootstrap.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bootstrap_heartbeat", schema = "yeon_backend")
public class BootstrapHeartbeat {

	@Id
	@Column(name = "id", nullable = false, length = 64)
	private String id;

	@Column(name = "label", nullable = false, length = 120)
	private String label;

	protected BootstrapHeartbeat() {
	}

	public BootstrapHeartbeat(String id, String label) {
		this.id = id;
		this.label = label;
	}

	public String getId() {
		return id;
	}

	public String getLabel() {
		return label;
	}
}
