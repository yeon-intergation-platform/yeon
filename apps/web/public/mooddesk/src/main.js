/* ============================================================
   MoodDesk — UI 인터랙션
   배경 영상은 분위기, 여기서는 클릭 가능한 HTML UI를 살린다.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 디버그: #debug 로 핫스팟 시각화 ---------- */
  if (location.hash === "#debug") {
    const s = document.createElement("style");
    s.textContent =
      ".hot{background:rgba(255,0,80,.35)!important;outline:1px solid red;}";
    document.head.appendChild(s);
  }

  /* ---------- 토스트 ---------- */
  const toastEl = document.querySelector(".toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }

  /* ---------- 배경 영상 자동재생 보장 ---------- */
  const video = document.querySelector(".bg-video");
  if (video) {
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    // 일부 브라우저: 첫 사용자 제스처에서 재생
    window.addEventListener("pointerdown", tryPlay, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlay();
    });
  }

  /* ---------- 감정 스티커 ---------- */
  const moodResponses = {
    불안: "괜찮아요. 불안도 잠시 머물다 지나가요.",
    지침: "오늘은 천천히 쉬어가도 좋아요.",
    평온: "지금의 평온함, 오래 머물길 바라요.",
    외로움: "여기 당신 곁에 이 자리가 있어요.",
    기쁨: "그 마음, 오래 기억해두면 좋겠어요.",
    복잡함: "복잡한 마음도 적어보면 한결 가벼워져요.",
  };
  document.querySelectorAll(".sticker").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sticker")
        .forEach((b) => b.classList.remove("is-sel"));
      btn.classList.add("is-sel");
      const mood = btn.dataset.mood;
      toast(moodResponses[mood] || `‘${mood}’ 마음을 담았어요.`);
      tintByMood(mood);
    });
  });

  /* 감정에 따라 배경 톤을 아주 미세하게 ---------- */
  const tintEl = document.querySelector(".bg-tint");
  const moodTint = {
    불안: "rgba(190,150,150,.10)",
    지침: "rgba(210,190,150,.10)",
    평온: "rgba(150,180,140,.10)",
    외로움: "rgba(170,160,200,.12)",
    기쁨: "rgba(240,190,130,.12)",
    복잡함: "rgba(200,170,140,.10)",
  };
  function tintByMood(mood) {
    if (!tintEl) return;
    const c = moodTint[mood] || "transparent";
    tintEl.style.transition = "background 1.2s ease";
    tintEl.style.background = `radial-gradient(120% 80% at 50% 35%, ${c}, transparent 65%),
       linear-gradient(180deg, rgba(60,48,34,.06) 0%, transparent 22%, transparent 78%, rgba(60,48,34,.10) 100%)`;
  }

  /* ---------- 마음의 색 ---------- */
  const colorNames = {
    sage: "세이지 — 차분하고 단단한 하루",
    lavender: "라벤더 — 부드럽게 가라앉는 마음",
    apricot: "살구 — 따뜻하게 번지는 기운",
    sand: "모래 — 잔잔하고 편안한 결",
    linen: "리넨 — 가볍고 정돈된 마음",
  };
  document.querySelectorAll(".swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".swatch")
        .forEach((b) => b.classList.remove("is-sel"));
      btn.classList.add("is-sel");
      toast(
        `오늘의 색 · ${colorNames[btn.dataset.color] || btn.dataset.color}`
      );
    });
  });

  /* ---------- 음악 플레이어 (재생/일시정지 토글) ---------- */
  const soundCard = document.querySelector(".card--sound");
  const playBtn = document.querySelector(".hot--play");
  let playing = false;
  function setPlaying(on) {
    playing = on;
    soundCard.classList.toggle("is-playing", on);
    playBtn.setAttribute("aria-pressed", String(on));
    if (on) toast("♪ Soft Morning · lofi piano");
  }
  if (playBtn) playBtn.addEventListener("click", () => setPlaying(!playing));

  /* ---------- 노트 모달 ---------- */
  const modal = document.querySelector("[data-modal]");
  const noteBtn = document.querySelector('[data-action="open-note"]');
  const noteCard = document.querySelector(".card--note");
  const dateEl = modal.querySelector(".modal__date");
  const textEl = modal.querySelector(".modal__text");
  const countEl = modal.querySelector(".modal__count");
  const saveBtn = modal.querySelector(".btn-save");

  function openModal() {
    const now = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    dateEl.textContent = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()} (${days[now.getDay()]})`;
    modal.hidden = false;
    setTimeout(() => textEl.focus(), 60);
  }
  function closeModal() {
    modal.hidden = true;
  }

  if (noteBtn) {
    noteBtn.addEventListener("pointerdown", () =>
      noteCard.classList.add("is-press")
    );
    ["pointerup", "pointerleave"].forEach((e) =>
      noteBtn.addEventListener(e, () => noteCard.classList.remove("is-press"))
    );
    noteBtn.addEventListener("click", openModal);
  }
  if (location.hash === "#note") openModal();
  modal
    .querySelectorAll("[data-close]")
    .forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  textEl.addEventListener("input", () => {
    countEl.textContent = `${textEl.value.length}자`;
  });
  saveBtn.addEventListener("click", () => {
    if (!textEl.value.trim()) {
      toast("한 글자라도 괜찮아요. 천천히요.");
      textEl.focus();
      return;
    }
    closeModal();
    toast("오늘의 마음을 살며시 담아두었어요.");
    textEl.value = "";
    countEl.textContent = "0자";
  });

  /* ---------- 카드 hover 시 미세 시차 부유감(부드러운 ambient) ---------- */
  // CSS reveal 후, 카드에 아주 느린 숨쉬기 애니메이션을 무작위 위상으로
  document.querySelectorAll(".card").forEach((card, i) => {
    card.style.setProperty("--float-delay", (i * 0.7).toFixed(2) + "s");
  });
})();
