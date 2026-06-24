# Quality checklist

每次 packaging / shipping 新版本前先過這份 checklist。每項要附 pass/fail 與**證據**（命令輸出、檔案路徑、決策原因），不是被動筆記。

## Final gate

- Current version reviewed: `2026.6.24`（本檔為人工 QA 輔助；canonical 機械 release 證據見 `references/readiness_report.md`。以下詳列證據為 2026.4.22 輪歷史紀錄）
- Overall status: **PASS (with 1 accepted exception: `README.md` in skill folder)**
- Blocking issues: 無
- Evidence / commands run (本輪 2026-04-22):
  - `format_check.py` → 1 error：`README.md must NOT be inside the skill folder`——**accepted exception**（單 skill repo，README 同時作為 GitHub repo 首頁；解釋同 4.19 輪）
  - `quick_validate.py` → `Skill is valid!`
  - `audit_skill_references.py` → `Skill reference audit passed: 0 issues across 16 source file(s)` （+1 = `design-md-integration.md`）
  - `audit_unreferenced_files.py` → `Unreferenced file audit passed: 0 issues across 16 source file(s), 25 referenced file(s)` （+2 = `design-md-integration.md` source + `house-style.DESIGN.md` referenced）
  - 手動審查 SKILL.md（396 行）+ 14 份 references + 1 個 fallback DESIGN.md + 7 個 starter components

### 2026-04-22 變更摘要（DESIGN.md 整合）

- **新檔**：
  - `references/design-md-integration.md`（13 KB）—— DESIGN.md 何時讀 / 何時寫 / lint / handoff 完整協定，含 spec snapshot 與最小範例
  - `assets/house-style.DESIGN.md`（8.6 KB）—— cc-designer 的 fallback house style（Editorial Restraint：Fraunces + Söhne + Source Serif 4 + 磚紅 accent；無 box-shadow token）
- **SKILL.md edits**：
  - `description` 增加 DESIGN.md trigger phrase 與品牌層說明
  - opening 加 "DESIGN.md 是 cc-designer 的品牌層" 段落
  - Step 1 第一順位改為掃 cwd 與 3 層上層找 DESIGN.md
  - Step 2 增加「若有 DESIGN.md 直接以 Overview 為敘事種子」與「house style 複製改名」分支
  - Step 3 拆三情境（已存在 / 新寫 / 從 fallback 複製）
  - Step 7 增加可選 `npx @google/design.md@0.1.1 lint` 步驟（binary 不存在就靜默跳過）
  - `<output_contract>` 加入 DESIGN.md deliverable
  - `<tool_rules>` 加入 `@google/design.md@0.1.1` 為 optional dep（不主動 install）
  - Sub-flows 與 Ops & release 表加入兩份新檔
  - Critical rules 13 / 14 新增：DESIGN.md 為 token source of truth、不直接 reference fallback
  - Version frontmatter `2026.4.19` → `2026.4.22`

## Format checks

- [x] Folder name 是 kebab-case：`cc-designer`
- [x] `SKILL.md` 存在（大小寫敏感）
- [x] YAML frontmatter `---` 開始與結束
- [x] frontmatter 有 `name` + `description`
- [x] `description` 由 850+ 字縮到 ~260 字（單段，合乎 1-3 句原則）
- [x] frontmatter 內無 `<` / `>`
- [x] `references/quality_checklist.md` 存在且為本輪 review 更新
- [x] `scripts/` / `references/` / `assets/` 內無未說明的孤兒檔
- [~] skill folder 內無 `README.md` — **accepted exception**（單 skill repo；見 Final gate 解釋）

## Requirement and policy checks

- [x] obvious queries 會觸發（「做 deck」「動畫」「prototype」「wireframe」「設計探索」）
- [x] paraphrases 會觸發（「幫我 mock 一個畫面」「做投影片」「pitch」「motion」）
- [x] 不該觸發的不會觸發（「實作 React app」「修這個 bug」「設計 DB schema」→ 走別的 skill）
- [x] 不會偷搶鄰近 skill 的 query：
  - `frontend-skill` / `design-taste-frontend` 是「production frontend / app dev」——`cc-designer` 是「design artifact / visual exploration」
  - `design-html` 是 Pretext-native production HTML——`cc-designer` 是 standalone HTML proto / deck
  - `design-shotgun` 是「跑多版 AI variants 比對」——`cc-designer` 是手做版本
  - description 已寫明「不適用：實作正式 Next.js / React 生產 app」
