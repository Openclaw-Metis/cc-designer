# Distribution notes

## Packaging

cc-designer 自身沒有 scripts/；打包請從 skill-creator-advanced 呼叫（`~/.claude/skills/skill-creator-advanced/scripts/package_skill.py`）：

```bash
python3 ~/.claude/skills/skill-creator-advanced/scripts/package_skill.py \
  ~/.claude/skills/cc-designer \
  <out-dir>
```

## Single source of truth

- 本 skill folder 是唯一真實來源
- 各 host（Claude Code / Codex CLI / OpenClaw）若要 wrapper，僅做薄層轉接
- 不要把 SKILL.md 或 references 複製進 host wrapper——會造成漂移

## 外部發佈

- README / release notes / 安裝說明放在 repo root（skill folder 外）
- 目前 repo: `Openclaw-Metis/cc-designer`
- 本 skill folder 的 `README.md` 是單一 skill repo 的 GitHub 首頁；若未來併入多 skill monorepo，這份 README 要搬到 repo root

## Eval workflow

- Approved prompts：`assets/evals/evals.json`
- Release thresholds：`assets/evals/regression_gates.json`
- Runner：`~/.claude/skills/skill-creator-advanced/scripts/run_eval.py` + `aggregate_benchmark.py` + `check_regression_gates.py`（cc-designer 自身不帶 scripts/）
