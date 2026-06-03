# Readiness report

這份文件是 `cc-designer` 的 release evidence。它只記錄本版本的機械檢查與 release gate 結論；通用人工 review 問題放在 `references/quality_checklist.md`（視覺 / 內容 QA 輔助，非 release gate）。

## Final gate

- Current version reviewed: 2026.6.3
- Audit date: 2026-06-03
- Overall status: PASS（draft stage）/ BLOCKED（publish stage，待 live paired benchmark）
- Audit runner: local（skill-creator-advanced/scripts）
- Git commit: local working tree
- Blocking issues：
  - draft stage：無。所有 deterministic gate 綠燈。
  - publish stage：尚未跑 with-skill / baseline 的 live paired benchmark（需要可執行模型的 eval harness），因此 lifecycle status 維持 `validated`，未升 `released`。升 `released` 屬 follow-through policy 的「Ask first」，由 owner 決定。

## 本次改版修正（2026.4.22 → 2026.6.3）

1. **Workflow / examples 結構可被機械解析**：把 `<workflow>` 的 9 個 Step 標題與 Action / Input / Output / Validation 欄位、以及 `<examples>` 的 Input / Output 段落，從全形冒號 `：` 改成 ASCII `:`，使 `audit_structure.py` 與 `audit_workflow_contract.py` 能解析。
2. **Workflow 補明確 stop/report 條件**：在 Step 1 加入「零脈絡且未授權從零開始 → stop and report（停止並回報）」與版權仿製的停止條件。
3. **移除 release evidence 的雙重角色衝突**：`quality_checklist.md` 從「發佈前 readiness gate」降級為「視覺 / 內容人工 QA 檢查清單」；canonical release evidence 改為本檔（`readiness_report.md`）；並移除 SKILL.md 中「單一真實來源」用語以消除 `legacy_checklist_truth_conflict`。
4. **新增 lifecycle / migration governance**：新增 `skill_lifecycle.yaml`（state、owner、archetype、support matrix、dependencies）與 `references/migration-governance.md`（rename / deprecate / merge / split / compatibility / migration evidence）。
5. **evals.json 升級為 golden trigger set**：每個 case 補 `language`、`coverage_tags`、`trigger_class`；新增 indirect 與英文 / near-miss negative 案例；補頂層 `benchmark_metadata_required`；修正過短的 prompt / expectation。
6. **README 移出 skill folder**：repo-level README 不放在 skill 目錄內。

## Mechanical evidence（本次實際執行的命令）

- `python skill-creator-advanced/scripts/format_check.py <skill>`
- `python skill-creator-advanced/scripts/audit_structure.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_workflow_contract.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_semantics.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_semantic_rules.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_lifecycle.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_lifecycle_state.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_eval_coverage.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_eval_quality.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_golden_trigger_set.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_wrapper_drift.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_migration_governance.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_surface_drift.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_skill_references.py <skill> --json`
- `python skill-creator-advanced/scripts/audit_unreferenced_files.py <skill> --json`
- `python skill-creator-advanced/scripts/healthcheck_skill.py <skill> --json`
- `python skill-creator-advanced/scripts/release_gate.py <skill> --stage draft --json`

## Format checks

- PASS：skill folder 名稱為 kebab-case（`cc-designer`）。
- PASS：`SKILL.md` 存在、UTF-8、frontmatter 合法且 key 都在允許清單內。
- PASS：skill folder 內無 `README.md`（已移至 repo root 外部）。
- PASS：frontmatter `version` 為 date-based `2026.6.3`。
- PASS：本地引用透過 `audit_skill_references.py` 解析。
- PASS：`audit_unreferenced_files.py` 無 orphan（`quality_checklist.md` 在預設 ignore 名單）。

## Structure checks

- PASS：`SKILL.md` 含真實 `<role>`、`<decision_boundary>`、`<workflow>`、`<output_contract>`、`<default_follow_through_policy>`、`<examples>` 區塊。
- PASS：每個 workflow step 都有 Action / Input / Output / Validation。
- PASS：workflow 含明確 stop/report 條件與 QA / validation pass。
- PASS：`<default_follow_through_policy>` 有 Directly do / Ask first / Stop and report 三段，且無危險動作被列入 Directly do。
- PASS：worked examples 含具體 Input 與 Output 段落。

## Lifecycle / eval checks

- PASS：`references/readiness_report.md` 存在、含當前版本與 Audit date。
- PASS：`skill_lifecycle.yaml` 含 name / status / owner / archetype / primary_structure_pattern / lifecycle / support / risk / dependencies，且 dependencies 路徑都存在。
- PASS：`assets/evals/evals.json` 每筆有 language、coverage_tags、prompt / expected_output / expectations，覆蓋 zh / en / mixed 與 7 類 coverage tag。
- PASS：golden trigger set 滿足 direct ≥ 2、indirect ≥ 2、negative ≥ 1，且 negative 帶 should-not-trigger、positive 帶 should-trigger。
- PASS：eval quality（prompt ≥ 24 字、expected_output ≥ 24 字、每個 expectation ≥ 8 字、無 TODO）。
- PASS：`benchmark_metadata_required` 含 skill_version、git_commit、host、model、temperature、run_timestamp、grader_version。
- PASS：`references/migration-governance.md` 含 Rename / Deprecate / Merge / Split / Compatibility / Migration Evidence。
- PASS：`assets/evals/regression_gates.json` 為合法 JSON（min_pass_rate_delta、max_time_increase_seconds、max_token_increase、require_non_negative_pass_rate）。

## Remaining risk（仍需外部環境 / 人工判斷）

- Publish gate 需要 with-skill vs baseline 的 live paired benchmark（pass rate / 時間 / token / 品質），本地無模型 eval harness 可跑；補上後才可把 status 升 `released` 並產生 `release/evidence-*.json` 與 `release/benchmark-summary-*.json`。
- `@google/design.md` lint 與瀏覽器 console 驗證屬執行期人工 / 環境檢查，不在本機械 gate 內。
- owner 欄位請依實際維護者校正。
