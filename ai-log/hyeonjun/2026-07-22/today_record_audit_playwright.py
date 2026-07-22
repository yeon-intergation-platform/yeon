import glob
import json
import os
import re
import uuid
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("TODAY_QA_BASE_URL", "http://localhost:3001")
EVIDENCE_DIR = Path(
    "ai-log/hyeonjun/2026-07-22/yeon-today-record-qa-2-screenshots"
)
QA_DATE = "2026-07-22"
EVIDENCE_PHASE = os.environ.get("TODAY_QA_PHASE", "before")


def assert_no_page_overflow(page) -> None:
    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"페이지 가로 overflow: {overflow}px"


def visible_unnamed_buttons(page) -> list[str]:
    return page.locator("button").evaluate_all(
        """
        elements => elements
          .filter(element => element.offsetParent !== null)
          .filter(element => !(
            (element.textContent || '').trim()
            || element.getAttribute('aria-label')
            || element.getAttribute('title')
          ))
          .map(element => element.outerHTML.slice(0, 240))
        """
    )


def run() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    console_errors: list[str] = []
    page_errors: list[str] = []
    api_errors: list[str] = []
    diagnostics: dict[str, object] = {}

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
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on(
            "response",
            lambda response: api_errors.append(
                f"{response.status} {response.request.method} {response.url}"
            )
            if "/api/v1/today/" in response.url and response.status >= 400
            else None,
        )

        account = f"today-record-audit-{uuid.uuid4().hex}"
        next_path = f"/today/record?date={QA_DATE}"
        page.goto(
            f"{BASE_URL}/api/auth/dev-login?create=1&account={account}"
            f"&next={next_path.replace('/', '%2F').replace('?', '%3F').replace('=', '%3D')}"
        )
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="하루 기록")).to_be_visible()
        expect(page.get_by_role("link", name="하루 기록")).to_have_attribute(
            "aria-current", "page"
        )
        assert page.evaluate(
            "localStorage.getItem('yeon.todo-service.state.v1')"
        ) is None

        activity_list = page.get_by_role("listbox", name="기록할 활동")
        study = page.get_by_role("option", name="공부", exact=True)
        expect(study).to_have_attribute("aria-selected", "true")
        diagnostics[f"activity_list_{EVIDENCE_PHASE}"] = activity_list.evaluate(
            """
            element => {
              const style = getComputedStyle(element);
              const selected = element.querySelector('[aria-selected="true"]');
              const selectedStyle = selected ? getComputedStyle(selected) : null;
              const rowRect = element.getBoundingClientRect();
              const buttonRect = selected?.getBoundingClientRect();
              return {
                overflowX: style.overflowX,
                overflowY: style.overflowY,
                paddingTop: style.paddingTop,
                paddingRight: style.paddingRight,
                paddingBottom: style.paddingBottom,
                paddingLeft: style.paddingLeft,
                rowRect: {top: rowRect.top, right: rowRect.right, bottom: rowRect.bottom, left: rowRect.left},
                buttonRect: buttonRect ? {top: buttonRect.top, right: buttonRect.right, bottom: buttonRect.bottom, left: buttonRect.left} : null,
                selectedBoxShadow: selectedStyle?.boxShadow,
              };
            }
            """
        )
        page.screenshot(
            path=str(EVIDENCE_DIR / f"{EVIDENCE_PHASE}-record-empty-desktop.png"),
            full_page=True,
        )
        activity_list.screenshot(
            path=str(
                EVIDENCE_DIR
                / f"{EVIDENCE_PHASE}-activity-selection-ring-desktop.png"
            )
        )
        assert_no_page_overflow(page)

        meal = page.get_by_role("option", name="식사", exact=True)
        meal.click()
        expect(meal).to_have_attribute("aria-selected", "true")
        expect(study).to_have_attribute("aria-selected", "false")
        page.get_by_role(
            "button", name="9시, 기록 없음. 선택한 활동으로 기록", exact=True
        ).click()
        expect(page.get_by_text("1시간 기록 · 4%", exact=True)).to_be_visible()
        expect(page.get_by_text("식사", exact=True).last).to_be_visible()

        exercise = page.get_by_role("option", name="운동", exact=True)
        exercise.click()
        page.get_by_role(
            "button", name="9시, 식사. 선택한 활동으로 기록", exact=True
        ).click()
        expect(
            page.get_by_role(
                "button", name="9시, 운동. 선택한 활동으로 기록", exact=True
            )
        ).to_be_visible()
        expect(page.get_by_text("운동", exact=True).last).to_be_visible()

        page.reload()
        page.wait_for_load_state("networkidle")
        expect(
            page.get_by_role(
                "button", name="9시, 운동. 선택한 활동으로 기록", exact=True
            )
        ).to_be_visible()
        page.get_by_role("button", name="9시 기록 삭제", exact=True).click()
        expect(page.get_by_text("0시간 기록 · 0%", exact=True)).to_be_visible()

        page.get_by_role("button", name="활동 관리", exact=True).click()
        custom_activity = f"QA활동-{uuid.uuid4().hex[:6]}"
        page.get_by_label("새 활동 이름").fill(custom_activity)
        page.get_by_label("활동 색상").select_option("green")
        page.get_by_label("활동 아이콘").select_option("circle")
        page.get_by_role("button", name="추가", exact=True).click()
        custom_option = page.get_by_role("option", name=custom_activity, exact=True)
        expect(custom_option).to_be_visible()
        custom_option.click()
        page.get_by_role(
            "button", name="10시, 기록 없음. 선택한 활동으로 기록", exact=True
        ).click()
        expect(page.get_by_text(custom_activity, exact=True).last).to_be_visible()
        custom_row = page.get_by_role("listitem").filter(has_text=custom_activity)
        custom_row.get_by_role("button", name="숨기기", exact=True).click()
        expect(custom_option).to_have_count(0)
        expect(page.get_by_text(custom_activity, exact=True).last).to_be_visible()
        page.get_by_role("button", name="10시 기록 삭제", exact=True).click()
        expect(page.get_by_text("0시간 기록 · 0%", exact=True)).to_be_visible()

        page.get_by_role("gridcell", name=re.compile(r"7월 23일")).click()
        page.wait_for_url(f"{BASE_URL}/today/record?date=2026-07-23")
        page.get_by_role("link", name="할 일 보드", exact=True).click()
        page.wait_for_url(f"{BASE_URL}/today?date=2026-07-23")
        page.get_by_role("link", name="하루 기록", exact=True).click()
        page.wait_for_url(f"{BASE_URL}/today/record?date=2026-07-23")
        expect(page.get_by_role("heading", name="활동 선택")).to_be_visible()

        page.set_viewport_size({"width": 390, "height": 844})
        expect(page.get_by_role("heading", name="하루 기록")).to_be_visible()
        assert_no_page_overflow(page)
        diagnostics["mobile_fixed_elements"] = page.locator("body *").evaluate_all(
            """
            elements => elements
              .filter(element => element.offsetParent !== null)
              .filter(element => getComputedStyle(element).position === 'fixed')
              .map(element => {
                const rect = element.getBoundingClientRect();
                return {
                  tag: element.tagName,
                  text: (element.textContent || '').trim().slice(0, 80),
                  ariaLabel: element.getAttribute('aria-label'),
                  title: element.getAttribute('title'),
                  rect: {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left},
                  className: typeof element.className === 'string' ? element.className : '',
                };
              })
            """
        )
        page.screenshot(
            path=str(EVIDENCE_DIR / f"{EVIDENCE_PHASE}-record-mobile.png"),
            full_page=True,
        )

        page.set_viewport_size({"width": 1024, "height": 900})
        assert_no_page_overflow(page)
        page.screenshot(
            path=str(EVIDENCE_DIR / f"{EVIDENCE_PHASE}-record-tablet.png"),
            full_page=True,
        )

        assert not visible_unnamed_buttons(page), "이름 없는 버튼이 있습니다."
        assert not api_errors, f"Today API 오류: {api_errors}"
        assert not page_errors, f"브라우저 런타임 오류: {page_errors}"
        assert not console_errors, f"브라우저 console 오류: {console_errors}"
        browser.close()

    print(json.dumps(diagnostics, ensure_ascii=False, indent=2))
    print("TODAY_RECORD_AUDIT_OK")


if __name__ == "__main__":
    run()
