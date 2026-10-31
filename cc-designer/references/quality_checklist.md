# Quality checklist

這份 checklist 只補充機械工具無法判斷的視覺、內容與媒介品質。console、lint、reference、security、stage 或 release gate 的 FAIL / BLOCKED 仍具優先權，人工勾選不能覆蓋。

## Artifact fit

- [ ] 產物符合使用者要求的媒介；deck 看起來是 deck、prototype 能操作、motion 有時間節奏，沒有全部退化成 landing page。
- [ ] 每個 screen / slide 具有 `data-screen-label`，命名採 1-indexed 且能讓使用者直接指出位置。
- [ ] 固定尺寸 deck / motion 使用對應 starter 的 scaling，沒有重複手刻 scale。
- [ ] placeholder 清楚說明仍缺的真實素材，不以假圖、假統計或 Lorem ipsum 冒充完成內容。

## Visual and content quality

- [ ] 色彩、字型、spacing、rounded 與 padding 可追溯到目前生效的 DESIGN.md；不存在 DESIGN.md 時已走明確授權的建立流程。
- [ ] 沒有無理由的 gradient、emoji、裝飾 grid、自畫複雜 SVG、陰影或動畫。
- [ ] 字體、對比、hit target 與行長符合目標媒介；狀態不只靠顏色表達。
- [ ] 每個元素都有資訊或互動目的；看似空的區塊以版面解決，不靠 filler 填滿。
- [ ] 文案具體、可讀且接近真實長度；沒有無來源承諾、空泛 marketing speak 或虛構數據。

## Variants and interaction

- [ ] 變體按意圖命名並跨至少兩個維度呈現實質差異，不只是換 accent color。
- [ ] Tweaks listener、available 訊息、defaults 與 persistence 順序正確；雙擊開啟時有入口，面板關閉後控制 UI 完全隱藏。
- [ ] prototype 的必要 flow 可完成；非必要互動明確標為 placeholder，不製造虛假的完整度。
- [ ] motion 可播放、暫停與拖曳；一個 moment 有足夠閱讀時間，動態只服務關鍵信息。

## Human review result

人工 review 應記錄 `PASS`、`NEEDS_REVISION` 或 `NOT_APPLICABLE`，並指出具體 screen / slide 與修改理由。`NEEDS_REVISION` 回到對應 workflow step 修正；完成重驗後才可交付。
