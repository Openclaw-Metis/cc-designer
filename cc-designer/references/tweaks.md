# Tweaks 協定

Tweaks = 使用者可在成品內切換的變體控制，例如顏色、copy、布局。成品有兩種開啟方式，都要能用：

- **雙擊開啟**（本地 HTML，`window.parent === window`）：沒有 host 工具列，也不會收到 activate 訊息。頁面要自己提供 Tweaks 入口，否則面板永遠打不開。
- **在有 Tweaks toggle 的 host 內預覽**（iframe）：host 送 activate 訊息開關面板，並接手持久化。

## 完整範例（靜態 HTML / deck 可直接用）

放在 inline `<script>` 內，把 defaults 與 `applyTweak` 換成這個作品的值：

```html
<script>
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#A34F30",
  "dark": false
}/*EDITMODE-END*/;

const tweakStorageKey = `tweaks:${location.pathname}`;
const isEmbedded = window.parent !== window;

function readSavedTweaks() {
  try { return JSON.parse(localStorage.getItem(tweakStorageKey)) ?? {}; } catch { return {}; }
}

const currentTweaks = { ...TWEAK_DEFAULTS, ...readSavedTweaks() };

function applyTweak(key, value) {
  if (key === 'accent') document.documentElement.style.setProperty('--accent', value);
  if (key === 'dark') document.body.classList.toggle('dark', value);
}

function setTweak(key, value) {
  currentTweaks[key] = value;
  applyTweak(key, value);
  if (isEmbedded) {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
    return;
  }
  try { localStorage.setItem(tweakStorageKey, JSON.stringify(currentTweaks)); } catch {}
}

const tweaksPanel = document.createElement('div');
tweaksPanel.className = 'tweaks-panel';
tweaksPanel.hidden = true;
tweaksPanel.innerHTML = `
  <strong>Tweaks</strong>
  <label>Accent <input type="color" data-tweak="accent"></label>
  <label><input type="checkbox" data-tweak="dark"> Dark</label>`;

const showTweaksPanel = () => { tweaksPanel.hidden = false; };
const hideTweaksPanel = () => { tweaksPanel.hidden = true; };

function syncTweakInput(input) {
  const value = currentTweaks[input.dataset.tweak];
  if (input.type === 'checkbox') input.checked = value;
  else input.value = value;
}

tweaksPanel.querySelectorAll('[data-tweak]').forEach((input) => {
  syncTweakInput(input);
  input.addEventListener('input', () => {
    setTweak(input.dataset.tweak, input.type === 'checkbox' ? input.checked : input.value);
  });
});

function addTweaksToggle() {
  const toggle = document.createElement('button');
  toggle.className = 'tweaks-toggle';
  toggle.textContent = 'Tweaks';
  toggle.addEventListener('click', () => { tweaksPanel.hidden = !tweaksPanel.hidden; });
  document.body.append(toggle);
}

// 順序很重要：先註冊 listener，再宣告 available。反了的話 host 的 activate 訊息可能先到。
window.addEventListener('message', (event) => {
  if (event.data?.type === '__activate_edit_mode') showTweaksPanel();
  if (event.data?.type === '__deactivate_edit_mode') hideTweaksPanel();
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.append(tweaksPanel);
  Object.entries(currentTweaks).forEach(([key, value]) => applyTweak(key, value));
  if (isEmbedded) window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  else addTweaksToggle();
});
</script>
<style>
  .tweaks-toggle, .tweaks-panel { position: fixed; z-index: 10000; right: 20px; font: 13px/1.4 "Geist", sans-serif; }
  .tweaks-toggle { bottom: 20px; padding: 6px 12px; cursor: pointer; }
  .tweaks-panel { bottom: 60px; display: grid; gap: 8px; padding: 16px; background: rgba(20, 20, 20, 0.92); color: #fff; }
  .tweaks-panel[hidden] { display: none; }
  @media print { .tweaks-toggle, .tweaks-panel { display: none; } }
</style>
```

`verify_artifact.mjs` 會擋下 listener 順序錯誤（`tweaks-order`）、缺少獨立入口（`tweaks-no-standalone`）與不合法的 defaults（`editmode-block`）。

## 預設值用 EDITMODE marker 包裹

host 要在檔案上重寫你的 defaults，需要明確的 JSON 區塊。規則：

- 必須是**合法 JSON**：雙引號 key 與 string，不能用 JS object literal 的 single quote 或 trailing comma
- 整份檔案只能有 **1 個** 這種 block
- 必須在 inline `<script>` 內（不在獨立 `.js` 檔）
- 如果有預設值超過這個 block，或要 runtime 計算，可以用另一個 `const DERIVED = {...}` 但不要給 EDITMODE marker

## Panel 設計

- 標題**必須**叫 `Tweaks`
- 浮動在右下角，或作為 inline handles
- 面板關閉時 controls 完全隱藏，只留一顆小的 Tweaks 入口；列印時入口也隱藏
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

## 預設要附哪些

使用者**沒要求**變體時，也加 2-3 個「有趣的 tweaks」讓使用者看到更多可能性——例如主色、字型、dark mode。

## 多 variant cycling

若使用者要求「同一個 section 的 5 種 variant 輪播」：
- 用 Tweaks 的 `variantIndex: 0`，改值時渲染對應 variant
- 不要開 5 個檔案

## React 版面板

React 類成品沿用上面的 `currentTweaks`、`setTweak` 與 message listener，面板改成 component：

```jsx
function TweaksPanel({ tweaks, onChange }) {
  return (
    <div style={tweaksPanelStyles.root}>
      <h3 style={tweaksPanelStyles.title}>Tweaks</h3>
      <label>
        Primary color
        <input type="color" value={tweaks.accent}
               onChange={(e) => onChange('accent', e.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={tweaks.dark}
               onChange={(e) => onChange('dark', e.target.checked)} />
        Dark mode
      </label>
    </div>
  );
}

const tweaksPanelStyles = {
  root: { position: 'fixed', zIndex: 10000, bottom: 60, right: 20, padding: 16, background: 'rgba(20,20,20,0.92)', color: 'white', fontSize: 13, display: 'grid', gap: 8 },
  title: { margin: 0, fontWeight: 600 },
};
```

注意 `tweaksPanelStyles`（不是 `styles`）——Critical rule 2。
