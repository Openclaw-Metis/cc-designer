# Troubleshooting

按症狀查。未收錄的問題請回寫本檔。

## 打開 HTML 空白 / console 一片紅

- Cause：React / Babel script tag 沒用 pinned + integrity，或誤加 `type="module"`
- Fix：改回 SKILL.md Critical rule 1 的精確 snippet（React 18.3.1 + Babel 7.29.0 + integrity hash）

## 切 Tweaks 沒反應

- Cause：`__edit_mode_available` 在 listener 註冊前就送出
- Fix：見 `tweaks.md`——必須**先**註冊 listener，**再** `postMessage`

## Deck 翻到第 5 頁但 speaker notes 還停在第 1 頁

- Cause：沒 call `window.postMessage({slideIndexChanged: N})`
- Fix：用 `deck_stage.js`（web component `<deck-stage>`），它會自動處理——你不用自己發 message

## Deck 翻頁沒反應 / 沒顯示 overlay

- Cause：`<deck-stage>` 下的 `<section>` 不是直系子元素（被 `<div>` 包住）
- Fix：slides 必須是 `<deck-stage>` 的直系 children；移除中間 wrapper

## 列印 PDF 每張 slide 破圖

- Cause：自訂樣式覆蓋了 `deck_stage.js` 的 `@media print` rules
- Fix：讓你的 section 樣式不設 `transform`、不綁 viewport-relative 單位；列印時 stage 會自動還原至 1920×1080 authored size

## 同專案兩個 component 都叫 `styles`，其中一個失效

- Cause：Critical rule 2 違反——多個 `<script type="text/babel">` 共用 global scope，同名變數互蓋
- Fix：改 `const <componentName>Styles = { ... }`

## PPTX 匯出後 blur / mix-blend-mode 消失

- Cause：`editable` mode 把 DOM 轉成原生 PowerPoint shapes，過度 CSS-only 效果不會 export
- Fix：需要匯出時避開 blur、mix-blend-mode、backdrop-filter；或改用 `screenshots` mode（一張圖一頁）

## 新 iOS / macOS 元件 backdrop-filter 在 Firefox 沒效果

- Cause：Firefox 對 `backdrop-filter` 支援較晚；Liquid Glass 依賴此
- Fix：交付時提醒使用者用 Chromium-based 瀏覽器預覽；或在 Tweaks 加 `disable-glass` 切換到純色 fallback

## DesignCanvas 拖不動 / 縮放失效

- Cause：外層容器 `overflow: hidden` 不夠、或 wheel 事件被父層攔
- Fix：確認 `DesignCanvas` 的父容器 `overflow: hidden` 且 `position: relative`；wheel listener 是 `passive: false` 才能 `preventDefault`
