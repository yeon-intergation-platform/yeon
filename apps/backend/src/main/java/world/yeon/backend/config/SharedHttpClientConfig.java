package world.yeon.backend.config;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * IDX 83: java.net.http.HttpClient 는 thread-safe 하고 생성 비용이 큰 객체라 슬라이스마다 new 로 만들지 않고
 * 공용 Bean 으로 주입해 재사용한다. connect timeout 을 둬 외부 응답 지연 시 톰캣 스레드가 무기한 블로킹되지 않게 한다.
 */
@Configuration
public class SharedHttpClientConfig {
	@Bean
	@ConditionalOnMissingBean(HttpClient.class)
	public HttpClient sharedHttpClient() {
		return HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(5))
			.build();
	}
}
