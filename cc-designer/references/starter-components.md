# Starter components 索引

`assets/starters/` 下的 scaffold 元件。**只複製用得到的**——不要整包倒進使用者資料夾。

| Kind | File | Type | 用途 |
|---|---|---|---|
| Slide deck shell | `assets/starters/deck_stage.js` | vanilla web component | 任何 slide 簡報 |
| Timeline animation | `assets/starters/animations.jsx` | React JSX | motion / video-style 動畫 |
| Design canvas | `assets/starters/design_canvas.jsx` | React JSX | 並列 2+ 靜態選項 / 草圖 pin board |
| iOS frame | `assets/starters/ios_frame.jsx` | React JSX | iPhone（iOS 26 Liquid Glass） |
| Android frame | `assets/starters/android_frame.jsx` | React JSX | Android（Material 3） |
| macOS window | `assets/starters/macos_window.jsx` | React JSX | macOS Tahoe Liquid Glass 視窗 |
| Browser window | `assets/starters/browser_window.jsx` | React JSX | Chrome 風格 dark tab bar + toolbar |

## 複製方法（Claude Code）

```bash
# 只複製用得到的 starter。來源 = 這個 skill 自己的 assets/starters/。
# 不同 host 的 skills 目錄各不相同，把 $SKILL_DIR 設成本 skill 載入時回報的根目錄：
SKILL_DIR="<skill-root>"
DEST="./design/onboarding-proto"                # ← 使用者實際專案資料夾（相對 cwd，不要寫死絕對路徑）

cp "$SKILL_DIR/assets/starters/ios_frame.jsx"  "$DEST/"
cp "$SKILL_DIR/assets/starters/deck_stage.js"  "$DEST/"
```

或用 Write 把 starter 內容寫進目標位置（不一定要 cp）。

## 載入

- `.js` → `<script src="deck_stage.js"></script>`（一般 script，雙擊可用）
- `.jsx` → 開發入口用 `<script type="text/babel" src="ios_frame.jsx"></script>`（Babel 轉譯），交付檔必須內嵌，步驟見 `prototypes.md` 的「內嵌成交付檔」

副檔名決定載入方式——**別**用 `.js` 載入 `.jsx` 或反之。

## deck_stage.js — `<deck-stage>` web component

- `<deck-stage>` 做父；每張 slide 是其**直系** `<section>`（中間不能包 `<div>`）
- 自動處理：1920×1080 scaling、鍵盤/點擊/tap 翻頁、按 `R` 重置、localStorage 持久化、列印時還原到 authored size、`slidechange` 事件 → `window.postMessage`
- 不想 auto-scale 時加 `noscale` attribute（例如 landing page）
- 不要自己包 `<div style="transform: scale(...)">`——會打架
- 完整範例見 `decks.md`

## animations.jsx — Stage + Sprite + Playback

導出的 component / function：

- `<Stage width height duration background fps loop autoplay persistKey>` — 動畫容器（內建時間軸 + control bar）
- `<Sprite start end keepMounted>` — 生命週期片段，`keepMounted` 讓 sprite 在區段外仍保持掛載
- `<TextSprite>`、`<ImageSprite>`、`<RectSprite>` — 內建三種常用 sprite
- `<PlaybackBar>` — 自訂控制列（通常不用自己放，Stage 會自己管）
- `useTime()` — 取得目前秒數；`useTimeline()` — 取得 `{ time, duration, playing }`
- `useSprite()` — 在 sprite 內取得 `localTime`、`progress`、`duration`、`visible`
- `interpolate(input, output, ease?)` — curry 版本，回傳 `(t) => value`，支援多 keyframe
- `animate({ from, to, start, end, ease })` — curry 版本的單段 tween
- `clamp(v, min, max)`
- `Easing` — `linear`；Quad / Cubic / Quart / Expo / Sine 的 In、Out、InOut；Back 的 In、Out、InOut；`easeOutElastic`
- **沒有** `Easing.spring`、**沒有** `Sprite` 的 `enter` / `exit` props——用 `useSprite().progress` + `interpolate()` 自己組

完整範例見 `animations.md`。

## design_canvas.jsx — Figma 風 pan/zoom 畫布

- `<DesignCanvas minScale maxScale style>` — 外層畫布，填滿 viewport；trackpad 雙指拖 = pan、pinch = zoom；滑鼠滾輪 = zoom；在底色區塊按左鍵拖或按中鍵拖 = pan
- `<DCSection title subtitle gap>` — 加標題的區塊群組
- `<DCArtboard label width height>` — 單張 artboard（含頂部 label），**取代舊版 `<Cell>`**
- `<DCPostIt top left right bottom rotate width>` — 便利貼式註解，絕對定位
- 完整範例見 `wireframes.md`

## iOS frame（iOS 26 Liquid Glass）

從 `ios_frame.jsx` 匯出：

- `<IOSDevice width height dark title keyboard>` — 整機外框（含 Dynamic Island、status bar、home indicator）；傳 `title` 才有 navbar，不傳時內容從機身頂端開始
- `<IOSStatusBar dark time>`、`<IOSNavBar title dark trailingIcon>`、`<IOSGlassPill>`、`<IOSList header>`、`<IOSListRow title detail icon chevron isLast dark>`、`<IOSKeyboard dark>` — 可單獨使用

## Android frame（Material 3）

從 `android_frame.jsx` 匯出：

- `<AndroidDevice width height dark title large keyboard>` — 整機外框；傳 `title` 才有 app bar
- `<AndroidStatusBar>`、`<AndroidAppBar title large>`、`<AndroidListItem headline supporting leading>`、`<AndroidNavBar>`、`<AndroidKeyboard>`

## macOS window（Tahoe Liquid Glass）

從 `macos_window.jsx` 匯出：

- `<MacWindow width height title sidebar>` — 含 sidebar 的整窗；`sidebar` 傳 sidebar 內容，toolbar 由 `title` 產生
- `<MacSidebar>`、`<MacSidebarHeader title>`、`<MacSidebarItem label selected>`、`<MacToolbar title>`、`<MacTrafficLights>`、`<MacGlass radius dark>`

## Browser window（Chrome 風）

從 `browser_window.jsx` 匯出：

- `<ChromeWindow tabs activeIndex url width height>` — 整窗（含 tab bar + toolbar）
- `<ChromeTabBar>`、`<ChromeTab title active>`、`<ChromeToolbar url>`、`<ChromeTrafficLights>`

## 本 skill 的 starter 取自哪

來自 Claude.ai Artifacts designer 環境的 starter component set，已精簡為 Claude Code filesystem 可直接複製使用的版本。若原版有更新，本 starter 也可能需要同步。

## 新增 starter

若你在 prototype 過程頻繁重建某個 scaffold（例如 `marketing_hero.jsx`、`keyboard_ios.jsx`），可提 PR 或通知 maintainer 加進 `assets/starters/`——這 skill 需要依任務刷新 starter library。
