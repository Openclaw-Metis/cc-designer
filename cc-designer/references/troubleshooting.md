# Troubleshooting

按症狀查。未收錄的問題請回寫本檔。

## 打開 HTML 空白 / console 一片紅

- Cause：最常見是 JSX 用 `src` 載入後直接雙擊開啟，瀏覽器在 `file://` 擋下請求；其次是 React / Babel script tag 沒用 pinned + integrity，或誤加 `type="module"`
- Fix：用 `inline_jsx.mjs` 重建交付檔；script tag 改回 SKILL.md Step 5 的精確 snippet（React 18.3.1 + Babel 7.29.0 + integrity hash）

## 找不到 Tweaks 入口 / 切 Tweaks 沒反應

- Cause：雙擊開啟時沒有 host 會送 activate 訊息，或 `__edit_mode_available` 在 listener 註冊前就送出
- Fix：見 `tweaks.md` 的完整範例——獨立開啟時由頁面提供入口，且**先**註冊 listener，**再** `postMessage`

## Deck 翻到第 5 頁但 speaker notes 還停在第 1 頁

- Cause：`deck_stage.js` 只廣播翻頁，不顯示 notes；頁面的 notes 面板沒有監聽 `slidechange`，或 listener 在 `<deck-stage>` 之後才註冊，錯過第一次事件
- Fix：用 `decks.md` 的 notes 面板，把 script 放在 `<head>`

## Deck 翻頁沒反應 / 沒顯示 overlay

- Cause：`<deck-stage>` 下的 `<section>` 不是直系子元素（被 `<div>` 包住）
- Fix：slides 必須是 `<deck-stage>` 的直系 children；移除中間 wrapper

## 列印 PDF 每張 slide 破圖

- Cause：自訂樣式覆蓋了 `deck_stage.js` 的 `@media print` rules
- Fix：讓你的 section 樣式不設 `transform`、不綁 viewport-relative 單位；列印時 stage 會自動還原至 1920×1080 authored size

## 同專案兩個 component 都叫 `styles`，其中一個樣式錯亂

- Cause：Critical rule 2 違反——多個 `<script type="text/babel">` 共用全域，同名變數由後載入的值靜默蓋掉，console 不會報錯
- Fix：改 `const <componentName>Styles = { ... }`

## 字型看起來是系統字

- Cause：CSS 寫了沒有載入來源的字型（例如 Söhne），瀏覽器默默退回系統字
- Fix：改用 Google Fonts / Fontshare 有提供的字型並加 `<link>`，或請使用者提供授權字型檔

## `npx @google/design.md` 卡住不動

- Cause：這個 bin 名以 `.md` 結尾，透過 npx 在 Windows 會卡住
- Fix：改用 `npx --no-install --package @google/design.md designmd <command>`；需要 0.4.0 以上

## 新 iOS / macOS 元件 backdrop-filter 在 Firefox 沒效果

- Cause：Firefox 對 `backdrop-filter` 支援較晚；Liquid Glass 依賴此
- Fix：交付時提醒使用者用 Chromium-based 瀏覽器預覽；或在 Tweaks 加 `disable-glass` 切換到純色 fallback

## DesignCanvas 拖不動

- Cause：左鍵只有從底色區塊開始拖才會 pan，按在 artboard 上不會動
- Fix：從 artboard 外的底色拖，或按住中鍵在任何位置拖

## 裝置 frame 的內容被狀態列蓋住，或設定的 props 沒作用

- Cause：`IOSDevice` 的標題 prop 是 `title`，沒傳時沒有 nav bar，內容從機身頂端開始；未列在 `starter-components.md` 的 props 會被靜默忽略
- Fix：傳 `title`，或自己留上方留白；props 以 starter 檔的函式參數為準
