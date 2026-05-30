package world.yeon.backend.traceability;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;

/**
 * 요구사항 추적성 검사기.
 *
 * <p>requirements.yaml(요구사항 원장) ↔ Karate feature 의 @REQ 태그 ↔ 테스트 파일의 정합성을
 * 빌드(./gradlew test)에서 강제한다. Jira/Xray 없이 레포 내부에서 추적성을 보장한다.
 * 작업 디렉터리(apps/backend) 기준 파일 IO 만 하므로 Spring 컨텍스트가 필요 없다.
 */
class RequirementsTraceabilityTest {

	private static final Path REQUIREMENTS = Paths.get("requirements.yaml");
	private static final Path KARATE_DIR = Paths.get("src/test/resources/karate");
	private static final Pattern REQ_TAG = Pattern.compile("@(REQ-[A-Z0-9-]+)");

	private record Requirement(String id, String priority, List<String[]> tests) {}

	private static final List<Requirement> requirements = new ArrayList<>();
	private static final Set<String> declaredIds = new LinkedHashSet<>();
	private static final Map<Path, Set<String>> featureTags = new LinkedHashMap<>();

	@BeforeAll
	@SuppressWarnings("unchecked")
	static void load() throws IOException {
		assertThat(Files.exists(REQUIREMENTS)).as("requirements.yaml 존재").isTrue();

		Map<String, Object> root;
		try (InputStream in = Files.newInputStream(REQUIREMENTS)) {
			root = new Yaml().load(in);
		}
		List<Map<String, Object>> reqs = (List<Map<String, Object>>) root.get("requirements");
		assertThat(reqs).as("requirements 목록").isNotNull();

		for (Map<String, Object> r : reqs) {
			List<String[]> tests = new ArrayList<>();
			Object t = r.get("tests");
			if (t instanceof List<?> list) {
				for (Object e : list) {
					Map<String, Object> m = (Map<String, Object>) e;
					tests.add(new String[] {String.valueOf(m.get("type")), String.valueOf(m.get("path"))});
				}
			}
			String id = String.valueOf(r.get("id"));
			requirements.add(new Requirement(id, String.valueOf(r.get("priority")), tests));
			declaredIds.add(id);
		}

		List<Path> features;
		try (Stream<Path> s = Files.walk(KARATE_DIR)) {
			features = s.filter(p -> p.toString().endsWith(".feature")).toList();
		}
		for (Path p : features) {
			Set<String> tags = new LinkedHashSet<>();
			for (String line : Files.readAllLines(p)) {
				Matcher mm = REQ_TAG.matcher(line);
				while (mm.find()) {
					tags.add(mm.group(1));
				}
			}
			featureTags.put(p.normalize(), tags);
		}
	}

	@Test
	void a_feature의_REQ태그는_원장에_존재한다() {
		// (a)(c): feature 가 원장에 없는(예: 삭제된) REQ ID 를 참조하면 실패.
		List<String> dangling = new ArrayList<>();
		featureTags.forEach((file, tags) -> {
			for (String tag : tags) {
				if (!declaredIds.contains(tag)) {
					dangling.add(file.getFileName() + " → @" + tag);
				}
			}
		});
		assertThat(dangling).as("원장에 없는 REQ 태그를 참조하는 feature").isEmpty();
	}

	@Test
	void b_P0_요구사항은_연결된_테스트가_있다() {
		List<String> missing = new ArrayList<>();
		for (Requirement r : requirements) {
			if ("P0".equalsIgnoreCase(r.priority()) && r.tests().isEmpty()) {
				missing.add(r.id());
			}
		}
		assertThat(missing).as("테스트가 없는 P0 요구사항").isEmpty();
	}

	@Test
	void d_원장의_테스트_경로는_실제_존재한다() {
		List<String> missing = new ArrayList<>();
		for (Requirement r : requirements) {
			for (String[] test : r.tests()) {
				if (!Files.exists(Paths.get(test[1]))) {
					missing.add(r.id() + " → " + test[1]);
				}
			}
		}
		assertThat(missing).as("원장에 적혔으나 실존하지 않는 테스트 경로").isEmpty();
	}

	@Test
	void e_karate로_연결된_요구사항은_해당_feature에_태그가_있다() {
		// 양방향: 원장이 "feature X 가 REQ Y 를 검증한다"고 하면, feature X 에 @REQ-Y 태그가 실제로 있어야 한다.
		List<String> mismatches = new ArrayList<>();
		for (Requirement r : requirements) {
			for (String[] test : r.tests()) {
				if (!"karate".equalsIgnoreCase(test[0])) {
					continue;
				}
				Set<String> tags = featureTags.get(Paths.get(test[1]).normalize());
				if (tags == null || !tags.contains(r.id())) {
					mismatches.add(r.id() + " ↔ " + test[1] + " (feature 에 @" + r.id() + " 태그 없음)");
				}
			}
		}
		assertThat(mismatches).as("원장-feature 양방향 불일치").isEmpty();
	}
}
