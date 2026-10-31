# Readiness report

這份文件是 `cc-designer` 2026.10.31 的 canonical release evidence。它只記錄本輪實際執行的檢查、結果、限制與 rollback；視覺／內容人工判斷由 `references/quality_checklist.md` 補充，不能覆蓋機械 gate。

## Final gate

- Current version reviewed: `2026.10.31`
- Audit date: `2026-10-31`
- Evidence level: `E2`（現有 artifact + 本輪在真實 Chrome 重現的失敗，已補可重跑的 regression）
- Lifecycle status: `released`；本次需求已明確授權 GitHub push、新版本與 release
- Validator: SkillOps Studio `stage_gate.py` / `release_gate.py`, validator `3.11.0`
- Overall required gate: **PASS**；revise、publish 與 security 於最終內容重跑通過
- Benchmark: **SKIPPED**。本輪沒有 frozen baseline / candidate live model harness，因此不宣稱 pass-rate、品質、latency、token 或 ROI 改善

## Workflow plan / run

1. `inventory` → PASS：repo、版本、lifecycle、eval、readiness、安裝狀態已盤點。已安裝資料夾與 `v2026.8.29` 內容一致，但採 repo layout，根目錄沒有 `SKILL.md`。
2. `baseline-gates` → FAIL：validator 升到 3.11.0 後，frontmatter `version` 讓 revise / publish 同時失敗。
3. `failure-reproduction` → PASS：在 Chrome 以 `file://` 重現空白頁、實測 Babel scope、Google Fonts 可用性、WCAG 對比與 lint 工具版本。
4. `control-surface-changes` → PASS：見下方 Changes。
5. `end-to-end-trial` → PASS：依 SKILL.md 實作 deck 與 React prototype，以真實滑鼠、鍵盤事件操作。
6. `evaluation-security` → PASS：revise / publish / security required gates 全部通過；instruction-control 為 advisory PASS。
7. `release` → READY：最後 gate PASS 後建立 commit / PR / tag / GitHub release。

## Changes

| Base failure | Control surface | Artifact | Expected action shift |
|---|---|---|---|
| React 成品雙擊後空白，違反「可雙擊開啟」承諾 | deterministic executor | `scripts/inline_jsx.mjs`、Step 3 / 5 | 交付內嵌後的 HTML，不交 `text/babel src` |
| 只用 `open` / `start` 就宣稱 console 無錯誤 | deterministic executor、validation rule | `scripts/verify_artifact.mjs`、Step 7、Critical rule 17 | 實際讀 console；看不到時回 UNVERIFIED 並寫進 caveats |
| 文件列出 starter 不存在的 props，靜默失效 | external context、validation rule | `references/starter-components.md`、`animations.md`、`prototypes.md`，regression test | 依實際 API 寫 JSX；文件再漂移時測試失敗 |
| 雙擊開啟時 Tweaks 打不開，speaker notes 看不到 | external context、validation rule | `references/tweaks.md`、`decks.md`、`tweaks-no-standalone` 規則 | 頁面提供獨立入口與 notes 面板 |
| 商業字型載不到、繁中退回系統字 | external context、reusable material | house style、`content-guidelines.md`、Critical rule 16 | 只用載得到的字型，繁中接 Noto TC |
| 規則互相矛盾：提問題數、變體數、外部資源、Babel scope | instructions | `SKILL.md`、`questions.md`、Critical rules 2、3、5、11 | 單一明確預設，減少裁量漂移 |
| 交棒給不存在的 skill；與 `slide-studio` 搶 `.pptx` | instructions | description、Routing boundaries、lifecycle portfolio | 依實際鄰近能力交棒，格式不明時先問 |
| lint 工具落後且偵測指令在 Windows 卡住 | external context | `@google/design.md@0.4.0`、`designmd` bin | 偵測不卡住，取得 contrast 檢查 |
| validator 拒絕 frontmatter `version` | instructions | `metadata.version` | format gate 通過 |

其他：house style 的對比數字改為實算值，`tertiary`、`warning` 調深到 neutral 底上過 AA，`callout-quote` 移除與 anti-slop 規則衝突的左邊色條。

## Actual validation

