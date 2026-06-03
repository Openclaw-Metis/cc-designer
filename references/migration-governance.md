# Migration governance

這份文件定義 cc-designer 在「改名、棄用、合併、拆分、退役」時必須留下的證據。這些變更比一般用字調整風險高——它們會破壞 routing、使用者肌肉記憶、package 路徑、host wrapper metadata 與下游引用，因此一旦進入這類任務就必須依本文件留證。

## Rename（改名）

一次 rename 必須提供：
- 舊名與新名。
- 改名理由（必須是 discoverability / 使用者語言考量，不是為了暴露內部實作細節）。
- 舊 trigger phrase 的 routing 相容計畫（是否保留 alias）。
- package 路徑與 registry 影響。
- 需要連動更新的 search / README / catalog 清單。
- 證據：除非是刻意保留的 alias，否則 repo 內不得再有指向舊名的引用。

cc-designer 的公開名稱必須對齊使用者語言（「設計」「mock」「原型」「deck」「簡報」「動畫」「wireframe」），不要改成只有作者懂的內部代號。

## Deprecate（棄用）

一次 deprecation 必須提供：
- 棄用理由。
- 替代 skill 或 fallback workflow（例如導向 `frontend-skill`、`/design-consultation`、`/design-review`）。
- 生效日期。
- 預計移除日期，或明確聲明 alias 無限期保留。
- 給使用者看的通知文字。
- regression 風險與 rollback 條件。

被棄用的 cc-designer 不得在已有替代品時，仍默默接收廣泛的設計 query。

## Merge（合併）

一次 merge 必須提供：
- 被合併的來源 skills。
- 目標 skill。
- 邊界理由：說明合併後仍是「一個主要工作」（HTML 設計成品產出），而不是把研究、production code、後端等不相干交付物揉進來。
- 重疊 trigger 與不相容 follow-through policy 的衝突解法。
- references、evals、package name 與 wrapper metadata 的 migration 註記。

若合併結果會同時擁有多個不相干交付物（例如把 production 實作併進來），應拒絕合併，改用 handoff 規則。

## Split（拆分）

一次 split 必須提供：
- 原始 skill。
- 新的目標 skills（例如把 deck / prototype / animation 拆成獨立 skill 的提案）。
- 每個新 skill 的 routing 邊界。
- 跨多個目標的請求要怎麼 handoff。
- eval 重新分配計畫（trigger / functional / golden set 如何切到各新 skill）。
- 舊 trigger phrase 的相容 alias 或 deprecation 註記。

拆分要到「每個新邊界都有 should-trigger 與 should-not-trigger 案例」才算完成。

## Compatibility（相容性）

相容性 review 必須涵蓋：
- 既有 package 路徑。
- skill 名稱與 alias。
- catalog / README / registry 條目（README 位於 skill folder 外的 repo root）。
- host wrapper metadata（cc-designer 目前無 host adapter，所有平台共用同一份 SKILL.md）。
- `SKILL.md`、`references/`、`assets/` 與 eval 資產內的本地引用。
- 舊 benchmark 與 review workspace 路徑。

只有在 `references/readiness_report.md` 記錄了理由、migration 路徑與 rollback 條件時，才可以刻意打破向後相容。

## Migration Evidence（遷移證據）

每一次 migration 事件都必須留下證據：
- `migration_type`：rename、deprecate、merge、split 或 retire。
- `from`：舊 skill 名稱。
- `to`：新 skill 名稱或替代 workflow。
- `effective_date`。
- `compatibility_policy`。
- `references_checked`。
- `evals_updated`。
- `wrappers_updated`（cc-designer 無 wrapper 時填 none）。
- `release_gate_result`（`skill-creator-advanced/scripts/release_gate.py` 的輸出）。

完成的證據存放在 release notes、`references/readiness_report.md`，或當它影響整個 repo 時，放在 skill folder 外的專用 migration 記錄。
