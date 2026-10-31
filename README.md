# cc-designer

在 Claude Code / OpenClaw / 其他具備檔案系統的 coding agent 環境中，用 HTML 直接產出設計成品的 skill。

目前版本：`2026.10.31`

適合的產物：
- slide deck / 簡報
- interactive prototype
- animation / motion demo
- wireframe
- landing page mock
- design canvas

## 特色

- 輸出可直接雙擊開啟的 HTML 檔；React 類成品由 `inline_jsx.mjs` 內嵌 JSX
- 內建 deck、device frame、animation、design canvas starters
- `verify_artifact.mjs` 檢查 critical rules，並用 headless 瀏覽器實際讀 console；看不到 console 時回報 UNVERIFIED，不宣稱通過
- 強調早期半成品、變體探索、可驗證交付
- 預設語言與說明為 zh-TW

## Repo 結構

```text
cc-designer/
├─ README.md
├─ LICENSE
├─ release/
│  ├─ evidence-2026.8.29.json
│  └─ evidence-2026.10.31.json
├─ tests/
│  └─ artifact_tools.test.mjs
└─ cc-designer/
   ├─ SKILL.md
   ├─ skill_lifecycle.yaml
   ├─ policies/
   ├─ scripts/
   ├─ assets/
   │  ├─ evals/
   │  └─ starters/
   └─ references/
```

## 主要內容

- `cc-designer/SKILL.md`: skill 主規格、觸發條件、workflow、tool rules
- `cc-designer/scripts/`: JSX 內嵌與成品驗證工具（Node 22 以上，無第三方相依）
- `cc-designer/assets/starters/`: 可複用的設計起手式元件
- `cc-designer/assets/evals/`: eval 與 regression gate
- `cc-designer/references/`: deck、prototype、animation、wireframe、verification 等補充規範

## 何時用

當使用者要你：
- 「幫我做一份 deck / 簡報」
- 「prototype 一個 flow」
- 「做幾個 wireframe / 視覺方向」
- 「做一個互動 demo / animation」
- 「把內容整理成可展示的 HTML 設計稿」

不適合：
- 正式 production app 開發
- backend / API / database
- Figma / Sketch 原生檔
- 單純 CSS utility 或 framework config 任務

## 安裝

clone repository 後，把**內層** skill package 放到 host 的 skills 目錄。不要把整個 repo clone 進 skills 目錄：host 在根目錄找不到 `SKILL.md`，skill 不會被載入。

```bash
git clone https://github.com/Openclaw-Metis/cc-designer.git
mkdir -p ~/.claude/skills
cp -R cc-designer/cc-designer ~/.claude/skills/cc-designer
```

Codex / Agent Skills 可改用對應目錄：

```bash
mkdir -p ~/.agents/skills
cp -R cc-designer/cc-designer ~/.agents/skills/cc-designer
```

Windows PowerShell：

```powershell
git clone https://github.com/Openclaw-Metis/cc-designer.git
Copy-Item -Recurse cc-designer\cc-designer "$HOME\.claude\skills\cc-designer"
```

驗證工具需要 Node 22 以上與 Chrome、Edge 或 Chromium；缺少時 skill 仍可用，但會回報 console 未驗證。

## 使用方式

把它當成一個「設計產物生成 skill」來呼叫。輸入最好包含其中一種：
- PRD / deck 大綱
- screenshot / reference site
- 現有 UI kit / codebase
- logo、色票、字型等品牌素材

輸出目標應該是：
- 至少 1 份可直接雙擊打開的 HTML
- 有清楚命名
- 驗證工具回 PASS，或明寫未驗證的項目
- 視需要附變體或 tweaks

## 開發

修改 scripts、starter 或 React script tags 後，在 repo root 執行回歸測試：

```bash
node --test tests/artifact_tools.test.mjs
```

## License

MIT
