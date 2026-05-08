# CSS 3D 카드 뒤집기 — preserve-3d와 overflow 충돌 분석

날짜: 2026-05-04

---

## 발단: 버그 상황

카드서비스(`play-card.tsx`)의 카드 뒤집기 애니메이션이 Linux(본인 노트북)에서는 안 보이고, Windows에서는 정상 동작하는 현상.

---

## 원인 코드

```tsx
// play-card.tsx (수정 전)
<div
  className="absolute inset-0 flex flex-col overflow-hidden ..."  // ← 범인
  style={{ backfaceVisibility: "hidden" }}
>
```

카드 앞면/뒷면 div에 Tailwind `overflow-hidden`이 있었음.

---

## 질문 흐름과 이해 과정

### 1단계: 처음 설명 (쉬운 버전)

> 질문: "뭔말이야 쉬운말로 번역해줘"

- `overflow-hidden`이 3D 공간을 꺼버리는 부작용이 있다
- Windows Chrome은 이 규칙을 눈감아줬고, Linux Chrome은 규칙대로 처리해서 애니메이션이 안 보인 것

### 2단계: 깊이 있는 설명 요청

> 질문: "깊이없는 설명이야 깊이있는 설명해줘"

### 3단계: 헷갈렸던 지점 발견

> 질문: "기본설명과 GPU레이어합성 설명이 상충된다고 느끼는 이유는 내가 뭘 잘못이해하고 있어서 그런거지?"

**헷갈린 이유:** 두 설명이 각각 다른 시나리오를 설명하는데, 같은 상황의 모순처럼 읽혔음.

- "CPU가 다 그려서 GPU에 한 장 전달" (레이어 없을 때)
- "요소를 별도 텍스처로 GPU에 올린다" (레이어 있을 때)

→ 이 둘은 모순이 아니라 **서로 다른 렌더링 경로**

---

## 브라우저 렌더링 전체 구조

### 기본 경로 (레이어 없을 때)

```
CPU: A 그리고 → B 그리고 → C 그리고 → 완성된 이미지 한 장 → GPU → 화면 출력
```

CPU가 최종 결과물을 만들고, GPU는 화면에 표시만 함. 애니메이션이 있으면 매 프레임마다 CPU가 전체를 다시 그려야 해서 느림.

### GPU 합성 경로 (레이어 있을 때)

```
CPU: A만 따로 그림 → GPU(텍스처 A)
CPU: B만 따로 그림 → GPU(텍스처 B)
                       GPU가 A, B를 실시간으로 조합 → 화면
```

CSS `transform`, `opacity` 등이 있으면 브라우저가 해당 요소를 **별도 텍스처**로 GPU에 올림.

**텍스처란?** CPU가 그린 픽셀 덩어리를 GPU가 다룰 수 있는 형식으로 변환한 것. 게임의 스프라이트 이미지 파일 하나와 같음.

```
텍스처 A (카드 앞면)
┌──────────────┐
│  질문        │  ← CPU가 이 영역 픽셀을 한 번 그려서
│  내용...     │    GPU 메모리에 올려둠
└──────────────┘
  위치/각도: 아직 미정 → GPU가 나중에 행렬 연산으로 결정
```

**애니메이션 = 픽셀 재그리기가 아니라 행렬 수치만 바꾸는 것** → 그래서 GPU 애니메이션이 빠름.

---

## `transform-style: preserve-3d`가 하는 일

```css
transform-style: preserve-3d;
```

GPU에게 지시: "내 자식 레이어들은 각자 Z축 위치(깊이)를 가진 채로 합성해라."

**없을 때 (flat, 기본값):**
```
부모가 회전할 때:
  자식들 → 부모 안에서 2D로 미리 합쳐짐 → 부모째로 회전
  = 납작한 판이 도는 것처럼 보임
```

**있을 때 (preserve-3d):**
```
부모가 회전할 때:
  카드 앞면 레이어: Z=0, 자기 법선 벡터 실시간 계산
  카드 뒷면 레이어: Z=0, rotateY(180deg) → 반대 법선
  GPU: 카메라 반대편 법선이면 backface-visibility: hidden → culling(제거)
  = 앞면 보일 때 뒷면은 GPU가 아예 그리지 않음
```

---

## `overflow: hidden`이 이걸 끊는 이유

`overflow: hidden`이 있는 div는 **stacking context(쌓임 맥락)** 를 생성함.

Stacking context = "나는 내 자식들을 내 경계 안에서만 관리하겠다"는 격리 구역.

**문제:** 격리 구역은 평면. 경계 바깥을 잘라내려면 자식을 먼저 자기 평면에 합쳐야 함. 3D 공간에 흩어진 채로는 경계 계산 불가.

→ 브라우저가 강제로 자식들을 **평면 텍스처 하나로 flatten(평탄화)**
→ Z축 정보 소멸
→ `preserve-3d` 컨텍스트 끊김
→ `backface-visibility: hidden` 무력화

```
[preserve-3d 컨테이너] ← 3D 공간 생성
  └─ [카드 앞면 div: overflow-hidden] ← "나는 평면이야" 선언
       └─ 내용물들 ← 다시 평면으로 렌더링됨
```

---

## Windows vs Linux 차이

### Windows Chrome
- 렌더링 백엔드: **DirectComposition (D3D12)**
- `overflow: hidden` + `preserve-3d` 조합을 **무시하고 3D 처리**
- 스펙 위반이지만 웹 호환성을 위해 의도적으로 벗어남

### Linux Chrome (본인 노트북)
- 렌더링 백엔드: **Mesa + ANGLE (OpenGL → ES 번역 레이어)**
- GPU에 레이어 올리기 전 **스펙 기준으로 flatten 여부 먼저 판단**
- `overflow: hidden` 감지 → 3D 합성 레이어 아예 생성 안 함

```
Windows: Blink → [overflow 무시] → DirectComposition → GPU(D3D) → 3D OK
Linux:   Blink → [overflow 감지] → flatten → ANGLE → Mesa OpenGL → 평면만 나옴
```

본인 노트북 GPU 구성:
- GPU0: NVIDIA RTX 3070 Ti (비활성 — Optimus)
- GPU1: Intel Iris Xe (활성 — ANGLE OpenGL 백엔드)

---

## 수정 내용

```tsx
// 수정 전: 카드 면 div에 overflow-hidden
<div className="absolute inset-0 flex flex-col overflow-hidden ...">

// 수정 후: overflow-hidden 제거, 스크롤은 내부 콘텐츠 div에만 유지
<div className="absolute inset-0 flex flex-col ...">
  <div className="flex flex-1 overflow-y-auto ...">  {/* 스크롤은 여기 */}
```

**왜 `overflow-y-auto`는 괜찮나?**
내부 콘텐츠 div는 `preserve-3d` 컨테이너의 직접 자식이 아니라 손자(grandchild). 손자 레벨의 stacking context는 3D 컨텍스트 평탄화에 영향을 주지 않음.

---

## 핵심 정리

| 개념 | 설명 |
|------|------|
| 텍스처 | CPU가 그린 픽셀 덩어리를 GPU가 쓸 수 있는 형식으로 변환한 것 |
| GPU 레이어 합성 | 텍스처들을 행렬 연산으로 조합해 최종 화면을 만드는 것 |
| `preserve-3d` | 자식 레이어들의 Z축 정보를 유지한 채 GPU가 합성하도록 지시 |
| `overflow: hidden` | stacking context 생성 → 자식을 평면으로 flatten → Z축 소멸 |
| `backface-visibility: hidden` | 법선 벡터가 카메라 반대를 향할 때 GPU가 해당 레이어를 culling |
