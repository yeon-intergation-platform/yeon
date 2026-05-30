package world.yeon.backend.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.library.freeze.FreezingArchRule;
import org.springframework.web.bind.annotation.RestController;

/**
 * 코드 구조(레이어/의존 방향/순환)를 테스트로 보호한다. 기능 검증(Cucumber/Karate)과 별개로,
 * 컨트롤러→서비스→리포지토리 단방향과 도메인 슬라이스 간 순환 부재를 강제한다.
 */
@AnalyzeClasses(packages = "world.yeon.backend", importOptions = ImportOption.DoNotIncludeTests.class)
class LayeredArchitectureTest {

	@ArchTest
	static final ArchRule 컨트롤러는_리포지토리를_직접_참조하지_않는다 =
		noClasses().that().resideInAPackage("..controller..")
			.should().dependOnClassesThat().resideInAPackage("..repository..");

	@ArchTest
	static final ArchRule 리포지토리는_컨트롤러를_의존하지_않는다 =
		noClasses().that().resideInAPackage("..repository..")
			.should().dependOnClassesThat().resideInAPackage("..controller..");

	@ArchTest
	static final ArchRule 서비스는_컨트롤러를_의존하지_않는다 =
		noClasses().that().resideInAPackage("..service..")
			.should().dependOnClassesThat().resideInAPackage("..controller..");

	@ArchTest
	static final ArchRule RestController는_controller_패키지에_둔다 =
		classes().that().areAnnotatedWith(RestController.class)
			.should().resideInAPackage("..controller..");

	// 기존 credential_auth ↔ root_auth 순환은 베이스라인으로 동결한다(기술 부채로 기록).
	// 새로 생기는 도메인 슬라이스 순환만 실패시켜 구조를 보호한다(FreezingArchRule).
	@ArchTest
	static final ArchRule 도메인_슬라이스간_신규_순환참조가_없다 =
		FreezingArchRule.freeze(
			slices().matching("world.yeon.backend.(*)..").should().beFreeOfCycles());
}
