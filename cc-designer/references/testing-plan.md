# Testing plan

本檔是 cc-designer 的測試設計文件。觸發與功能測試的 canonical 資料仍在 `assets/evals/evals.json`，本文件補規則、near-miss、regression gates 與 feedback loop 細節。

## Triggering tests

Should trigger：
- 「幫我做一份 6 頁的產品 pitch deck」
- 「做一個外送 app 的 onboarding prototype」
- 「mock 這張截圖成可點擊的 HTML」
- 「做一段開場動畫」
- 「wireframe 我的 landing，3 個方向」
- 「把這份 PRD 變成投影片」
- 「design something like Linear 的首頁」

Should NOT trigger：
- 「幫我改 Tailwind config 新增 spacing」→ 一般實作
- 「audit 我的首頁視覺」→ `design-taste-frontend`
- 「做一份可在 PowerPoint 編輯的 .pptx」→ `slide-studio`
- 「幫我檢查這份 deck.html 的錯字，版面不要動」→ 直接校稿（action-object contrast）
- 「PR 要不要這樣改」→ 一般 review

Near-miss / 易混淆：
- 「設計一個 component」→ 若目標是 repo production code：`design-taste-frontend`；若是先 mock：cc-designer
- 「幫我做個網頁」→ 若是 landing / marketing mock：cc-designer；若是真的要進 Next.js：`design-taste-frontend`
- 「幫我做一份簡報」→ 先問成品要 HTML 還是 `.pptx`

Should ask before acting：
- 沒有任何設計脈絡時，不要直接從零開始畫；先停下來問

## Functional tests

Test case 1：deck from PRD
- Given：有一份 PRD 檔案路徑、使用者說「8 頁、給董事會看、要像 Linear」
- When：執行 cc-designer flow
- Then：產出 `<name>.html`，用 `deck_stage.js`（web component）；8 個 `<section>`；`verify_artifact.mjs` 回 PASS；頂端有設計敘事註解；Tweaks 含主色 / 字型切換

Test case 2：Interactive prototype
- Given：使用者給 1 張截圖 + 4 步驟說明
- When：執行 cc-designer flow
- Then：若需要 React 才產出 React + Babel prototype；使用 `IOSDevice` 包 children；每 screen 有 `data-screen-label`；Tweaks 含顏色與 CTA copy 切換；交付檔已內嵌 JSX

Test case 3：No context, should stop
- Given：「幫我設計 app」沒有其他脈絡
- When：執行
- Then：skill 應停下來要求 UI kit / 截圖 / 品牌資料，而非憑空畫

Test case 4：Reuse existing DESIGN.md without duplication
- Given：cwd 或上層 3 層內已有 DESIGN.md，使用者要求依品牌製作 deck / mock
- When：執行 cc-designer flow
- Then：完整讀取並原地沿用 DESIGN.md；HTML 展開實際 token 並在頂端註解來源；不把 DESIGN.md 複製進 `design/<project>/`，也不在未授權時修改既有 design system

Test case 5：Double-click regression
- Given：React prototype 由多個 JSX 組成
- When：依 Step 5 內嵌並驗證
- Then：`index.src.html` 被 `external-jsx-src` 擋下；交付檔回 PASS，`rootChildren` > 0。自動化案例在 repo root 的回歸測試

Test case 6：No browser available
- Given：機器上沒有 Chrome、Edge 或 Chromium
- When：執行驗證工具
- Then：回 UNVERIFIED 與 `browser_not_found`；交付訊息第一句寫「console 未驗證」，不用 `open` / `start` 代替驗證

Test case 7：Tweaks on double click
- Given：成品有 Tweaks，以 `file://` 開啟
- When：點頁面上的入口並改值
- Then：面板打開、視覺即時改變、reload 後保留；列印時入口隱藏

## Performance comparison

下列為設計預期，未量測。

- Baseline（無 skill）：Claude 會產出單一 HTML，常常缺 integrity hash、styles 命名撞、沒有 Tweaks、沒複製 assets、console 有錯誤
- With skill：pinned 版本、styles 命名正確、Tweaks 預設附、assets 本地複製、交付前驗證

## ROI guardrail

- Quality gain 必須高過：額外 tool calls（~10-20 次 Read / Write）、額外 bundle 時間（starter copies）、維護 starter 檔的心力
- 若使用者要求的是 one-shot「寫個 HTML」而非「設計」，退回一般 prompt 就好，不要硬上本 skill

## Regression gates（與 `assets/evals/regression_gates.json` 同步）

目前閾值見 `assets/evals/regression_gates.json`。只有具 frozen baseline / candidate、scorer 與完整 metadata 的 live paired harness 才套用這些閾值；deterministic release readiness 由 SkillOps Studio `stage_gate.py` / `release_gate.py` 執行。cc-designer 自身不攜帶 validator scripts；`scripts/` 內兩支工具的回歸測試放在 repo root，指令見 `references/distribution.md`。發版條件：

| 指標 | 閾值 | 資料來源 |
|---|---|---|
| `min_pass_rate_delta` | ≥ +0.15（相對 baseline） | `regression_gates.json` |
| `max_time_increase_seconds` | ≤ 60 | `regression_gates.json` |
| `max_token_increase` | ≤ 5000 | `regression_gates.json` |
| `require_non_negative_pass_rate` | `true` | `regression_gates.json` |
| Max under-trigger failures | ≤ 2 / 10 | 手動核對 trigger eval 結果 |
| Max over-trigger failures | ≤ 1 / 10 | 手動核對 trigger eval 結果 |

**若要調整數字，先改 `regression_gates.json` 再同步本表**——JSON 是 source of truth，本表只是人讀版註解。

## Feedback loop — 常見失敗訊號

- 雙擊後空白 → JSX 沒內嵌；依 Critical rule 15 重建交付檔
- Console 有錯誤 → 多半是 React UMD / integrity hash；修 Critical rule 1
- 樣式錯亂但沒有錯誤 → 同名 `styles` 被靜默蓋掉；修 Critical rule 2
- 視覺太「AI 感」 → 檢查 `references/content-guidelines.md` 的 AI slop tropes
- 使用者說「太像 web 了」 → 提醒自己任務是 deck / prototype / animation，避免用 web 設計套路
- 交付後找不到 Tweaks 或無作用 → 檢查 `references/tweaks.md` 的獨立入口與 `postMessage` 順序
- 資料夾 collision → 見 SKILL.md 的 cwd collision 規則，用 `<project>-v2/` 後綴

## Host compatibility checks

- Claude Code：Read / Write / Edit / Bash / Glob / Grep + 瀏覽器工具（若有）
- Codex CLI、OpenClaw：同上；驗證靠 `scripts/verify_artifact.mjs`，需要 Node 22 以上與 Chrome、Edge 或 Chromium
- 任何沒有 filesystem 的 chat 介面：**不支援**（無法交付 HTML）
