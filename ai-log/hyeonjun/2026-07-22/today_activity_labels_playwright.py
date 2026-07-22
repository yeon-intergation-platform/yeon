import glob
import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("TODAY_LABEL_BASE_URL", "http://localhost:3001")
PHASE = os.environ.get("TODAY_LABEL_PHASE", "after")
EVIDENCE_DIR = Path(
    "ai-log/hyeonjun/2026-07-22/yeon-today-activity-labels-screenshots"
)
QA_DATE = "2026-07-22"

COLOR_VALUES = ["blue", "green", "orange", "purple", "yellow", "red", "gray"]
ICON_VALUES = [
    "book",
    "gamepad",
    "utensils",
    "car",
    "coffee",
    "moon",
    "dumbbell",
    "circle",
]
COLOR_LABELS = ["파랑", "초록", "주황", "보라", "노랑", "빨강", "회색"]
ICON_LABELS = ["책", "게임패드", "식기", "자동차", "컵", "달", "운동", "점"]


def activity_type(index: int, name: str, color: str, icon: str) -> dict:
    return {
        "id": f"00000000-0000-4000-8000-{index:012d}",
        "name": name,
        "colorToken": color,
        "iconKey": icon,
        "sortOrder": index,
        "active": True,
        "version": 0,
    }