- Baseline：`stage_gate.py --stage revise` 與 `release_gate.py --stage publish` 對 `v2026.8.29` 皆 **FAIL**（`format_check`：frontmatter `version`）。
- `stage_gate.py . --stage revise --json` → **PASS**；format / references / unreferenced files / consistency / eval assets 全部 PASS；benchmark SKIPPED。
- `release_gate.py . --stage publish --json` → **PASS**；security 0 error、0 warning。
- `audit_runtime_independence.py` → **NOT_APPLICABLE**：它檢查的 8 個資產是 SkillOps Studio 自身的治理檔，不屬於目標 skill，也不在 stage gate 與 `policies/release_policy.yaml` 的必要項目內；本輪輸出為 FAIL，不具放行效力，也未列入放行依據。
- `node --test tests/artifact_tools.test.mjs`（repo root）→ **PASS**：28 / 28，Node `24.22.1`，Chrome `156.0.8078.74`。
- Validation-rule 反向驗證 → **PASS**：同一份測試對 `v2026.8.29` 的文件回報 13 處不存在的 props；`index.src.html` 被 `external-jsx-src` 擋下並實測到 CORS 錯誤。
- Starter smoke over `file://` → **PASS**：6 個 JSX starter 內嵌後與 `deck_stage.js` 皆 0 console error，root 成功掛載。
- 端到端試作 → **PASS**：deck 與 React prototype 回 PASS；Tweaks 入口開啟、改值即時生效、reload 保留，方向鍵可翻頁，列印時入口隱藏，Fraunces、Geist、Noto Serif TC 實際載入，prototype 點擊換頁，全程 0 error。
- Edge fallback：以 `--browser` 指定 Microsoft Edge → **PASS**。
- 程序清理：驗證結束後 0 個殘留瀏覽器程序、0 個殘留暫存 profile。
- `@google/design.md@0.4.0` lint：house style 0 error、5 warning（皆為 `orphaned-tokens`），文件範例 0 error、0 warning。
- `stage_gate.py . --stage package --json` → **PASS**。
- `package_skill.py . <temp-dir>`（`PYTHONUTF8=1`）→ **PASS**；最終 package hash 於內容凍結後記錄在 repo root release evidence，避免 package 自我包含 hash。

## Common error checks

- `file://` 空白頁：`external-jsx-src` 靜態擋下，瀏覽器階段另有 `blank-render`；回歸案例含真實 `ios_frame.jsx`。
- React / Babel 載入或 SRI 錯誤：本輪重算 3 個 pinned URL 的 sha384，與 Step 5 的 integrity 一致。
- Reference / package path 漂移：reference audit、orphan audit 與 package gate 全部 PASS。

## Instruction-control report

- Advisory status: **PASS**，analysis complete。
- Remaining findings: 18 warnings、2 observations，0 blocking（基線為 23 warnings）。主要是 Step 欄位的 `required_action` 判定與弱裁量詞，不影響 required gate。

## Rollback path

- Git rollback：前一版為 `v2026.8.29`（commit `d39be3f`）。將 default branch 回復至該 tag 即可；本版沒有改變 repo layout 或 skill 名稱。
- 本機安裝 rollback：`git archive v2026.8.29` 取回舊內容。舊版的根目錄沒有 `SKILL.md`，要複製的是內層 `cc-designer/`。
- 已交付的成品不受影響：scripts 只在製作時使用，不會寫進使用者的 HTML 依賴。

## Residual risks

- 沒有 live paired benchmark，新增的 6 個 eval 也未以模型重播；trigger 邊界調整的效果未量測，本版只宣稱工具行為與文件一致性通過。
- 只在 Windows 11 實測。macOS、Linux 的瀏覽器路徑與 process group 清理未實際執行。
- 靜態規則以 regex 判斷；error 類針對結構明確的錯誤，warning 類可能誤判，`verification.md` 已要求先看對應位置。
- `Routing boundaries` 列的鄰近 skill 依作者環境命名；其他 host 沒有時改為告知超出範圍。
- Starter 來自 Claude.ai Artifacts designer 環境，本輪未重新查核其授權來源。
- `verify_artifact.mjs` 不判斷視覺品質，也不驗字型是否真的載入；這兩項仍靠截圖與人工 QA。
