# DESIGN.md integration

cc-designer 既讀也寫 [DESIGN.md](https://github.com/google-labs-code/design.md)：一份單檔的 design system 規格（YAML token + Markdown 敘事），讓「品牌層」在 sessions 之間持久化，「視覺探索」每次仍然新鮮。

> 這份文件是**單一真實來源**：何時讀、何時寫、欄位語意、lint 整合、版本鎖定都在這。SKILL.md 只引用，不重述。

---

## 為什麼要整合

| 問題 | 沒有 DESIGN.md | 有 DESIGN.md |
|---|---|---|
| 同一品牌跨 session 視覺漂移 | 每次重做的色票 / 字型常會跑掉，因為脈絡只活在 HTML 註解裡 | 開檔就 load token + prose，敘事與 token 都復用 |
| 「探索新方向」與「保持品牌一致」的張力 | 兩件事都壓在 HTML 註解，互相打架 | 品牌層在 DESIGN.md（穩定），deck-level 視覺 thesis 在 HTML 註解（每次新） |
| 對比 / 無障礙錯誤要靠 reviewer 才抓得出來 | 手動估或漏 | `npx @google/design.md lint` 直接吐 JSON，contrast / token 引用 / structural 問題都列 |
| handoff 給 frontend-skill 要重整理 design tokens | 每次都要重抄一份 design system | 直接交一份 DESIGN.md，frontend-skill 拿來轉 Tailwind config / CSS variables |

這套分層對齊既有使用者回饋：每份 deck 可以探索新的視覺方向，但**品牌**應保持穩定。DESIGN.md 把這兩件事拆乾淨，且不依賴特定 host 的外部 memory 路徑。

---

## 何時讀 DESIGN.md

在 cc-designer **Step 1（探索設計脈絡）** 開始就掃：

```
1. cwd 內：./DESIGN.md
2. 上層（最多 3 層）：../DESIGN.md、../../DESIGN.md、../../../DESIGN.md
3. 同名變體（依優先序）：DESIGN.md、design.md、design-system.md、brand.md
```

找到任一份就停止往上找。讀進來後：

- **YAML frontmatter** → 直接拿 colors / typography / spacing / rounded / components 當設計系統的 source of truth；不再問使用者「主色是什麼」
- **Markdown body** → Overview 段落會餵進 Step 2 的設計敘事；Colors / Typography / Components 段落的 prose 解釋每個 token 的「為什麼」與「怎麼用」
- **缺欄位處理**：DESIGN.md 不要求所有 section 齊全。沒寫的部分照舊問或自填，不要 fabricate

讀進來之後，**Step 0 提問跳過**已經被 DESIGN.md 回答的類別（品牌、UI kit、color palette、字型）。剩下的 task-specific 問題（變體數、Tweaks 偏好、deck 頁數）正常問。

---

## 何時寫 DESIGN.md

任何時候你在 **Step 2 寫設計敘事 + Step 3 建資料夾** 階段，且：

- 使用者沒提供 DESIGN.md，但**有提供 brand input**（截圖、UI kit、品牌色 / 字型、參考網站）
- 你即將從那些 input 萃取出 colors / typography / components 寫進 HTML

**那就同步寫一份 DESIGN.md** 進設計資料夾根目錄：

```
design/<project>/
├── DESIGN.md            # ← 新增
├── <Project Name>.html
├── starters/
└── assets/
```

如果使用者**完全沒提供 brand input**且授權「從零開始」：套用 [house-style.DESIGN.md](../assets/house-style.DESIGN.md) 當基底，**複製進設計資料夾**並標註「derived from cc-designer house style — please review」。不要直接 reference skill folder 的路徑（作品要能獨立 run）。

如果使用者**已經提供 DESIGN.md**：
- 原地讀取並沿用，不複製到 `design/<project>/`，也不覆寫既有版本
- HTML 內展開實際 token 值，並在檔案頂端註解記錄來源 DESIGN.md 的相對位置
- 若過程產生新 component 規格（例：deck 新增 callout 樣式），先把建議與影響說明給使用者；只有使用者授權修改既有 design system 時才追加到「Components」section

---

## DESIGN.md 寫作慣例（cc-designer 內用）

對齊上游 spec（alpha 版），但 cc-designer 額外固化幾條：

### Frontmatter 必填

```yaml
---
version: alpha           # 鎖 alpha；spec 升 stable 才動
name: <Project Name>
description: <一句話定位>
colors:
  primary: "#..."
  # 至少 primary；其他依任務需要
typography:
  # 至少 1 個 heading 級 + 1 個 body 級；不到就別硬湊空殼
spacing:                 # 選填，但 deck / landing 強烈建議
  base: 16px
  sm: 8px
  md: 16px
  lg: 32px
rounded:                 # 選填
  sm: 4px
  md: 8px
---
```

### Markdown body 順序（依 spec）

```
## Overview        — 必寫，3-8 句設計敘事
## Colors          — 必寫，每個 token 一行解釋「在哪用、為什麼這個 hex」
## Typography      — 必寫，每個 level 一行解釋「為什麼選這字型 / 字級」
## Layout          — 選填（landing / dashboard 建議寫）
## Elevation & Depth — 選填
## Shapes          — 選填
## Components      — 選填，但若 HTML 內有自定 button / card / chip 樣式就要寫
## Do's and Don'ts — 必寫，最少 3 條 do、3 條 don't（這是 anti-AI-slop 護城河）
```

### Token 命名

- **Color**：`primary` / `secondary` / `tertiary` / `neutral` 為基礎；變體用 `-container` / `-on-` 前綴（如 `on-primary`、`primary-container`），對齊 Material 3 慣例（也是上游 spec 的隱性慣例）
- **Typography**：用語意級別 `display-lg` / `headline-md` / `body-lg` / `label-sm`，**不要**用 `h1` / `h2`（HTML 標籤名與 typography level 是兩回事）
- **Token reference**：`{colors.primary}` 包大括號；只有 components section 內可引用 typography level 整包

### Anti-patterns（cc-designer 不做）

- 不在 DESIGN.md 寫 motion curves / animation timings → 那不在 spec 內，放 HTML 註解或專案的 `MOTION.md`
- 不寫 asset path（logo、icon、字型檔）→ spec 沒這欄位；寫進設計資料夾的 README 或 `ASSETS.md`
- 不寫 i18n / copywriting tone → 用 `BRAND.md` 或 `VOICE.md` 額外開檔
- 不在 Overview 段塞行銷話術；只寫**設計師看了會懂該怎麼決策**的脈絡

---

## Lint 整合（Step 7 verification 加掛）

**Optional dependency**：`@google/design.md@0.1.1`（pin alpha 版本）

**安裝**（使用者授權後才動）：

```bash
npm install -g @google/design.md@0.1.1
```

**執行**：

```bash
npx @google/design.md lint /path/to/design/<project>/DESIGN.md --format json
```

**輸出範例**：

```json
{
  "findings": [
    {
      "severity": "warning",
      "path": "components.button-primary",
      "message": "textColor (#ffffff) on backgroundColor (#1A1C1E) has contrast ratio 15.42:1 — passes WCAG AA."
    },
    {
      "severity": "error",
      "path": "components.callout-quote.backgroundColor",
      "message": "Token reference {colors.accent} not found"
    }
  ],
  "summary": { "errors": 1, "warnings": 1, "info": 0 }
}
```

**處理規則**：

| Severity | cc-designer 反應 |
|---|---|
| `error` | 阻擋交付，回到 Step 6 修；改完重 lint 直到 0 error |
| `warning` | 不阻擋交付，但要在交付訊息的 caveats 點名（例：「Lint 警告：button-secondary 對比 4.2，剛過 AA，可能要再 push」） |
| `info` | 完全不提，太雜訊 |

**Binary 不存在處理**：

- 用 `command -v design.md || npx --no-install @google/design.md --version 2>/dev/null` 偵測
- 沒裝就 graceful skip，**不自動安裝**——在交付訊息提：「Lint 沒跑（@google/design.md 沒裝）。要裝就跑 `npm install -g @google/design.md@0.1.1`」
- 不要 silent skip——使用者要知道少了一道 QA

---

## 版本鎖定理由

上游 spec 標 `version: alpha`，欄位名 / 結構**會變**。cc-designer 鎖 `0.1.1` 的理由：

1. 確保 lint 行為穩定，不會因為 npm `latest` 自動跳版而打壞 cc-designer 的解析邏輯
2. 上游若改 token schema（例：`rounded` 改名 `radius`），cc-designer 要先在 references 同步更新再升級
3. 鎖版本不阻止使用者自己用 `latest`——這只是 skill 內**驗證**用的版本

升級流程（未來 spec 進入 `beta` 或 `stable`）：

1. 讀新版 spec 的 changelog
2. 更新本檔的「DESIGN.md 寫作慣例」section
3. 跑現有 example DESIGN.md 過 lint，確認 0 error
4. 升 pin 版本，更新 quality_checklist.md 加一筆

---

## 與 frontend-skill 的 handoff

當 cc-designer 完成設計、要 handoff 給 frontend-skill 進 production：

```
design/<project>/DESIGN.md    # ← 直接交給 frontend-skill
```

frontend-skill 可以：

- 把 colors / spacing / rounded 轉成 Tailwind theme config
- 把 typography 轉成 CSS `@font-face` + utility classes
- 把 components section 轉成 design tokens JSON 餵 Storybook / Figma

cc-designer 的責任**到** DESIGN.md 為止；不寫 Tailwind config / framework-specific 的轉換。

---

## 與 `/design-consultation` 的關係

| Skill | 角色 |
|---|---|
| `/design-consultation` | 從零幫使用者**規劃**完整 design system（涵蓋 motion、breakpoint、asset 體系），可能輸出多份檔案 |
| `cc-designer` | **使用** design system 做設計成品；DESIGN.md 是它讀寫的單一品牌層 artifact |

如果使用者跑了 `/design-consultation` 拿到一整套 system，cc-designer 期望那 system 的核心會被 export 成 DESIGN.md 放在 repo root；這樣兩個 skill 之間有清楚 contract。

---

## 與既有 SKILL.md workflow 的對應

| Step | 對 DESIGN.md 的動作 |
|---|---|
| Step 0（理解需求） | 在問問題前，先掃 DESIGN.md，避免問已經有答案的問題 |
| Step 1（探索設計脈絡） | 若有 DESIGN.md → load 進來；無 → 走原本流程（讀 codebase / 截圖） |
| Step 2（寫設計敘事） | 把 DESIGN.md Overview prose 當敘事的起點；新發明的 token 暫存等 Step 3 寫進去 |
| Step 3（建資料夾） | 若使用者沒提供 → 寫一份 DESIGN.md 到 `design/<project>/`；已有上層 DESIGN.md → 原地沿用、HTML 展開 token，不複製 |
| Step 7（verification） | 跑 lint；error 阻擋交付，warning 進 caveats |
| Step 8（極短總結） | caveats 提：「DESIGN.md 已建/更新；要不要我順手做 design tokens JSON 給 frontend-skill 用」 |

---

## 失敗模式 & 修法

| 症狀 | 原因 | 修法 |
|---|---|---|
| `lint` 報 `Unknown section heading` | DESIGN.md 用了 spec 沒列的 H2 | spec 說 unknown section 應 preserve 不報錯——若你裝的版本報錯了，可能是版本太新；降回 0.1.1 |
| 同一份 DESIGN.md 第 2 次 load 顏色不一樣 | YAML 用了 unquoted hex（被 parser 當數字 / boolean） | 所有 hex 加雙引號 `"#1A1C1E"` |
| Token reference 顯示為字串 `{colors.primary}` 而不是顏色 | components section 直接吐 string，不會自動 resolve | resolve 要靠下游工具（Tailwind / CSS-in-JS）；cc-designer 在寫 HTML 時手動 expand |
| lint 警告對比剛過 AA（4.5:1±） | 邊界值 | 推到 ≥ 7:1（AAA）比較安全；或保留並在交付訊息明寫 |

---

## 範例

最小可用 DESIGN.md：

```markdown
---
version: alpha
name: Quiet Studio
description: 安靜、書本氣的個人作品集網站
colors:
  primary: "#1F1B17"
  neutral: "#F4EFE8"
  accent: "#A8511A"
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  body-md:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
spacing:
  base: 16px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
rounded:
  sm: 2px
  md: 4px
---

## Overview

像翻一本紙本季刊：寬白邊、長行距、深褐主色。Hero 用大字 display
serif 立刻定調氣質；正文是襯線體強化「被閱讀」的感覺，不是「被滑掉」。
唯一互動色（accent）是窯燒紅磚色，僅用於連結與 CTA，避免氾濫。

## Colors

- **Primary (#1F1B17)**：深咖啡墨色，所有正文與 heading
- **Neutral (#F4EFE8)**：偏暖的米白底，比純白柔和
- **Accent (#A8511A)**：紅磚色，**只**用於連結 hover / 主 CTA / 引文邊條

## Typography

- **display-lg**：Fraunces，hero 與 section 主標
- **body-md**：Source Serif 4，所有正文；行高 1.6 是長文閱讀的甜蜜點

## Do's and Don'ts

**Do**
- 大量留白；section 之間 ≥ 96px gap
- 圖片用 1:1 或 4:5，避免 16:9 那種「投影片感」
- 引文用 italic + accent 邊條

**Don't**
- 不要加 box-shadow——這個 system 沒有 elevation token，全靠對比與留白
- 不要用 sans-serif 寫正文——破壞紙本感
- 不要為了「現代感」加 gradient——這份 system 是 anti-gradient
```

實 lint 一遍：

```bash
npx @google/design.md lint design/quiet-studio/DESIGN.md
# → 0 errors, 0 warnings, 3 info
```

OK，可以交付。

---

## 後續可能擴充（不在當前 scope）

- **`@google/design.md diff` 整合**：cc-designer 改 DESIGN.md 時自動 diff 上一版，把 regression 寫進交付訊息
- **DESIGN.md → speaker notes**：deck workflow 把 Overview / Colors prose 當 speaker notes 的補充素材
- **Spec 升 beta 後**：補上 motion tokens / breakpoint tokens（如果 spec 加了的話）

這些等 spec 穩、實際使用累積夠多痛點再做。
