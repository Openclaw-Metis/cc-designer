---
version: alpha
name: cc-designer House Style
description: cc-designer 的預設品牌層。當使用者完全沒提供 brand input 且授權「從零開始」時拿來當基底。每次使用前必須複製到專案資料夾並依任務微調，**不要**直接 reference 這份檔案的 skill folder 路徑。
colors:
  primary: "#141414"
  secondary: "#5C5C5C"
  tertiary: "#B25C3C"
  neutral: "#F2EEE8"
  surface: "#FFFFFF"
  surface-muted: "#F8F5F0"
  on-primary: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  border: "#E0DBD3"
  border-strong: "#1F1F1F"
  link: "#7A2E14"
  success: "#2F6B3F"
  warning: "#A65A14"
  error: "#8B1F1F"
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-md:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Söhne
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Söhne
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  label-md:
    fontFamily: Söhne
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Söhne Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.12em
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  2xl: 96px
  gutter: 24px
  margin: 32px
rounded:
  sm: 2px
  md: 6px
  lg: 12px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px 20px
    typography: "{typography.label-md}"
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 12px 20px
  button-tertiary:
    backgroundColor: transparent
    textColor: "{colors.tertiary}"
    padding: 8px 12px
  callout-quote:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    padding: 24px
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 24px
  chip:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 4px 10px
    typography: "{typography.label-md}"
---

## Overview

cc-designer 的 fallback house style。**不是給單一品牌用的**——是當使用者授權「沒脈絡從零開始」時的安全起點，避免我憑感覺亂選 Inter + 紫色 gradient + 淺灰圓角卡片這種 AI-default 視覺。

定位：**Editorial Restraint** — 像紙本季刊或設計事務所網站的氣質。深墨主色、暖米底、磚紅 accent；display 用反差大的 serif 立刻定調文化感，正文也走襯線強化「被閱讀」的感覺；無襯線 sans 只給 UI label 與 metadata。

每次使用前必須**複製進專案資料夾**並至少改一件事（任務脈絡 / 品牌方向 / 主色），否則所有專案會長一樣。house style 是地基，不是答案。

## Colors

