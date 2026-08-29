# Tweaks 協定

Tweaks = 使用者可在 preview 內切換的變體控制。使用者按 toolbar 的 Tweaks toggle 時，你的頁面顯示 tweak panel，讓他改顏色、copy、布局等。

## 核心協定

**順序很重要**：先註冊 listener，**再**宣告 available。反了的話，host 的 activate 訊息可能在 handler 存在前就送達，toggle 變無效。

```js
// 1. 先註冊 listener
window.addEventListener('message', (e) => {
  if (e.data?.type === '__activate_edit_mode')   showTweaksPanel();
  if (e.data?.type === '__deactivate_edit_mode') hideTweaksPanel();
});

// 2. 再宣告 available
window.parent.postMessage({ type: '__edit_mode_available' }, '*');
```

## 更改值時要通知 host 持久化

使用者在 panel 改值時，**同時**：
1. 在頁面即時套用（改 CSS variable、改 state）
2. 通知 parent window 存到 disk：

```js
function applyTweak(key, value) {
  // 即時套用
  if (key === 'primaryColor') document.documentElement.style.setProperty('--accent', value);
  if (key === 'fontSize') document.documentElement.style.setProperty('--base-size', value + 'px');
  if (key === 'dark') document.body.classList.toggle('dark', value);

  // 持久化
  window.parent.postMessage(
    { type: '__edit_mode_set_keys', edits: { [key]: value } },
    '*'
  );
}
```

## 預設值用 EDITMODE marker 包裹

host 要在檔案上重寫你的 defaults，需要明確的 JSON 區塊：

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#8b6cff",
  "fontSize": 16,
  "dark": false,
  "ctaCopy": "Get started",
  "layout": "split"
}/*EDITMODE-END*/;
```

規則：
- 必須是**合法 JSON**：雙引號 key 與 string，不能用 JS object literal 的 single quote 或 trailing comma
- 整份檔案只能有 **1 個** 這種 block
- 必須在 inline `<script>` 內（不在獨立 `.js` 檔）
- 如果有預設值超過這個 block，或要 runtime 計算，可以用另一個 `const DERIVED = {...}` 但不要給 EDITMODE marker

## Panel 設計

- 標題**必須**叫 `Tweaks`（和 toolbar toggle 一致）
- 浮動在右下角，或作為 inline handles
- Tweaks off 時**完全隱藏** controls——final 設計長什麼樣就長什麼樣
- UI 小而精——不要把 panel 變成巨型 dashboard
- 常見 tweakable items：
  - 主色、accent
  - 字型（如果有 2-3 組 style 可切）
  - Dark mode toggle
  - 主 CTA copy
  - Layout variants（如 split / stacked）
  - Feature flags（顯示 / 隱藏某 section）
  - Density（compact / comfortable / spacious）
  - Animation curves

## Tweaks 預設也要附

即使使用者**沒要求**變體，你也應該加 2-3 個「有趣的 tweaks」讓他看到更多可能性——例如主色、字型、dark mode。

## 多 variant cycling

若使用者要求「同一個 section 的 5 種 variant 輪播」：
- 用 Tweaks 的 `variantIndex: 0`，改值時渲染對應 variant
- 不要開 5 個檔案

## Panel sample code

```jsx
function TweaksPanel({ tweaks, setTweaks }) {
  return (
    <div style={tweaksPanelStyles.root}>
      <h3 style={tweaksPanelStyles.title}>Tweaks</h3>
      <label>
        Primary color
        <input type="color" value={tweaks.primaryColor}
               onChange={(e) => setTweaks({ ...tweaks, primaryColor: e.target.value })} />
      </label>
      <label>
        <input type="checkbox" checked={tweaks.dark}
               onChange={(e) => setTweaks({ ...tweaks, dark: e.target.checked })} />
        Dark mode
      </label>
      <label>
        Layout
        <select value={tweaks.layout} onChange={(e) => setTweaks({ ...tweaks, layout: e.target.value })}>
          <option value="split">Split</option>
          <option value="stacked">Stacked</option>
          <option value="centered">Centered</option>
        </select>
      </label>
    </div>
  );
}

const tweaksPanelStyles = {
  root: { position: 'fixed', bottom: 20, right: 20, padding: 16, background: 'rgba(0,0,0,0.85)', color: 'white', borderRadius: 8, fontSize: 12, display: 'grid', gap: 8 },
  title: { margin: 0, fontWeight: 600 },
};
```

注意 `tweaksPanelStyles`（不是 `styles`）——Critical rule。

## 在 Claude Code 本地環境

使用者在 Claude Code CLI 跑本地 HTML 時，parent window 不是 Claude.ai harness——`window.parent` 可能是自己（`window === window.parent`）。這種情況：
- `postMessage` 仍可呼叫但**不會**被 host 接住，檔案不會被 runtime 改寫
- Tweaks 仍能**即時改變視覺**——只是 reload 後會回到 defaults
- 若使用者希望 reload 後保留：在 `applyTweak` 裡同時寫 `localStorage.setItem('tweaks', JSON.stringify(...))`，load 時 restore

Sample：

```js
const saved = JSON.parse(localStorage.getItem('tweaks') || '{}');
const currentTweaks = { ...TWEAK_DEFAULTS, ...saved };

function applyAndPersist(key, value) {
  const next = { ...currentTweaks, [key]: value };
  Object.assign(currentTweaks, next);
  // 即時套用
  applyTweak(key, value);
  // 本地持久化（Claude Code）
  localStorage.setItem('tweaks', JSON.stringify(currentTweaks));
  // Artifact host 持久化（若有 parent）
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
  }
}
```
