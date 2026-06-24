# Readiness report

這份文件是 `cc-designer` 的 release evidence（canonical release gate）。它只記錄本版本的機械檢查與 release gate 結論；通用人工 review 問題放在 `references/quality_checklist.md`（視覺 / 內容 QA 輔助，非 release gate）。常見執行期錯誤與修法見 `references/troubleshooting.md`。

## Final gate

- Current version reviewed: 2026.6.24
- Audit date: 2026-06-24（skill-optimizer pass；前次 2026-06-16）
- Lifecycle status: `released`（owner Openclaw-Metis 於 2026-06-16 授權，見 Release decision）
- Overall mechanical gate: **PASS（draft stage）with 1 accepted exception**；publish stage = BLOCKED（待 live paired benchmark，見 Remaining risk）
- Audit runner: local（`skill-creator-advanced/scripts/release_gate.py`）
- Git commit: 見本次發佈 commit（local working tree）
- Accepted exception:
  - `format_check.py` 對 skill folder 內的 `README.md` 報 1 error（`README.md must NOT be inside the skill folder`）。本 skill 以**獨立 GitHub repo** 形式發佈（repo root = skill folder），README 同時是 repo 首頁，故**保留為 accepted exception**——該規則針對 collection 內嵌型 skill，不適用 repo 發佈型 skill。除 README 外 17/18 audit 全綠。
- Blocking issues:
  - draft stage：無（README 為 accepted exception）。
  - publish stage：尚未跑 with-skill / baseline 的 live paired benchmark（需可執行模型的 eval harness）；見 Release decision 的 waiver。

## Release decision（validated → released）

- 升 `released` 屬 follow-through policy 的「Ask first」owner 決定。owner（Openclaw-Metis）於 **2026-06-16** 明確授權本版本正式發佈。
- 依此授權執行 `promote_skill_state.py --to released`，`skill_lifecycle.yaml` status 由 `validated` 升 `released`，並更新 `last_validated_at` / `last_released_at` / `next_review_due`。
- **Benchmark waiver**：live paired benchmark 因本機無模型 eval harness 未跑，由 owner 決定**暫予豁免並列為 documented residual risk**——不以捏造數據充當證據。補上 harness 後應回填 `release/benchmark-summary-*.json` 並重跑 publish gate，才算 benchmark-backed release。

## 本次改版修正（2026.6.16 → 2026.6.24）— skill-optimizer pass

由 `/skill-optimizer` 對本 skill 做一輪以確定性靜態檢查為 scoring signal 的優化（本機**無 live model rollout harness**，pass-rate / token / latency 的 live paired benchmark 沿用既有 waiver）。owner（使用者）於 **2026-06-24** 在優化 session 中明確授權「全部採納 + 升版」。

採納的 bounded edits（皆 add / replace，無刪 workflow / 安全 gate）：

1. **修正 `Fraunces` 跨檔 anti-slop 矛盾**：`Fraunces` 原同時被列為「避免的 overused 字型」（`SKILL.md` rule #8、`references/content-guidelines.md`、`references/decks.md`），卻又是 `assets/house-style.DESIGN.md` 與 `references/design-md-integration.md` 範例的招牌 display 字型且有明確辯護。依 owner 決定**保留 Fraunces 為好字型**，從 3 份 ban-list 移除（保留 Inter / Roboto / Arial）；`content-guidelines.md` 同步把 Fraunces 併入「有個性的替代」清單。
2. **補 DESIGN.md 流程 eval 覆蓋**：DESIGN.md 是 description 招牌 trigger + 整份 `design-md-integration.md` + Critical rules #13/#14，但原 11 個 eval 零覆蓋其偵測 / 寫入流程。新增 `evals.json` #12（已有 DESIGN.md → 偵測並復用，token 展開）、#13（有 brand input 無 DESIGN.md → 於專案資料夾新寫一份），新 coverage tag `design-md`。
3. **補 landing 重疊 near-miss eval**：landing mock vs production 的邊界原只寫在 `references/testing-plan.md`、`evals.json` 無對應案。新增 #14（與 `frontend-skill` / `design-taste-frontend` 的 overlap-neighbor near-miss）。
4. **去除 animations starter 的 Inter 預設**：`assets/starters/animations.jsx` 的 `TextSprite` 預設字型與 `Stage` / `PlaybackBar` 的 `fontFamily` 原為 `Inter`（rule #8 頭號 slop 字，content 會經繼承帶出），改為中性 `system-ui` fallback 並加註「override per brand」。`android_frame.jsx` 的 Roboto 與 `deck_stage.js` 的 Arial 經判定為 **OS-accurate chrome（非 slop）**，保留不動。

