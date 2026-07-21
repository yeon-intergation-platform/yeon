from pathlib import Path
import re
import glob
import uuid

from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:3001"
EVIDENCE_DIR = Path(
    "ai-log/hyeonjun/2026-07-22/yeon-today-server-redesign-screenshots"
)


def screenshot(page, name: str) -> None:
    page.screenshot(path=str(EVIDENCE_DIR / name), full_page=True)


def add_task(page, title: str, priority: str = "보통", estimate: str = "30분") -> None:
    page.get_by_label("할 일 제목").fill(title)
    page.get_by_label("우선순위", exact=True).select_option(label=priority)
    page.get_by_role("button", name="예상 시간").click()
    page.get_by_role("option", name=estimate, exact=True).click()
    page.get_by_role("button", name=re.compile(r"(오늘에 추가|월 \d+일에 추가)$")).click()
    page.get_by_label("할 일 제목").wait_for(state="visible")
    page.wait_for_timeout(120)


def assert_no_horizontal_overflow(page) -> None:
    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"horizontal overflow detected: {overflow}px"


def run() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    console_errors: list[str] = []

    with sync_playwright() as playwright:
        cached_chromium = sorted(
            glob.glob(
                str(
                    Path.home()
                    / "Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell"
                )
            )
        )
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=cached_chromium[-1] if cached_chromium else None,
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1080})
        page = context.new_page()
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )

        account = f"today-qa-{uuid.uuid4().hex}"
        page.goto(
            f"{BASE_URL}/api/auth/dev-login?create=1&account={account}&next=%2Ftoday%3Fdate%3D2026-07-22"
        )
        page.wait_for_load_state("networkidle")
        assert "/today?date=2026-07-22" in page.url
        page.get_by_role("heading", name="오늘 할 일").wait_for()

        assert page.evaluate(
            "localStorage.getItem('yeon.todo-service.state.v1')"
        ) is None
        screenshot(page, "01-empty-desktop.png")
        assert_no_horizontal_overflow(page)

        page.get_by_label("할 일 제목").fill("강릉 일정표 마무리")
        page.get_by_label("우선순위", exact=True).select_option(label="보통")
        page.get_by_role("button", name="예상 시간").click()
        page.get_by_role("option", name="45분", exact=True).click()
        page.get_by_role("button", name="예상 시간").click()
        page.get_by_role("button", name="오늘에 추가").wait_for()
        page.wait_for_timeout(100)
        screenshot(page, "02-add-task-desktop.png")
        page.get_by_role("option", name="45분", exact=True).click()
        page.get_by_role("button", name="오늘에 추가").click()
        page.get_by_label("할 일 목록").get_by_text(
            "강릉 일정표 마무리", exact=True
        ).wait_for()

        tasks = [
            ("포트폴리오 문장 수정", "높음", "45분"),
            ("Cloudflare 도메인 smoke 확인", "보통", "15분"),
            ("API 예외 처리 로직 개선", "높음", "60분"),
            ("운동 30분", "보통", "30분"),
            ("블로그 글 초안 작성", "낮음", "45분"),
            ("주간 회고 및 계획 정리", "보통", "30분"),
            ("독서 20페이지", "낮음", "15분"),
        ]
        for task_title, task_priority, task_estimate in tasks:
            add_task(page, task_title, task_priority, task_estimate)

        page.get_by_label("할 일 제목").fill("이동 확인용")
        page.get_by_role("button", name="예상 시간").click()
        page.get_by_role("option", name="5분", exact=True).click()
        page.get_by_role("button", name="Inbox에 저장").click()
        page.get_by_role("tab", name=re.compile(r"Inbox\s+1")).click()
        page.get_by_label("이동 확인용 더보기").click()
        page.get_by_role("button", name="선택 날짜로 이동").click()
        page.get_by_role("tab", name=re.compile(r"Today\s+9")).click()

        page.get_by_label("이동 확인용 더보기").click()
        page.get_by_role("button", name="수정", exact=True).click()
        page.get_by_label("이동 확인용 제목 수정").fill("수정 삭제 확인용")
        page.get_by_label("이동 확인용 우선순위 수정").select_option(label="낮음")
        page.get_by_label("이동 확인용 예상 시간 수정").fill("10")
        page.get_by_role("button", name="저장", exact=True).click()
        page.get_by_label("할 일 목록").get_by_text(
            "수정 삭제 확인용", exact=True
        ).wait_for()
        page.get_by_label("수정 삭제 확인용 더보기").click()
        page.once("dialog", lambda dialog: dialog.accept())
        page.get_by_role("button", name="삭제", exact=True).click()
        page.get_by_role("tab", name=re.compile(r"Today\s+8")).wait_for()

        page.get_by_label("강릉 일정표 마무리 더보기").click()
        page.once("dialog", lambda dialog: dialog.accept())
        page.get_by_role("button", name="삭제", exact=True).click()
        page.get_by_role("tab", name=re.compile(r"Today\s+7")).wait_for()

        for title in [
            "포트폴리오 문장 수정",
            "Cloudflare 도메인 smoke 확인",
            "블로그 글 초안 작성",
        ]:
            page.get_by_role("button", name=f"{title} 완료").click()
            page.wait_for_timeout(120)
        page.get_by_role("tab", name=re.compile(r"Done\s+3")).click()
        assert (
            page.get_by_label("할 일 목록")
            .get_by_text("포트폴리오 문장 수정", exact=True)
            .count()
            == 1
        )
        page.get_by_role("tab", name=re.compile(r"Today\s+7")).click()
        page.get_by_label("우선순위 필터").select_option(label="높음")
        assert (
            page.get_by_label("할 일 목록")
            .get_by_text("독서 20페이지", exact=True)
            .count()
            == 0
        )
        page.get_by_label("우선순위 필터").select_option(label="전체")
        screenshot(page, "03-main-dashboard-desktop.png")

        add_task(page, "팀 데일리 미팅 준비", "보통", "30분")
        for title in ["API 예외 처리 로직 개선", "운동 30분"]:
            page.get_by_role("button", name=f"{title} 완료").click()
            page.wait_for_timeout(120)
        page.reload()
        page.wait_for_load_state("networkidle")
        assert (
            page.get_by_label("할 일 목록")
            .get_by_text("포트폴리오 문장 수정", exact=True)
            .count()
            == 1
        )
        assert page.get_by_role("tab", name=re.compile(r"Today\s+8")).count() == 1
        screenshot(page, "04-active-state-desktop.png")

        page.get_by_role("gridcell", name=re.compile(r"7월 24일")).click()
        page.wait_for_url(f"{BASE_URL}/today?date=2026-07-24")
        page.wait_for_load_state("networkidle")
        assert "date=2026-07-24" in page.url
        for title, priority, estimate in [
            ("API 에러 처리 로직 개선", "높음", "60분"),
            ("운동 30분", "보통", "30분"),
            ("독서 20페이지", "낮음", "15분"),
            ("주간 회고 및 계획 정리", "보통", "30분"),
            ("블로그 글 초안 작성", "낮음", "45분"),
        ]:
            add_task(page, title, priority, estimate)
        page.get_by_role("button", name="운동 30분 완료").click()
        page.wait_for_timeout(150)
        screenshot(page, "05-selected-date-desktop.png")

        page.get_by_role("link", name="하루 기록").click()
        page.wait_for_load_state("networkidle")
        assert "/today/record?date=2026-07-24" in page.url
        page.get_by_role("option", name="공부").click()
        page.get_by_role(
            "button", name="9시, 기록 없음. 선택한 활동으로 기록", exact=True
        ).click()
        page.get_by_text("1시간 기록 · 4%").wait_for()
        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.get_by_text("1시간 기록 · 4%").count() == 1
        screenshot(page, "06-record-desktop.png")

        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(250)
        assert_no_horizontal_overflow(page)
        screenshot(page, "07-record-mobile.png")

        page.get_by_role("link", name="할 일 보드").click()
        page.wait_for_load_state("networkidle")
        assert_no_horizontal_overflow(page)
        screenshot(page, "08-board-mobile.png")

        unlabeled_buttons = page.locator("button").evaluate_all(
            "els => els.filter(el => el.offsetParent !== null && !((el.textContent || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title'))).map(el => el.outerHTML.slice(0, 240))"
        )
        assert not unlabeled_buttons, f"unlabeled buttons: {unlabeled_buttons}"
        assert not console_errors, f"browser console errors: {console_errors}"

        browser.close()

    print("PLAYWRIGHT_QA_OK")


if __name__ == "__main__":
    run()
