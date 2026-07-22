import glob
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("TODAY_DUAL_BASE_URL", "http://localhost:3001")
QA_DATE = "2026-07-22"
EVIDENCE_DIR = Path(
    "ai-log/hyeonjun/2026-07-22/yeon-today-dual-record-slots-screenshots"
)


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
    activities = [
        activity_type(1, "공부", "blue", "book"),
        activity_type(2, "휴식", "yellow", "coffee"),
        activity_type(3, "기타", "gray", "circle"),
    ]
    entries_by_hour: dict[int, list[dict]] = {
        18: [
            {
                "entryIndex": 0,
                "activityType": activities[1],
                "note": "산책",
            }
        ]
    }
    put_requests: list[dict] = []
    delete_requests: list[dict] = []

    def record_body() -> dict:
        activity_minutes: dict[str, int] = {}
        slots = []
        for hour in range(24):
            entries = entries_by_hour.get(hour, [])
            minutes_per_entry = 60 // len(entries) if entries else 0
            for entry in entries:
                name = entry["activityType"]["name"]
                activity_minutes[name] = (
                    activity_minutes.get(name, 0) + minutes_per_entry
                )
            first_entry = entries[0] if entries else None
            slots.append(
                {
                    "hour": hour,
                    "activityType": (
                        first_entry["activityType"] if first_entry else None
                    ),
                    "note": first_entry["note"] if first_entry else None,
                    "entries": entries,
                }
            )
        recorded_hours = len(entries_by_hour)
        return {
            "date": QA_DATE,
            "slots": slots,
            "summary": {
                "recordedHours": recorded_hours,
                "recordRate": round(recorded_hours / 24 * 100),
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
            [{"name": "yeon.session", "value": "today-dual-qa", "url": BASE_URL}]
        )
        page = context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        def handle_today_api(route) -> None:
            request = route.request
            parsed_url = urlparse(request.url)
            path = parsed_url.path.split("/api/v1/today/", 1)[-1]
            if request.method == "GET" and path.startswith("records/"):
                body = record_body()
            elif request.method == "GET" and path.startswith("activity-types"):
                body = {"activityTypes": activities}
            elif request.method == "GET" and path.startswith("calendar"):
                body = {"month": "2026-07", "days": []}
            elif request.method == "PUT" and "/slots/" in path:
                payload = request.post_data_json
                hour = int(path.rsplit("/", 1)[-1])
                activity = next(
                    item for item in activities if item["id"] == payload["activityTypeId"]
                )
                entries = entries_by_hour.setdefault(hour, [])
                if "entryIndex" in payload:
                    entry_index = payload["entryIndex"]
                    entries[entry_index] = {
                        "entryIndex": entry_index,
                        "activityType": activity,
                        "note": payload.get("note"),
                    }
                elif len(entries) < 2:
                    entries.append(
                        {
                            "entryIndex": len(entries),
                            "activityType": activity,
                            "note": payload.get("note"),
                        }
                    )
                else:
                    route.fulfill(
                        status=409,
                        content_type="application/json",
                        body=json.dumps(
                            {
                                "code": "TODAY_RECORD_SLOT_FULL",
                                "message": "한 시간에는 활동을 두 개까지 기록할 수 있습니다.",
                            },
                            ensure_ascii=False,
                        ),
                    )
                    return
                put_requests.append({"hour": hour, **payload})
                body = record_body()
            elif request.method == "DELETE" and "/slots/" in path:
                hour = int(path.rsplit("/", 1)[-1])
                entry_index = int(parse_qs(parsed_url.query)["entryIndex"][0])
                entries = entries_by_hour.get(hour, [])
                entries.pop(entry_index)
                for index, entry in enumerate(entries):
                    entry["entryIndex"] = index
                if not entries:
                    entries_by_hour.pop(hour, None)
                delete_requests.append(
                    {"hour": hour, "entryIndex": entry_index}
                )
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
        timeline = page.locator('section[aria-labelledby="record-timeline-title"]')

        page.get_by_role("option", name="휴식", exact=True).click()
        page.get_by_role(
            "button",
            name="18시, 휴식, 설명 산책. 선택한 활동을 두 번째 기록으로 추가",
            exact=True,
        ).click()

        first_split = page.get_by_role(
            "button",
            name="18시 첫 번째 기록, 휴식, 설명 산책. 편집",
            exact=True,
        )
        second_split = page.get_by_role(
            "button",
            name="18시 두 번째 기록, 휴식, 설명 없음. 편집",
            exact=True,
        )
        expect(first_split).to_be_visible()
        expect(second_split).to_be_visible()
        assert (
            page.locator(
                'button[aria-label^="18시,"][aria-label*="두 번째 기록으로 추가"]'
            ).count()
            == 0
        )
        assert put_requests[0] == {
            "hour": 18,
            "activityTypeId": activities[1]["id"],
        }
        assert first_split.evaluate("element => element.style.clipPath").startswith(
            "polygon(0px 0px"
        )
        assert second_split.evaluate("element => element.style.clipPath").startswith(
            "polygon(100% 0px"
        )
        timeline.screenshot(path=str(EVIDENCE_DIR / "dual-same-activity-desktop.png"))

        second_split.click()
        second_editor = page.get_by_role(
            "form", name="18시 두 번째 기록 설명 편집"
        )
        expect(second_editor).to_be_visible()
        second_editor.get_by_label("설명", exact=True).fill("커피 마시기")
        second_editor.get_by_role("button", name="설명 저장").click()
        expect(
            page.get_by_role(
                "button",
                name="18시 두 번째 기록, 휴식, 설명 커피 마시기. 편집",
                exact=True,
            )
        ).to_be_visible()
        assert put_requests[-1] == {
            "hour": 18,
            "activityTypeId": activities[1]["id"],
            "note": "커피 마시기",
            "entryIndex": 1,
        }

        first_split = page.get_by_role(
            "button",
            name="18시 첫 번째 기록, 휴식, 설명 산책. 편집",
            exact=True,
        )
        first_box = first_split.bounding_box()
        assert first_box is not None
        first_split.click(
            position={"x": first_box["width"] * 0.72, "y": first_box["height"] * 0.12}
        )
        first_editor = page.get_by_role(
            "form", name="18시 첫 번째 기록 설명 편집"
        )
        first_editor.get_by_label("활동", exact=True).select_option(
            activities[2]["id"]
        )
        first_editor.get_by_label("설명", exact=True).fill("동네 장보기")
        timeline.screenshot(
            path=str(EVIDENCE_DIR / "dual-entry-editor-desktop.png")
        )
        first_editor.get_by_role("button", name="설명 저장").click()
        expect(
            page.get_by_role(
                "button",
                name="18시 첫 번째 기록, 기타, 설명 동네 장보기. 편집",
                exact=True,
            )
        ).to_be_visible()
        assert put_requests[-1] == {
            "hour": 18,
            "activityTypeId": activities[2]["id"],
            "note": "동네 장보기",
            "entryIndex": 0,
        }
        timeline.screenshot(
            path=str(EVIDENCE_DIR / "dual-different-activity-desktop.png")
        )

        first_split = page.get_by_role(
            "button",
            name="18시 첫 번째 기록, 기타, 설명 동네 장보기. 편집",
            exact=True,
        )
        first_box = first_split.bounding_box()
        assert first_box is not None
        first_split.click(
            position={"x": first_box["width"] * 0.72, "y": first_box["height"] * 0.12}
        )
        page.get_by_role("form", name="18시 첫 번째 기록 설명 편집").get_by_role(
            "button", name="기록 삭제"
        ).click()
        expect(
            page.get_by_role(
                "button",
                name="18시, 휴식, 설명 커피 마시기. 선택한 활동을 두 번째 기록으로 추가",
                exact=True,
            )
        ).to_be_visible()
        assert delete_requests == [{"hour": 18, "entryIndex": 0}]

        page.get_by_role(
            "button",
            name="18시, 휴식, 설명 커피 마시기. 선택한 활동을 두 번째 기록으로 추가",
            exact=True,
        ).click()
        expect(
            page.get_by_role(
                "button",
                name="18시 두 번째 기록, 휴식, 설명 없음. 편집",
                exact=True,
            )
        ).to_be_visible()
        page.set_viewport_size({"width": 390, "height": 844})
        timeline.screenshot(path=str(EVIDENCE_DIR / "dual-record-mobile.png"))
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
                "putRequests": put_requests,
                "deleteRequests": delete_requests,
                "timelineOverflow": timeline_overflow,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print("TODAY_DUAL_RECORD_SLOTS_QA_OK")


if __name__ == "__main__":
    run()
