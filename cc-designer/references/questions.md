# 提問 playbook

好的提問 = 好的設計。Junior designer 問 5 個精準問題勝過 senior 假設 5 件事。一輪最多 5 題，下面的模板是題庫，挑會改變方向的問，不要全問。

## 何時**一定要**問（用 AskUserQuestion 或明列問題）

- 使用者只給模糊需求（「設計一個 app」「做個簡報」）
- 使用者要 prototype 但沒給 UI kit / codebase / 截圖
- 要做 6+ slide 的 deck 但沒講主題方向
- 要做 landing / marketing page 但沒給品牌
- 任何「設計 app / 產品」類，而**沒提供**任何既有資產

## 何時**不用**問（直接做）

- 使用者給了 PRD + 受眾 + 長度
- 使用者給了截圖 / codebase 要 recreate
- 小調整 / 追問 / 加一個 tweak
- 使用者明說「先做一版再說」

## 問題模板

### 起點 / 產品脈絡（**幾乎每次都要問**）
- 「你有既有的 UI kit、design system、或 repo 可以參考嗎？」
- 「如果沒有，能提供品牌 logo / 色彩、或你最喜歡的類似產品的 screenshot 嗎？」
- 「完全沒有參考 / 品牌的話我可以從頭探索，但結果會比較泛——要這樣做嗎？」

### 變體數
- 「整體 flow 要幾個 variation？」
- 「哪個部分你最想探索？版面 / 顏色 / 動畫 / 文案？」

### 新意程度
- 「你想要 by-the-book（貼既有 pattern、保守）、novel（跳脫、不尋常），還是 mix？」
- 「有想要 surprise 的方向嗎？」

### 關注重點（權重分配）
- 「這個 project 你最在意：flow / 視覺 / 文案 / 動畫 的哪幾個？」

### Tweaks
- 「要我加 Tweaks 讓你即時切換嗎？要切哪幾個維度？」

### 技術 / 匯出
- 「deck 做好後要匯出 PPTX / PDF 嗎？」
- 「prototype 要能給 user test 嗎？還是只是 demo？」
- 「要放在某個裝置 frame 裡嗎（iOS / Android / 瀏覽器）？」

### Scope
- 「這次要包含哪些 screen / section？」
- 「有沒有哪些 screen 是下次再做就好？」

### 受眾 / 場合
- 「deck 要給誰看？什麼場合？時長？」
- 「prototype 要 demo 給誰？會需要真的點完全流程嗎？」

## 不要問的問題

- 「你想要什麼顏色？」——太寬。改問「有品牌主色嗎？或有喜歡的參考網站？」
- 「你想要什麼風格？」——太寬。改問「比較偏 minimal 像 Linear、或偏 expressive 像 Vercel？」
- 「要不要動畫？」——若任務本來就是 animation 就別問。
- 過度問：每項都徵詢反而失去設計師的判斷。2-3 個關鍵決策 + 品牌就夠，上限 5 題。

## Batch 一次問完

- 避免分 3 次各問 1 題——使用者會疲勞
- 一次 `AskUserQuestion`（若可用）或一則訊息問完；工具題數上限低於 5 時，把相近的問題合併
- 問題排序：**最關鍵的先**——起點 / 品牌 / 長度 > 變體 > 細節

## 當使用者說「你決定就好」

- 不要多問；給一個具體 plan（3 行）讓使用者回「yes / no / adjust」
- 例：「OK，我會做 8 slide pitch deck、淺色 Space Grotesk 字型 + 紫色 accent、1 張 hero + 6 張 content + 1 張 CTA。對嗎？」

## 示範（互動 prototype，一輪 5 題）

```
1. 有既有 UI kit、codebase 或品牌資料可參考嗎？都沒有的話，要我從零探索嗎？
2. Platform 是 iOS、Android、桌機、還是瀏覽器內？
3. 幾個 screen？要可點擊完整 flow，還是局部 screen 就好？
4. 想比較幾種方向？主要比哪個維度（版面 / 色彩 / 互動 / copy）？
5. 做好後會怎麼用（demo pitch、user test、internal review）？
```
