from pathlib import Path
import glob

from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:3001"
EVIDENCE_DIR = Path(
    "ai-log/hyeonjun/2026-07-22/owner-portfolio-screenshots"
)


def assert_no_horizontal_overflow(page) -> None:
    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"horizontal overflow detected: {overflow}px"


def screenshot(page, filename: str) -> None:
    page.screenshot(path=str(EVIDENCE_DIR / filename), full_page=True)


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
        context = browser.new_context(viewport={"width": 1440, "height": 1050})
        page = context.new_page()
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_role(
            "heading", name="현재 9가지 서비스를 운영 중입니다."
        ).wait_for()
        portfolio_card = page.locator('a[href="/portfolio"]')
        assert portfolio_card.count() == 1
        assert "쥔장의 포트폴리오" in portfolio_card.inner_text()
        assert "9" in portfolio_card.inner_text()
        screenshot(page, "01-landing-nine-services-desktop.png")
        assert_no_horizontal_overflow(page)

        portfolio_card.click()
        page.wait_for_url(f"{BASE_URL}/portfolio")
        page.wait_for_load_state("networkidle")
        assert page.url == f"{BASE_URL}/portfolio"
        page.get_by_role("heading", name="문제를 확인하고, 끝까지 고칩니다.").wait_for()
        assert page.locator('link[rel="canonical"]').get_attribute("href") == (
            "https://portforlio.yeon.world"
        )
        assert page.locator("#project-gallery article").count() == 7
        assert page.get_by_text("이미지 준비 중", exact=True).count() == 7

        github_link = page.locator('a[href="https://github.com/Hyeonjun0527"]').first
        blog_link = page.locator(
            'a[href="https://osumaniaddict527.tistory.com"]'
        ).first
        for external_link in (github_link, blog_link):
            assert external_link.get_attribute("target") == "_blank"
            rel = external_link.get_attribute("rel") or ""
            assert "noopener" in rel and "noreferrer" in rel

        portfolio_download = page.locator(
            '#documents a[href="/documents/choi-hyeonjun-portfolio-v22.pdf"]'
        )
        resume_download = page.locator(
            '#documents a[href="/documents/choi-hyeonjun-resume-v21.pdf"]'
        )
        assert portfolio_download.get_attribute("download") == (
            "최현준_포트폴리오_v22.pdf"
        )
        assert resume_download.get_attribute("download") == "최현준_이력서_v21.pdf"

        with page.expect_download() as download_info:
            portfolio_download.click()
        assert download_info.value.suggested_filename == "최현준_포트폴리오_v22.pdf"

        for href, minimum_size in (
            ("/documents/choi-hyeonjun-portfolio-v22.pdf", 1_500_000),
            ("/documents/choi-hyeonjun-resume-v21.pdf", 1_000_000),
        ):
            response = context.request.get(f"{BASE_URL}{href}")
            assert response.ok
            assert response.headers.get("content-type") == "application/pdf"
            assert len(response.body()) >= minimum_size

        gallery_grid = page.locator("#project-gallery article").first.locator("..")
        desktop_columns = gallery_grid.evaluate(
            "element => getComputedStyle(element).gridTemplateColumns.split(' ').length"
        )
        assert desktop_columns == 3
        screenshot(page, "02-portfolio-desktop.png")
        assert_no_horizontal_overflow(page)

        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(f"{BASE_URL}/portfolio")
        page.wait_for_load_state("networkidle")
        page.get_by_role("heading", name="문제를 확인하고, 끝까지 고칩니다.").wait_for()
        mobile_columns = page.locator("#project-gallery article").first.locator(
            ".."
        ).evaluate(
            "element => getComputedStyle(element).gridTemplateColumns.split(' ').length"
        )
        assert mobile_columns == 1
        screenshot(page, "03-portfolio-mobile.png")
        assert_no_horizontal_overflow(page)

        subdomain_context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            extra_http_headers={"x-forwarded-host": "portforlio.yeon.world"},
        )
        subdomain_page = subdomain_context.new_page()
        subdomain_page.goto(BASE_URL)
        subdomain_page.wait_for_load_state("networkidle")
        subdomain_page.get_by_role(
            "heading", name="문제를 확인하고, 끝까지 고칩니다."
        ).wait_for()
        assert subdomain_page.locator('link[rel="canonical"]').get_attribute(
            "href"
        ) == "https://portforlio.yeon.world"
        screenshot(subdomain_page, "04-subdomain-rewrite-desktop.png")
        subdomain_context.close()

        assert console_errors == [], f"browser console errors: {console_errors}"
        context.close()
        browser.close()


if __name__ == "__main__":
    run()