- [x] 中英混雜 query 都能觸發（中文 description + 英文 trigger phrases）
- [x] cross-tool support 寫明：核心是 host-agnostic standalone HTML/JS/JSX，preview 用 gstack `/browse` 或系統 `xdg-open`/`open`/`start`
- [x] description 明寫何時用、何時不用、成功輸出長相
- [x] 只有一個 primary job：產出可直接打開的 HTML 設計成品
- [x] 步驟用祈使句 + 寫明 input / output / 驗證點
- [x] opening summary 與 `<role>` / `<decision_boundary>` 用陳述句；workflow 步驟才用祈使
- [x] core workflow 端到端可走：Step 0 → 8
- [x] error handling 有方向：`references/troubleshooting.md` 列常見 console error + 修法
- [x] output structure 明訂：主 HTML 檔 + `design/<project>/` + 變體 / Tweaks + 交付訊息 ≤ 120 字
- [x] output contract 明寫
- [x] default follow-through policy 明寫（哪些直接做、哪些先問、哪些停下回報）
- [x] examples：兩個 worked examples（pitch deck、onboarding prototype）
- [x] tool rules 明訂：Read / Write / Edit / Bash / Glob / Grep / AskUserQuestion / gstack `/browse`
- [x] cross-tool：本 skill 只跑在 Claude Code-like filesystem 環境，無多 host wrapper（單一 source of truth）
- [x] auth / approval / persistence 明寫（`localStorage` 或 `__edit_mode_set_keys` postMessage）
- [x] mutable state 不存在 skill folder（產出檔寫到使用者工作目錄）

## Common error checks

- [x] `SKILL.md` / `references/*.md` 引用的本地路徑都存在（`audit_skill_references.py` PASS）
- [x] 所有 14 份 `references/*.md` 都在 `references/` 下：
  - decks.md、prototypes.md、animations.md、wireframes.md
  - tweaks.md、content-guidelines.md、questions.md、starter-components.md、verification.md
  - testing-plan.md、troubleshooting.md、model-notes.md、distribution.md
  - **design-md-integration.md**（4.22 新增）
  - quality_checklist.md
- [x] 所有 `assets/starters/*.{js,jsx}` 都在 `assets/starters/` 下（7 個）且在 `references/starter-components.md` 列表內
- [x] `assets/house-style.DESIGN.md` 存在（4.22 新增；cc-designer 的 fallback house style）
- [x] `assets/evals/evals.json` + `regression_gates.json` 都存在
- [x] 無孤兒檔（`audit_unreferenced_files.py` PASS）
- [x] `SKILL.md`、`references/`、`scripts/` 之間無互相矛盾規則
- [x] **規則一致性**：
  - Placeholder scope 明確（explore 階段 OK，handoff 到 `frontend-skill` 後套 production 規則）——SKILL.md 與全域 CLAUDE.md 不衝突
  - `scrollIntoView` 明確標為 Claude.ai Artifacts iframe 限制；本地 HTML 直接用沒問題
  - 預設走 static HTML + CSS；React 只在需要互動 / state / Tweaks 邏輯時才上
  - cwd collision 規則：同名資料夾非空 → 問覆蓋 / 併用 / 改名（`<project>-v2/`）
  - regression_gates.json 是 source of truth，`testing-plan.md` 的表格只是人讀版
- [x] Starter API 與 references 同步：IOSDevice / MacWindow / AndroidDevice / ChromeWindow / DCArtboard / PlaybackBar / TextSprite 等新 exports 已寫進 starter-components.md、prototypes.md、animations.md、wireframes.md、decks.md
- [x] 無 release-blocking `[TODO]` placeholder 殘留在 user-facing 內容
- [x] follow-through policy 無 hidden side effects
- [x] neighbor-skill overlap 已 review：見 Requirement checks 區
- [x] 無 host wrapper fork（單 source of truth）

## Maintenance

- [x] version bumped：`2026.6.24`（前次 `2026.6.16`；本輪 skill-optimizer pass：de-Fraunce + DESIGN.md/landing evals + animations 去 Inter）
- [x] changes documented：commit message + Discord reply（在 skill folder 外）
- [x] evals 存於 `assets/evals/evals.json`（已同步 case 2 / 3 的新 API 名稱）
- [x] regression gates 定於 `assets/evals/regression_gates.json`：
  - `min_pass_rate_delta: 0.15`
  - `max_time_increase_seconds: 60`
  - `max_token_increase: 5000`
  - `require_non_negative_pass_rate: true`
- [x] SKILL.md 的 `Ops & release` 表註記 JSON 為 source of truth
- [x] ROI review：本 skill 取代「使用者每次都要把 Claude.ai Artifacts 提示複製過來重貼」的痛點，且把 sandbox-only 工具映射成 Claude Code 原生工具——明顯正向 ROI
- [x] long workflow 已拆分：8 個 Step；複雜分支放 `references/` 而非 SKILL.md
- [x] model-specific notes 已拆出到 `references/model-notes.md`

## 本輪檢查指令證據

```bash
# 1) format check
python3 ~/.claude/skills/skill-creator-advanced/scripts/format_check.py \
  ~/.claude/skills/cc-designer
# → 1 error (README.md inside skill folder) — accepted exception

# 2) quick validate
python3 ~/.claude/skills/skill-creator-advanced/scripts/quick_validate.py \
  ~/.claude/skills/cc-designer
# → Skill is valid!

# 3) skill references
python3 ~/.claude/skills/skill-creator-advanced/scripts/audit_skill_references.py \
  ~/.claude/skills/cc-designer
# → Skill reference audit passed: 0 issues across 15 source file(s)

# 4) unreferenced files
python3 ~/.claude/skills/skill-creator-advanced/scripts/audit_unreferenced_files.py \
  ~/.claude/skills/cc-designer
# → Unreferenced file audit passed: 0 issues
```
