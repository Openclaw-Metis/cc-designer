# Interactive prototype 子流程

目標：**像真的一樣**——看起來像真產品、點起來像真產品、但只有關鍵 flow 是真的，其他都是精心的 placeholder。

## 何時選 prototype 而不是 deck

- 要展示互動（點擊 → 狀態改變、多步 flow、表單）
- 要 demo 動畫或 hover 行為
- 要 user test flow

## 何時選 canvas 而不是 prototype

- 純視覺探索（多個色彩 / 版面 / icon 組並列比較）→ 用 `design_canvas.jsx`
- 見 `wireframes.md`

## 先決定：React 還是 static HTML？

- **Default 是 static HTML + CSS**——大多數 landing / marketing mock / 淺互動 prototype 不需要 React
- 何時加 React：多步驟 state、form validation、Tweaks panel 邏輯、跨 screen 轉場、動態列表
- 即使決定用 React，仍預設 CDN pinned + Babel inline；不要開 npm / build pipeline

## 骨架（需要 React 時）

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Onboarding Prototype</title>
<!-- 這份是開發入口 index.src.html；交付檔由 inline_jsx.mjs 產生 -->
<!-- Pinned React + Babel -->
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<style>
  body { margin: 0; display: grid; place-content: center; min-height: 100vh; background: #fafaf5; }
</style>
</head>
<body>
<div id="root"></div>

<!-- 共用 primitives -->
<script type="text/babel" src="components.jsx"></script>
<!-- Starter（裝置框） -->
<script type="text/babel" src="ios_frame.jsx"></script>
<!-- 各 screen -->
<script type="text/babel" src="screens.jsx"></script>
<!-- Main App -->
<script type="text/babel" src="app.jsx"></script>

</body>
</html>
```

## 內嵌成交付檔

瀏覽器在 `file://` 會擋下 Babel 讀取外部 JSX 的請求，上面的骨架雙擊後是空白頁。每次改完 JSX，把它內嵌成交付檔：

```bash
node "<skill-root>/scripts/inline_jsx.mjs" index.src.html "Onboarding Prototype.html"
```

驗證與交付的都是輸出檔。`fetch()` 讀本地 JSON 同樣會被 `file://` 擋下，資料直接寫進 JSX。

## 關鍵跨檔規則

所有 `<script type="text/babel">` 共用全域：函式宣告互相看得到，同名的 top-level `const` 不會報錯，後載入的值會靜默蓋掉前者。每個檔案用**檔末 `Object.assign(window, {...})`** 列出對外的 component，公開介面才一眼可見：

```jsx
// components.jsx
function Button({ children, onClick }) { /* ... */ }
function Chip({ label }) { /* ... */ }

Object.assign(window, { Button, Chip });
```

```jsx
// screens.jsx — Button 與 Chip 已在 window 上
function WelcomeScreen({ onNext }) {
  return (
    <div data-screen-label="01 Welcome">
      <h1>Welcome</h1>
      <Button onClick={onNext}>Get started</Button>
    </div>
  );
}

Object.assign(window, { WelcomeScreen });
```

```jsx
// app.jsx
function App() {
  const [step, setStep] = React.useState(0);
  // ...
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

Starter 檔（例如 `ios_frame.jsx`）本身已在檔尾做 `Object.assign(window, {...})`，直接用即可——檢查檔尾就知道它暴露了哪些名字。

## 絕對不要

- 寫 `const styles = {...}`——多檔同名會靜默互蓋。改 `const welcomeStyles = {...}` 或 inline style。
- 加 `type="module"` 到 `<script>`——`file://` 下載不到。
- 單檔 > 1000 行——拆！
- **在 Claude.ai Artifacts iframe 預覽的 prototype** 中用 `scrollIntoView`——host 會被打壞。本地 HTML 直接雙擊打開用 `scrollIntoView` 沒問題。若不確定使用者會在哪裡預覽，預設用 `element.scrollTo()` / `window.scrollTo()` / ref + `getBoundingClientRect` 自算。

## 裝置 / 視窗 frame

為了看起來像真產品，包一層 frame：
- iOS → `ios_frame.jsx`（iOS 26 Liquid Glass）
- Android → `android_frame.jsx`（Material 3）
- 桌機 app → `macos_window.jsx`（macOS Tahoe Liquid Glass）
- 瀏覽器內 → `browser_window.jsx`（Chrome dark）

```jsx
// 從 assets/starters 複製進來，由 Babel 載入
<IOSDevice dark={false} title="Home">
  <WelcomeScreen onNext={handleNext} />
</IOSDevice>
```

不傳 `title` 時沒有 nav bar，children 從機身最頂端開始，內容會壓在狀態列與動態島底下；全出血畫面才這樣用，其他畫面傳 `title`，或自己留 60px 以上的上方留白。

實際可用的 export 請檢查 starter 檔尾的 `Object.assign(window, {...})`。對照 `starter-components.md`：
- ios_frame.jsx：`IOSDevice`、`IOSStatusBar`、`IOSNavBar`、`IOSGlassPill`、`IOSList`、`IOSListRow`、`IOSKeyboard`
- android_frame.jsx：`AndroidDevice`、`AndroidStatusBar`、`AndroidAppBar`、`AndroidListItem`、`AndroidNavBar`、`AndroidKeyboard`
- macos_window.jsx：`MacWindow`、`MacSidebar`、`MacSidebarItem`、`MacSidebarHeader`、`MacToolbar`、`MacTrafficLights`、`MacGlass`
- browser_window.jsx：`ChromeWindow`、`ChromeTabBar`、`ChromeTab`、`ChromeToolbar`、`ChromeTrafficLights`

不要自己畫裝置邊框——starter 做得精細得多（status bar、動態島、Liquid Glass 折射、虛擬鍵盤）。

## 解讀 `<mentioned-element>` blocks

當使用者在預覽 pane 中點擊 / 評論某個 element，harness 會附上 `<mentioned-element>` 描述——有 `react:` 鏈、`dom:` 鏈、`id:`（`data-cc-id="cc-N"` 或 `data-dm-ref="N"`）。

- `data-cc-id` / `data-dm-ref` 是 runtime 臨時屬性，**不在 source**——別在 source 搜
- 用 `react:` 鏈推回你的 component；若還是不清楚，在瀏覽器 devtools 內 eval 確認
- **不要盲猜後就改**——先探再改

## 為了讓使用者能 comment，幫 screen 加 label

每個代表 screen / view 的 element 加 `data-screen-label`：

```jsx
<div data-screen-label="01 Welcome"> ... </div>
<div data-screen-label="02 Permission Ask"> ... </div>
```

1-indexed，match 使用者會講的話。

## Tweaks 加在 prototype 上

Tweaks 讓使用者即時切換變體。典型 prototype 的 tweaks：
- 主色 / accent
- 主 CTA copy
- 動畫 curve（ease-out / linear）
- 要不要加 skip / back 按鈕
- onboarding 步驟數
- `dark` prop 切換（`IOSDevice`、`AndroidDevice` 支援）

細節見 `tweaks.md`。

## 需要 AI 回覆的 prototype

雙擊開啟的 HTML 沒有模型 API，也不該把 API key 寫進頁面。用寫死的 mock 回覆呈現流程，並在 caveats 標明回覆是假的。

## 內容密度

- Mobile hit target 最小 44×44 px
- 別塞太多 section；prototype 要 focus 在關鍵 flow
- 內文用真實語氣、真實長度的 copy；不要 Lorem ipsum
