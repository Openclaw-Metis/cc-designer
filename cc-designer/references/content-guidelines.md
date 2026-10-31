# Content、視覺、排版準則

## 一則：少即是多

- **不塞填充內容**——永遠不要為了填空間加 dummy section、placeholder 敘事、資訊性文字。每個元素都要賺到存在。
- 若一個區塊感覺空，那是設計問題——用**排版與組合**解決，不是加內容。
- **加內容前先問**：若你覺得某 section / page / copy 會讓設計更好，先問使用者；他比你更懂受眾與目標。
- One thousand no's for every yes. 拒絕雜訊。

## AI slop 需要避開

- **狂用 gradient 背景**——整頁 purple-to-blue gradient 是 slop。gradient 只在局部（logo 光暈、CTA hover）用。
- **無脈絡的 emoji**——除非品牌 / 設計系統本身用 emoji，否則不放；先用 placeholder（純色塊 + 文字標示）。
- **圓角容器 + 左邊色條 accent**——Notion-like card pattern 被濫用到變 slop。
- **用 SVG 自己畫插圖**——Claude 畫的 custom SVG illustration 99% 是 slop。用 placeholder 或 asset。
- **過度使用的字型**——Inter、Roboto、Arial、system-ui 是 AI slop 警訊。用有個性、且 Google Fonts 載得到的替代：Space Grotesk、Manrope、Geist、Instrument Serif、Fraunces、Commissioner、JetBrains Mono、IBM Plex Sans。Söhne 等商業字型沒有公開 CDN，只有使用者提供授權字型檔時才用。
- **Data slop**——亂塞數字、icon、stats 充氣場：`87% 使用者很滿意` `10x 速度` 沒意義且沒出處，刪掉。
- 無理由的 grid 線、無理由的小 hover state、無理由的動畫——每個視覺元素要有 intent。

## 文字尺寸

- **1920×1080 slide**：最小 24px，多數更大（heading 72-160px）
- **列印**：最小 12pt（16-20pt 比較舒服）
- **Mobile UI**：hit target 最小 44×44px
- **body text on landing**：16-18px、line-height 1.4-1.6、`text-wrap: pretty`
- **line length**：40-75 字元為宜；寬容器用 `max-width: 40ch` 或 `60ch`

## 色彩

- 優先用品牌色；沒品牌就用**既有設計系統**的色票
- 真的受限需要延伸：用 `oklch()` 在相近色相延伸——不憑空創造全新顏色
  ```css
  --brand-600: oklch(0.55 0.15 270);   /* 品牌主紫 */
  --brand-400: oklch(0.68 0.15 270);   /* 淺一階 */
  --brand-200: oklch(0.88 0.06 270);   /* 背景用 */
  ```
- 全 deck / page 用 1-2 個主背景色，不多
- Dark mode：用 `#0b0b0f` 類深色，不要純黑 `#000`
- Light mode：用 `#f8f8f5` / `#fafaf5` 類溫暖白，不要純白 `#ffffff`

## 字型搭配

每個設計用 **1-2 種字型**，最多：
- Display + body（常見）
- Single 字型多 weight / italic（現代感）
- Mono + serif（editorial）
- 不要 3+ 字型同 page

繁中內容：上述 Latin 字型沒有中文字形，字型堆疊要接 Noto Serif TC 或 Noto Sans TC（皆可由 Google Fonts 載入），例如 `font-family: "Fraunces", "Noto Serif TC", serif`。否則中文會退回各作業系統的預設字，同一份設計在不同機器長得不一樣。

## Rhythm / 節奏

- **Spacing scale**：用 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96px 這種指數階梯
- **章節區隔**：hero slide → content → transition slide → content → CTA，視覺節奏要有呼吸
- **變化**：不要每 slide 都一樣版面；交替 full-bleed image / 純文字 / split layout

## CSS 是你的朋友

別低估 CSS 能做的：
- `text-wrap: pretty` / `balance`
- `oklch()` 色空間
- CSS Grid（`grid-template-areas`、`subgrid`）
- Container queries（`@container`）
- `mix-blend-mode`、`backdrop-filter`
- `clip-path`、`mask-image`
- `@property` 自訂動畫屬性
- `accent-color`、`color-scheme`
- 使用者常常不知道可以做什麼——用 CSS **驚豔他**

## SVG 用於

**可以**：icon（從 Lucide / Heroicons / Phosphor 複製，不要自己畫）、簡單 chart、logo mark
**不要**：custom illustration、scene art、人物、產品樣貌

沒 icon 可用：純文字 label、純色方塊、Unicode character（`↗` `◆` `•`）都比自畫 slop 好。

## Copy 語氣

- 跟隨既有品牌語氣
- 沒有品牌：punchy、具體、**有態度**——不要 marketing speak
- 禁用字：`seamless`、`unleash`、`empower`、`revolutionize`、`game-changing`、`next-generation`
- 句子短。動詞強。
- CTA：以使用者角度，`Start free` / `Try it now` / `Book a demo`；不用 `Get started for free today` 冗長版

## Imagery

- 有品牌素材 → 用
- 有 UI kit 的產品截圖 → 用
- 都沒有 → **placeholder**：純色方塊 + `[Hero image — H2 product screenshot]`，請使用者提供
- 不用 stock photo 替代——太容易變 slop

## 無障礙最低線

- 對比 4.5:1（文字）、3:1（UI chrome）
- 不只靠顏色傳達狀態（error 要有 icon 或 text）
- 文字可 2x 放大不破版
- `alt` 屬性給所有 meaningful image

## Checklist（交付前快速掃）

- [ ] 無 Lorem ipsum
- [ ] 無亂塞的 stats / 圖示
- [ ] 至少一個有意義的視覺決策（為什麼選這顏色 / 字型 / 版面）
- [ ] 文字尺寸符合目標媒介
- [ ] 不是過度使用的字型
- [ ] Gradient 背景僅局部用
- [ ] 所有 emoji 都刻意（或沒有）
- [ ] 所有 SVG 都是 icon 或 logo（不是 illustration）
- [ ] 1-2 背景色，不多