def run() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    created_requests: list[dict] = []
    slot_requests: list[dict] = []
    activities = [
        activity_type(index + 1, name, color, icon)
        for index, (name, color, icon) in enumerate(
            zip(
                ["공부", "게임", "식사", "이동", "휴식", "수면", "운동", "기타"],
                COLOR_VALUES + ["gray"],
                ICON_VALUES,
            )
        )
    ]
    slots = [
        {"hour": hour, "activityType": None, "note": None}
        for hour in range(24)
    ]
    slots[18] = {
        "hour": 18,
        "activityType": activities[4],
        "note": "카페에서 커피 마시며 독서",
    }

    def record_body() -> dict:
        recorded_slots = [slot for slot in slots if slot["activityType"]]
        activity_minutes: dict[str, int] = {}
        for slot in recorded_slots:
            name = slot["activityType"]["name"]
            activity_minutes[name] = activity_minutes.get(name, 0) + 60
        return {
            "date": QA_DATE,
            "slots": slots,
            "summary": {
                "recordedHours": len(recorded_slots),
                "recordRate": round(len(recorded_slots) / 24 * 100),
                "activityMinutes": activity_minutes,
            },
        }

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
        context.add_cookies(
            [{"name": "yeon.session", "value": "today-qa", "url": BASE_URL}]
        )
        page = context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        def handle_today_api(route) -> None:
            request = route.request
            path = request.url.split("/api/v1/today/", 1)[-1]
            if request.method == "GET" and path.startswith("records/"):
                body = record_body()
            elif request.method == "GET" and path.startswith("activity-types"):
                body = {"activityTypes": activities}
            elif request.method == "GET" and path.startswith("calendar"):
                body = {"month": "2026-07", "days": []}
            elif request.method == "POST" and path.startswith("activity-types"):
                payload = request.post_data_json
                created_requests.append(payload)
                created = activity_type(
                    99,
                    payload["name"],
                    payload["colorToken"],
                    payload["iconKey"],
                )
                activities.append(created)
                body = {"activityType": created}
            elif request.method == "PUT" and "/slots/" in path:
                payload = request.post_data_json
                hour = int(path.split("?", 1)[0].rsplit("/", 1)[-1])
                activity = next(
                    item for item in activities if item["id"] == payload["activityTypeId"]
                )
                slots[hour] = {
                    "hour": hour,
                    "activityType": activity,
                    "note": payload.get("note"),
                }
                slot_requests.append({"hour": hour, **payload})
                body = record_body()
            else:
                route.fulfill(status=204)
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(body, ensure_ascii=False),
            )

        page.route("**/api/v1/today/**", handle_today_api)
        page.goto(f"{BASE_URL}/today/record?date={QA_DATE}")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="하루 기록")).to_be_visible()
        page.get_by_role("button", name="활동 관리", exact=True).click()

        color_select = page.get_by_label("활동 색상")
        icon_select = page.get_by_label("활동 아이콘")
        color_texts = color_select.locator("option").all_text_contents()
        icon_texts = icon_select.locator("option").all_text_contents()
        color_values = color_select.locator("option").evaluate_all(
            "options => options.map(option => option.value)"
        )
        icon_values = icon_select.locator("option").evaluate_all(
            "options => options.map(option => option.value)"
        )

        assert color_values == COLOR_VALUES
        assert icon_values == ICON_VALUES
        if PHASE == "after":
            assert color_texts == COLOR_LABELS
            assert icon_texts == ICON_LABELS
            color_select.select_option("green")
            icon_select.select_option("book")
            expect(color_select.locator("option:checked")).to_have_text("초록")
            expect(icon_select.locator("option:checked")).to_have_text("책")
        else:
            assert color_texts == COLOR_VALUES
            assert icon_texts == ICON_VALUES

        manager = page.get_by_role("region", name="활동 항목 관리")
        manager.screenshot(
            path=str(EVIDENCE_DIR / f"{PHASE}-activity-manager-desktop.png")
        )
        page.get_by_role("button", name="활동 관리", exact=True).click()

        timeline = page.locator('section[aria-labelledby="record-timeline-title"]')
        timeline.screenshot(
            path=str(EVIDENCE_DIR / f"{PHASE}-timeline-note-desktop.png")
        )

        if PHASE == "after":
            page.get_by_role("button", name="활동 관리", exact=True).click()
            page.get_by_label("활동 색상").select_option("green")
            page.get_by_label("활동 아이콘").select_option("book")
            page.get_by_label("새 활동 이름").fill("한국어 옵션 QA")
            page.get_by_role("button", name="추가", exact=True).click()
            expect(
                page.get_by_role("option", name="한국어 옵션 QA", exact=True)
            ).to_be_visible()
            assert created_requests == [
                {
                    "name": "한국어 옵션 QA",
                    "colorToken": "green",
                    "iconKey": "book",
                }
            ]
            page.get_by_role("button", name="활동 관리", exact=True).click()

            note_button = page.get_by_role("button", name="18시 설명 수정")
            expect(note_button).to_be_visible()
            expect(note_button).to_contain_text("카페에서 커피 마시며 독서")
            note_button.click()
            note_editor = page.get_by_role("form", name="18시 설명 편집")
            expect(note_editor).to_be_visible()
            updated_note = "산책 후 카페에서 커피 마시며 독서"
            note_editor.get_by_role("textbox").fill(updated_note)
            timeline.screenshot(
                path=str(EVIDENCE_DIR / "after-timeline-note-editor-desktop.png")
            )
            note_editor.get_by_role("button", name="설명 저장").click()
            expect(page.get_by_title(updated_note)).to_be_visible()
            assert slot_requests == [
                {
                    "hour": 18,
                    "activityTypeId": activities[4]["id"],
                    "note": updated_note,
                }
            ]
            timeline.screenshot(
                path=str(EVIDENCE_DIR / "after-timeline-note-saved-desktop.png")
            )

            page.get_by_role("option", name="기타", exact=True).click()
            page.get_by_role(
                "button",
                name=f"18시, 휴식, 설명 {updated_note}. 선택한 활동으로 기록",
                exact=True,
            ).click()
            expect(
                page.get_by_role(
                    "button",
                    name=f"18시, 기타, 설명 {updated_note}. 선택한 활동으로 기록",
                    exact=True,
                )
            ).to_be_visible()
            assert slot_requests[-1] == {
                "hour": 18,
                "activityTypeId": activities[7]["id"],
                "note": updated_note,
            }

            page.set_viewport_size({"width": 390, "height": 844})
            timeline.screenshot(
                path=str(EVIDENCE_DIR / "after-timeline-note-mobile.png")
            )
            timeline_overflow = timeline.evaluate(
                "element => element.scrollWidth - element.clientWidth"
            )
            assert timeline_overflow <= 1, (
                f"모바일 타임라인 가로 overflow: {timeline_overflow}px"
            )

        assert not page_errors, f"브라우저 런타임 오류: {page_errors}"
        browser.close()

    print(
        json.dumps(
            {
                "phase": PHASE,
                "colorValues": color_values,
                "colorLabels": color_texts,
                "iconValues": icon_values,
                "iconLabels": icon_texts,
                "createdRequests": created_requests,
                "slotRequests": slot_requests,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print("TODAY_ACTIVITY_LABELS_AND_NOTES_QA_OK")


if __name__ == "__main__":
    run()