採納前已驗證乾淨（無缺陷）：eval↔starter 名稱一致（`IOSDevice` / `DCArtboard` / `DCPostIt` / `Stage` / `Sprite` / `useTime` / `interpolate` / `<deck-stage>`）、references 全存在、`<default_follow_through_policy>` 無危險動作。

### Mechanical evidence（2026-06-24 本輪實際執行）

- `python release_gate.py <skill> --stage draft` → **FAIL（exit 1）僅因 README accepted exception**；其餘 16 項全 PASS（format 以外的 structure / workflow_contract / semantics / semantic_rules / gate_language / lifecycle / lifecycle_state / eval_coverage / eval_quality / golden_trigger_set / wrapper_drift / migration_governance / surface_drift / skill_references / unreferenced_files / healthcheck）；benchmark SKIPPED（draft 階段為 optional）。
- `python audit_golden_trigger_set.py <skill>` → PASS（direct=7, indirect=4, negative=3）。
- `python audit_eval_quality.py <skill>` → PASS（含新增 #12-#14）。
- `python -m json` 載入 `evals.json` → 合法；14 案、id 1-14 唯一、8 類 coverage tag、langs zh=7 / mixed=5 / en=2。
- `grep Fraunces` → 已不在 `SKILL.md` rule #8 與 `decks.md` ban-list；仍在 house-style / 範例 / good-list（符合預期）。`grep Inter` 於 `assets/starters/` → `animations.jsx` 已 Inter-free。

### Gate 結論（fail-first）

- **Draft stage**：PASS（淨除 README accepted exception；本輪未新增任何 gate 失敗）。
- **Publish stage**：仍 **BLOCKED**——live paired benchmark 因本機無模型 eval harness 未跑，沿用 owner waiver；補 harness 後回填 `release/benchmark-summary-*.json` 並重跑 `--stage publish` 才算 benchmark-backed release。
- Rollback path：四項皆 bounded，逐項可還原；evals #12-14 為純新增（移除即回 11 案基線），字型改動為單行 replace，de-Fraunce 為三處 token 移除。

## 本次改版修正（2026.6.3 → 2026.6.16）

1. **修正 DESIGN.md lint skip 自相矛盾**：SKILL.md（Step 7 / tool_rules）原寫「binary 不在就 silent skip、不在 caveats 提」，與 `references/design-md-integration.md`（canonical）「graceful skip 但必須在交付訊息揭露、不可 silent skip」相反。統一為 design-md-integration.md 的揭露規則（caveats 記一句「Lint 未跑：@google/design.md 未裝」）。
2. **移除 hard-coded 絕對路徑**：`references/starter-components.md`（及 distribution / quality_checklist 命令）原用 `/home/ubuntu/...` cp 範例，改為 `$SKILL_DIR` / 相對路徑，符合 Claude Code / Codex CLI / OpenClaw 跨 host 可攜性。
3. **scrollIntoView 規則對齊**：SKILL.md Step 5 Critical rule 4 原寫「永遠不要用」，與下方 Critical rules #4（本地 HTML 無此問題、僅 Claude.ai Artifacts iframe 受限）矛盾；`references/verification.md` 的 blanket 檢查同步收斂為 iframe-scope。
4. **新增 fail-first gate precedence 用語**：SKILL.md `Ops & release` 補「任一 gate FAIL/BLOCKED → 結論只能 FAIL/BLOCKED；局部 PASS 不具放行效力」，通過 `audit_gate_language.py`。
5. **版本一致化**：SKILL.md frontmatter、本檔、`quality_checklist.md` 的 current-version 一律 `2026.6.16`（修正 quality_checklist 殘留的 `2026.4.22`）。

