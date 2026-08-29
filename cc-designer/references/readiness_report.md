# Readiness report

這份文件是 `cc-designer` 2026.8.29 的 canonical release evidence。它只記錄本輪實際執行的檢查、結果、限制與 rollback；視覺／內容人工判斷由 `references/quality_checklist.md` 補充，不能覆蓋機械 gate。

## Final gate

- Current version reviewed: `2026.8.29`
- Audit date: `2026-08-29`
- Evidence level: `E2`（現有 artifact + 本輪發現並修正的 DESIGN.md 重複／擅改契約衝突，已補 regression expectation）
- Lifecycle status: `released`；本次 goal 已明確授權 GitHub push 與版本更新
- Validator: SkillOps Studio `stage_gate.py` / `release_gate.py`, validator `3.7.0`
- Overall required gate: **PASS**；validated metadata 更新後的 publish rerun 已通過，released metadata 由最後一次 rerun 驗證
- Benchmark: **SKIPPED**。本輪沒有 frozen baseline / candidate live model harness，因此不宣稱 pass-rate、品質、latency、token 或 ROI 改善

## Workflow plan / run

1. `inventory` → PASS：repo、版本、lifecycle、eval、readiness 與 git state 已盤點。
2. `revise-structure` → PASS：repo root 保留 README；skill package 移至 `cc-designer/`，format 不再需要 README 例外。
3. `point-of-use-index` → PASS：30 個 resource / policy / lifecycle artifact 全部由 `SKILL.md` 的具體使用條件引用，0 detached link、0 orphan。
4. `contract-repair` → PASS：已有上層 DESIGN.md 時改為原地沿用、不複製、不擅改；eval case 12 與 testing plan 已補 regression。
5. `starter-smoke` → PASS：Chromium 實測 pinned React/Babel SRI、6 個 JSX starter、40 個公開 exports 與 `deck_stage.js` lifecycle。
6. `evaluation-security` → PASS：revise / publish / security required gates 全部通過；instruction-control 為 advisory PASS。
7. `release` → READY：lifecycle promotion 已完成；最後 gate PASS 後建立 commit / tag 並執行 GitHub push。

## Changes

- Repository layout：`README.md` / `LICENSE` 留在 repo root；可安裝 skill package 位於 `cc-designer/`。
- `SKILL.md`：版本升至 `2026.8.29`；補齊 point-of-use links、release policy、trust boundary 與明確的 DESIGN.md reuse 行為。
- Policies：新增 `policies/release_policy.yaml` 與 `policies/portability_policy.yaml`。
- DESIGN.md contract：上層檔案原地沿用；HTML 展開 token 並記錄相對來源；修改既有 design system 前取得授權。
- QA：人工 checklist 改為媒介、內容、變體與互動品質，移除把機械 FAIL 當 accepted exception 的舊做法。

## Actual validation

- `stage_gate.py . --stage revise --json` → **PASS**；format / references / unreferenced files / consistency / eval assets 全部 PASS；benchmark SKIPPED。
- `audit_unreferenced_files.py . --json` → **PASS**；30 accepted links、0 ignored links、0 findings。
- `release_gate.py . --stage publish --json` → **PASS**；security 掃描 31 files、eligible components coverage 100%、0 error、0 warning。
- Playwright Chromium `151.0.7922.34` smoke → **PASS**：React `18.3.1`、ReactDOM `18.3.1`、Babel `7.29.0` 的 pinned SRI 載入成功；6 個 JSX starter 無 console error 且 exports 全數存在。
- `deck_stage.js` smoke → **PASS**：custom element registered、2 slides、initial index 0、自動補 `02 Slide` label、0 console error。
- `package_skill.py . <temp-dir>` → **PASS**；package gate 通過並產生 `.skill`。最終 package hash 於內容凍結後記錄在 repo root release evidence，避免 package 自我包含 hash。

## Common error checks

- React / Babel 載入或 SRI 錯誤：以 Chromium 實際載入 pinned CDN 並收集 `pageerror` / console error，結果 0 error。
- JSX 跨檔 scope / export 漂移：逐一檢查 6 個 starter 的 `Object.assign(window, ...)` 公開面，40 個預期 export 全部存在。
- Deck lifecycle / label 漂移：驗證 `<deck-stage>` registration、slide count、initial index 與自動 label，結果符合契約。
- Reference / package path 漂移：reference audit、orphan audit 與 package gate 全部 PASS；若執行期仍出錯，依 `references/troubleshooting.md` 定位後回到對應 workflow step 重驗。

## Instruction-control report

- Advisory status: **PASS**，analysis complete。
- Remaining findings: 23 warnings，0 blocking。這些以 negative phrasing 與弱裁量詞為主；本輪已修正高影響的提問順序、point-of-use action 與 trust boundary，其餘不影響 required gate。

## Rollback path

- Git rollback：release tag 的前一版為 `v2026.6.24`（commit `9b5b82b`）。若新 package 造成 host discovery 或安裝問題，將 default branch 回復至該 tag，並把安裝路徑改回 repo root。
- Layout rollback：反向搬移 `cc-designer/{SKILL.md,assets,references,policies,skill_lifecycle.yaml}` 至 repo root，移除新增 policies，再恢復舊 README 安裝指令。
- Contract rollback：還原 DESIGN.md reuse 文字與 eval expectation；不刪除使用者專案資料。

## Residual risks

- 沒有 live paired benchmark；因此本版只宣稱治理、契約一致性與可重跑 starter smoke 通過，不宣稱模型輸出品質提升。
- `@google/design.md@0.1.1` 仍是使用者授權後才安裝的 optional dependency；本輪沒有執行其 live lint。
- repo layout 改為內層 skill package，既有以「直接 clone 到 skills/cc-designer」安裝的 consumer 需改用 README 的 copy 指令。