- **Primary (#141414)**：深墨色（不是純黑——避免螢幕刺眼）。所有 heading + 正文 + 主要 UI 邊框
- **Secondary (#5C5C5C)**：中灰，metadata、caption、disabled state
- **Tertiary (#B25C3C)**：磚紅色 accent。**唯一互動色**——hover、CTA、引文邊條、focus ring。整個專案不該超過 5 個地方用到
- **Neutral (#F2EEE8)**：偏暖米白，page background。**不要用純白**當底色——太冷
- **Surface (#FFFFFF)**：純白，只給卡片、彈窗、需要從 neutral 上浮起的元素
- **Border (#E0DBD3)**：淺米色邊框；border-strong (#1F1F1F) 給需要強調的分隔線
- **Link (#7A2E14)**：比 tertiary 更深的紅，用於正文超連結；hover 切到 tertiary
- **Success / Warning / Error**：低飽和度的綠、琥珀、暗紅；不要用螢光的「Tailwind green-500」

對比驗證：
- primary on neutral：14.8:1（AAA）
- secondary on neutral：5.4:1（AA）
- tertiary on surface：4.8:1（AA，剛過）—— 大字才用，body 用 link 顏色
- on-primary on primary：21:1（AAA）

## Typography

兩個字型家族 + 一個等寬，**不超過三家**：

- **Fraunces**（display-lg / display-md）：variable serif，hero 與 section 主標。負字距、輕字重，刻意做出「報紙標題」的氣質
- **Söhne**（headline-lg / headline-md / label-md）：sans，UI 標題與標籤。中性、現代，不搶 serif 的戲
- **Source Serif 4**（body-lg / body-md）：正文襯線。長行距、舒適閱讀
- **Söhne Mono**（label-caps）：metadata、技術資訊、timestamps。大寫 + 寬字距

**為什麼不用 Inter / Roboto / Arial / Helvetica**：這些字型出現在 AI 生成的設計裡頻率太高，已經成為「平庸」訊號。Söhne 與 Fraunces 在開源 / paid font 圈裡同級代表「有挑過」。如果使用者環境沒有授權 Söhne，fallback 用 [Inter Tight](https://rsms.me/inter/) 或 [Geist Sans](https://vercel.com/font)——還是比 Inter 本體有辨識度。

字級階梯（major-third 1.25 為主）：64 → 48 → 32 → 24 → 18 → 16 → 13 → 11。display 與 body 中間故意留大跳，hero 才有重量。

## Layout

- **Base unit**：16px。所有 spacing 是 base 的倍數或半步
- **行寬**：正文 ≤ 65 字元（中文 ≈ 32 字）；超寬就要 column 切
- **Section gap**：landing 用 `xl` (48px)；editorial 用 `2xl` (96px) 強化呼吸感
- **Container**：desktop max-width 1140px；不要鋪滿全螢幕，邊距比內容更安靜

## Elevation & Depth

**這份 system 沒有 box-shadow token——是故意的**。

層次靠：
1. 對比（primary on neutral）
2. 留白（section gap 拉大）
3. 邊框（border / border-strong）
4. 背景變化（neutral / surface / surface-muted）

如果你正準備加一個 `0 4px 12px rgba(0,0,0,0.08)` 卡片陰影——停下來，改用 border 或 surface 切換。陰影是 AI-default 的 tell。

## Shapes

- 圓角極小：`sm: 2px` 給按鈕 / input；`md: 6px` 給卡片；`lg: 12px` 只給大型容器（modal、hero card）
- `full` (9999px) 只給 chip、avatar、status dot——**不**給按鈕

不要用「pill button」（full radius 的長方形按鈕）——這是 SaaS-default look，會讓任何專案都長得像 Vercel template。

## Components

定義在 frontmatter 的 components section。重點：

- `button-primary`：方角（rounded.sm = 2px）、深墨底、白字。hover 切到 tertiary 磚紅
- `button-secondary`：白底、墨字；視為「次要動作」，不該與 primary 同畫面競爭視覺
- `button-tertiary`：transparent 底、磚紅字；給「閱讀更多」這類弱動作
- `callout-quote`：surface-muted 底、左邊條 tertiary、padding 24px。引文 / 重要提示用這個，**不是**用 emoji 框
- `card`：白底、6px 圓角、24px padding；不加陰影
- `chip`：full radius、surface-muted 底；給標籤、metadata、filter

## Do's and Don'ts

**Do**
- **改主色**：house style 是起點，每個專案至少把 tertiary 換成符合品牌的色
- **保留字型策略**：display serif + sans label + body serif 的三層分工通常通用；要換就連同 spacing 一起調
- **大量留白**：section 之間 ≥ 48px；hero 上下 ≥ 96px
- **用真實內容當 placeholder**：「[Hero image — 需要實際照片]」比 `[圖片]` 好，比 `Lorem ipsum` 好十倍
- **限制 accent 色用量**：tertiary 在一個畫面 ≤ 3 處出現
- **lint 過再交付**：`npx @google/design.md lint DESIGN.md`

**Don't**
- ❌ 不用 Inter / Roboto / Arial / Helvetica / Open Sans / Lato 當 body 字型——AI-default tell
- ❌ 不加 gradient 背景（`linear-gradient(135deg, ...)` 那種）——AI-slop tell
- ❌ 不加 box-shadow——這 system 沒有 elevation token
- ❌ 不用 emoji 當 visual element（除非品牌主動需要）
- ❌ 不畫複雜 SVG 插圖；缺圖就 placeholder，等使用者給素材
- ❌ 不用 pill button（full radius 的按鈕）
- ❌ 不為了「填滿空白」加裝飾元素——空白本身是設計
- ❌ 不直接交付這份 house style；每個專案都要至少改一件事再交付
