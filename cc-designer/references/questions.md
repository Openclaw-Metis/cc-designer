# 提問 playbook

好的提問 = 好的設計。Junior designer 問 5 個精準問題勝過 senior 假設 5 件事。

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
- 過度問：每項都徵詢反而失去設計師的判斷。2-3 個關鍵決策 + 品牌就夠。

## Batch 一次問完

- 避免分 3 次各問 1 題——使用者會疲勞
- 一次 questions_v2（若可用）或一次 message 把 5-10 題丟出去
- 問題排序：**最關鍵的先**——起點 / 品牌 / 長度 > 變體 > 細節

## 當使用者說「你決定就好」

- 不要多問；給一個具體 plan（3 行）讓他「yes / no / adjust」
- 例：「OK，我會做 8 slide pitch deck、淺色 Söhne 字型 + 紫色 accent、1 張 hero + 6 張 content + 1 張 CTA。對嗎？」

## 示範（互動 prototype 要問 ≥ 10 題）

```
1. 有既有 UI kit 或 codebase 可參考嗎？沒的話請提供截圖或品牌資料。
2. Platform 是 iOS、Android、桌機、還是瀏覽器內？
3. 幾個 screen？每個 screen 主要目的是什麼？
4. 要真的可點擊完整 flow、還是局部 screen 就好？
5. 希望幾種 variation？主要比較哪個維度（版面 / 色彩 / 互動 / copy）？
6. 對創新度的期待：保守貼 pattern、中間、還是大膽不尋常？
7. 動畫重要嗎？要做 motion demo 還是靜態 mock？
8. 有沒有品牌色、字型、logo？
9. 有沒有想要我避開的視覺風格？
10. 要加哪些 Tweaks 供切換？
11. 做好後會怎麼用（demo pitch、user test、internal review、匯出給他人）？
```
