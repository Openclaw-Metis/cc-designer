# Slide deck 子流程

把 deck 看成一部短電影而不是文字列表。目標是**每一張 slide 都有一個明確的 idea**，用最小文字把它放大。

## 一次性規則

- **永遠用 `deck_stage.js` 做骨架**（在 `assets/starters/deck_stage.js`）——它幫你處理：
  - 1920×1080 authored canvas + `transform: scale()` 自動縮放至任何 viewport
  - 鍵盤（←→、space、PgUp/PgDn、Home/End）與點擊/tap zone 翻頁
  - 按 `R` 重置回 slide 0（有小 keyboard hint）
  - 右下 slide 計數 overlay（hide on print）
  - `localStorage` 持久化目前 slide index（reload 後會回到原頁）
  - 列印成 PDF（每張 slide 一頁，自動還原到 authored size）
  - `slidechange` CustomEvent + `window.postMessage({slideIndexChanged: N})`（speaker notes 同步自動處理）
  - 觸控裝置自動啟用三段 tap zone（左/中/右）
- 若要 1:1 authored size（例如 PPTX 匯出工具需要），在 `<deck-stage noscale>` 加 `noscale` attribute
- **不要手刻 scaling**
- 每張 slide 就是 `<deck-stage>` 的**直系** `<section>` 子元素（中間不能包 `<div>`）
- 不要在 deck 頁面頂端放「title」類 chrome——slide 本體就是 title

## 標準骨架

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Product Pitch</title>
<script src="deck_stage.js"></script>
<style>
  :root {
    --bg: #0b0b0f;
    --fg: #f0f0f5;
    --accent: #8b6cff;
  }
  body { margin: 0; background: #000; color: var(--fg); font-family: "Söhne", system-ui, sans-serif; }
  section { display: grid; place-content: center; padding: 120px; }
  h1 { font-size: 120px; line-height: 0.95; margin: 0; text-wrap: balance; }
  h2 { font-size: 72px; }
  p  { font-size: 36px; line-height: 1.35; max-width: 1400px; text-wrap: pretty; }
</style>
</head>
<body>
  <deck-stage>
    <section data-screen-label="01 Title">
      <h1>Pitch deck — product name</h1>
      <p>One-line value prop</p>
    </section>
    <section data-screen-label="02 Problem">
      <h2>The problem</h2>
      <p>Why this matters right now.</p>
    </section>
    <!-- 6-8 slides -->
  </deck-stage>
</body>
</html>
```

## 系統決策先講出來

寫 code 前講清楚：
- **主背景色**：最多 1-2 種（例如：白 + 一種深色章節開頭）
- **heading 尺寸系統**：H1 120px、H2 72px、body 36px（以 1920×1080 為基準）
- **章節 rhythm**：hero slide / support slide / detail slide / CTA slide 各長什麼樣？
- **imagery 策略**：哪些 slide full-bleed image？哪些純文字？哪些 split 50/50？
- **如果是文字重的 deck**：承諾至少引入 1-2 個圖像 slide 或用 placeholder

## Slide label 規則

1-indexed，match slide counter：
- `data-screen-label="01 Title"`、`"02 Agenda"`、...
- 使用者講「slide 5」= label `"05"`（不是陣列 index 4）
- 若沒手動加，`deck_stage.js` 會自動補——建議還是手動加，讓 source 自述

## 聽 slide change 事件

需要同步外部 UI（speaker view、analytics）時：

```js
document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
  console.log('now at slide', e.detail.index)
})
```

或在 parent window 聽：

```js
window.addEventListener('message', (e) => {
  if (typeof e.data?.slideIndexChanged === 'number') { /* ... */ }
})
```

## Speaker notes（僅在被要求時才做）

```html
<head>
  ...
  <script type="application/json" id="speaker-notes">
  [
    "Slide 0 notes — greet, set expectations",
    "Slide 1 notes — talk through the problem",
    "Slide 2 notes — ..."
  ]
  </script>
</head>
```

- JSON 陣列的 index 對應 slide index（0-indexed，與 slide label 的 1-index 差 1）
- `deck_stage.js` 會自動 render speaker notes overlay；你只需要放 `<script>` tag
- 內容寫完整講稿、口語、會在台上講的話——不是條列
- 有 speaker notes 的 slide，主畫面上就可以放少字 + 強視覺

## 字型

- 若已有系統：用系統字型（Geist Mono、Söhne、IBM Plex、Space Grotesk 等）
- 若沒有：**不要**用 Inter / Roboto / Arial / system-ui 作為主字——這些是 AI slop 常見字
- 候選：JetBrains Mono、Space Grotesk、Manrope、Fraktur display、Crimson Pro、Instrument Serif、Commissioner
- Web fonts：用 `<link>` 載入 Google Fonts 或 fontshare；別把字型檔複製進 deck folder

## 背景 / 色

- 全 deck 背景色最多 1-2 種；章節開頭可換背景區隔
- accent 色用品牌色；不要用一堆 gradient 背景填白
- 深 deck（dark mode）：用 `#0b0b0f` 類深色而不是純黑 `#000000`
- 淺 deck：用 `#f8f8f5` 類溫暖白而不是純白

## 匯出 PPTX

若使用者要匯出：
- `deck_stage.js` 已內建 `noscale` 相容——匯出工具會加 attribute，deck 會自動還原到 1920×1080
- 匯出指令請使用者在 Claude.ai Artifacts 環境執行；Claude Code 本地環境不支援 gen_pptx
- 匯出用 `editable` mode 會轉成原生 PowerPoint text/shape/image；`screenshots` mode 則是一張圖一頁
- 若要 editable，避免用過於 CSS-only 的效果（blur、mix-blend-mode、backdrop-filter）——這些不會 export
