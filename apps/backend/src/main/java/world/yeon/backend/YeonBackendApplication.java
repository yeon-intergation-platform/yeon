package world.yeon.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YeonBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(YeonBackendApplication.class, args);
	}

}
