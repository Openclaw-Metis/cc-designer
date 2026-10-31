# Distribution notes

## Packaging

cc-designer 只隨附使用者端的 `scripts/inline_jsx.mjs` 與 `scripts/verify_artifact.mjs`，沒有 release scripts；維護者從已安裝的 SkillOps Studio 呼叫 package 工具，並把 skill package 指向 repo 內層 `cc-designer/`：

```bash
python3 "$SKILLOPS_DIR/modules/skill-release-lifecycle/scripts/package_skill.py" \
  ./cc-designer \
  <out-dir>
```

打包前先跑 `python3 "$SKILLOPS_DIR/scripts/stage_gate.py" ./cc-designer --stage revise --json`；publish 前再跑 `python3 "$SKILLOPS_DIR/scripts/release_gate.py" ./cc-designer --stage publish --json`。兩者以整體 `PASS` 為放行條件。

在繁中 Windows 上，`package_skill.py` 要先設環境變數 `PYTHONUTF8=1`；否則它的子程序輸出以 cp950 解碼失敗，回報 `'NoneType' object has no attribute 'strip'`，這不是 package gate 的判定結果。

回歸測試放在 repo root 的 tests 資料夾，不隨 skill package 發佈。修改 scripts、starter 或 Step 5 的 script tags 後，在 repo root 執行 `node --test tests/artifact_tools.test.mjs`；需要 Node 22 以上、Chrome／Edge／Chromium，以及連到 unpkg.com 的網路。

## Single source of truth

- repo 內層 `cc-designer/` 是 skill package 的唯一真實來源；repo root 只保存 GitHub README、license 與版本控制 metadata
- 各 host（Claude Code / Codex CLI / OpenClaw）若要 wrapper，僅做薄層轉接
- 不要把 SKILL.md 或 references 複製進 host wrapper——會造成漂移

## 外部發佈

- README / release notes / 安裝說明放在 repo root（skill folder 外）
- 目前 repo: `Openclaw-Metis/cc-designer`
- GitHub 首頁使用 repo root `README.md`；內層 `cc-designer/` 不放 README，確保 package format gate 可重跑且無例外
- 安裝時複製的是內層 `cc-designer/`。把整個 repo clone 進 skills 目錄時，host 在根目錄找不到 `SKILL.md`，skill 不會被載入

## Eval workflow

- Approved prompts：`assets/evals/evals.json`
- Release thresholds：`assets/evals/regression_gates.json`
- Deterministic runner：SkillOps Studio 的 `stage_gate.py` / `release_gate.py`；live paired benchmark 需另有可執行模型的 frozen harness，缺少時只可回報未執行，不得宣稱模型品質提升