## Mechanical evidence（本次實際執行的命令）

- `python3 skill-creator-advanced/scripts/release_gate.py <skill> --stage draft` → PASS（除 README accepted exception；benchmark SKIPPED）
- `python3 skill-creator-advanced/scripts/release_gate.py <skill> --stage publish` → BLOCKED（benchmark required；見 waiver）
- `python3 skill-creator-advanced/scripts/audit_gate_language.py <skill>` → PASS
- `python3 skill-creator-advanced/scripts/audit_lifecycle.py <skill>` / `audit_lifecycle_state.py` → PASS
- 其餘 audit（structure / workflow_contract / semantics / semantic_rules / eval_coverage / eval_quality / golden_trigger_set / wrapper_drift / migration_governance / surface_drift / skill_references / unreferenced_files / healthcheck）→ PASS

## Format / structure checks

- PASS：folder 名 kebab-case（`cc-designer`）、`SKILL.md` UTF-8、frontmatter 合法且 key 在允許清單內。
- Accepted exception：skill folder 內有 `README.md`（repo 發佈型，見 Final gate）。
- PASS：`SKILL.md` 含 `<role>` / `<decision_boundary>` / `<workflow>` / `<output_contract>` / `<default_follow_through_policy>` / `<examples>`；每個 workflow step 有 Action / Input / Output / Validation。
- PASS：fail-first gate precedence 用語就位（`audit_gate_language.py`）。
- PASS：frontmatter `version` 為 date-based `2026.6.16`。

## Requirement / policy checks

- PASS：trigger / negative trigger / 鄰近 skill 邊界（見 `references/quality_checklist.md` 與 `assets/evals/evals.json`）。
- PASS：`<default_follow_through_policy>` 三段（Directly do / Ask first / Stop and report），無危險動作列入 Directly do。
- PASS：workflow 含明確 stop/report 條件（零脈絡 / 版權仿製）與 QA / validation pass。

## Common error checks（常見錯誤）

- 常見執行期錯誤（console error、`<script>` 載入、Babel 多檔 scope、`const styles` 撞名、`scrollIntoView` 在 iframe 干擾 host）對照與修法見 `references/troubleshooting.md` 與 `references/verification.md`。
- PASS：`audit_skill_references.py` 無 broken local reference；`audit_unreferenced_files.py` 無 orphan。

## Lifecycle / eval checks

- PASS：`skill_lifecycle.yaml` 含 name / status / owner / archetype / primary_structure_pattern / lifecycle / support / risk / dependencies，且 dependencies 路徑都存在。
- PASS：`assets/evals/evals.json` 為 golden trigger set（direct ≥ 2、indirect ≥ 2、negative ≥ 1，覆蓋 zh / en / mixed 與 8 類 coverage tag，含 2026-06-24 新增的 `design-md`）；`benchmark_metadata_required` 含 skill_version、git_commit、host、model、temperature、run_timestamp、grader_version。
- PASS：`references/migration-governance.md` 含 Rename / Deprecate / Merge / Split / Compatibility / Migration Evidence。
- PASS：`assets/evals/regression_gates.json` 為合法 JSON（min_pass_rate_delta 0.15、max_time_increase_seconds 60、max_token_increase 5000、require_non_negative_pass_rate true）。

## Remaining risk（仍需外部環境 / 人工判斷）

- **Publish gate / benchmark**：with-skill vs baseline 的 live paired benchmark（pass rate / 時間 / token / 品質）本機無模型 eval harness 可跑；本版以 owner 授權 + documented waiver 發佈。補 harness 後回填 `release/benchmark-summary-*.json` 並重跑 `--stage publish` 才算 benchmark-backed release。
- **README accepted exception**：若未來改為 collection 內嵌散佈，需把 `README.md` 移出 skill folder 才能讓 `format_check.py` 全綠。
- `@google/design.md` lint 與瀏覽器 console 驗證屬執行期人工 / 環境檢查，不在本機械 gate 內。
