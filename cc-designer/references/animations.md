# Animation / motion 子流程

Motion 是設計的一部分——不是裝飾。做動畫時你是 animator，不是 web designer。

## 選動畫工具

優先順序：
1. `assets/starters/animations.jsx` — Stage + Sprite + `PlaybackBar` + Easing + `useTime()` / `useTimeline()` / `useSprite()` + `interpolate()` / `animate()`
2. CSS transitions / React state（簡單 hover、state 變化）
3. Popmotion / Framer Motion 等外部 lib — **只在** starter 真的覆蓋不到時才退回

## Stage + Sprite 模型（starter 提供）

`animations.jsx` 是 JSX，交付前要內嵌，步驟見 `prototypes.md` 的「內嵌成交付檔」。

```jsx
<Stage width={1920} height={1080} duration={6} persistKey="launch-motion">
  <Sprite start={0} end={2}>
    <FadeInTitle />
  </Sprite>

  <Sprite start={1.5} end={4} keepMounted>
    <Subtitle />
  </Sprite>

  <Sprite start={3} end={6}>
    <ProductMock />
  </Sprite>
</Stage>
```

- `<Stage width height duration background fps loop autoplay persistKey>` — 自動 scale、內建 `PlaybackBar`；`loop`、`autoplay` 預設開啟。播放位置會存進 `localStorage`，同一台機器有多支動畫時給各自的 `persistKey`
- `<Sprite start end keepMounted>` — 在 `[start, end]` 秒內渲染；`keepMounted` 讓 sprite 在區段外仍保持掛載（避免 enter 動畫重跑），要不要隱藏由子元件讀 `useSprite().visible` 決定。children 也可以是 `({ localTime, progress }) => ...`
- `<TextSprite>` / `<ImageSprite>` / `<RectSprite>` — 三個便利元件，內建 enter / exit + 位移；props 見各元件定義上方。`TextSprite` 預設字型是 `system-ui`，要傳 `font`
- Hooks：
  - `useTime()` → 目前秒數（數字）
  - `useTimeline()` → `{ time, duration, playing }`
  - `useSprite()` → 本 sprite 的 `localTime`、`progress`（0–1）、`duration`、`visible`
- `interpolate([inputs], [outputs], ease?)` → **curry**，回傳 `(t) => value`；多 keyframe 用這個，`ease` 可傳單一函式或每段一個的陣列
- `animate({ from, to, start, end, ease })` → **curry**，回傳 `(t) => value`；單段 tween，不接受 keyframe 陣列
- `clamp(v, min, max)`
- `Easing`：`linear`、Quad / Cubic / Quart / Expo / Sine 各有 `easeIn*`、`easeOut*`、`easeInOut*`，另有 `easeInBack`、`easeOutBack`、`easeInOutBack`、`easeOutElastic`；**沒有** `Easing.spring`

## 自訂 sprite — 靠 hook + interpolate

```jsx
function FadeInTitle() {
  const { progress } = useSprite()
  const opacity = interpolate([0, 1], [0, 1], Easing.easeOutCubic)(progress)
  const y = interpolate([0, 1], [24, 0], Easing.easeOutCubic)(progress)
  return <h1 style={{ opacity, transform: `translateY(${y}px)` }}>Hello</h1>
}
```

`<Sprite>` 沒有 `enter` / `exit` props——用 `useSprite().progress` 自己組。

## 典型 beats

6 秒動畫的節奏分配：
- 0-1.5s：hero title 出現（fade + slight slide）
- 1-2.5s：subtitle 跟上
- 2-4s：main visual（product mock、flow diagram）
- 4-5.5s：支持論據 / features
- 5.5-6s：CTA / logo / 收尾

## 常見反模式

- 每個 element 都動 → 看起來很亂；只動 1-3 個重點
- 每秒切一次畫面 → 眼睛來不及；一個 moment 至少 0.8-1.5 秒
- 開場直接大爆炸 → 用 ease-out 緩入，不用 ease-in

## 互動 prototype 裡的小動畫

不是完整 motion video，而是按鈕 hover、頁面轉場、loading state：
- CSS transition 就夠：`transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1)`
- 轉場可用 `<CSSTransition>` 或手刻 state-based className
- `scrollIntoView` 在 Claude.ai Artifacts iframe 會干擾 host；本地 HTML 直接用沒問題——若不確定預覽環境，預設用 `element.scrollTo()` 或 `window.scrollTo()`

## 互動 vs 影片

- **影片風格**（video-style HTML）：有 PlaybackBar、可 play/pause、時間軸清楚 → Stage + Sprite
- **互動風格**：使用者觸發才動 → React state + CSS transition
- 混合：用 Stage 做主動畫，由內建 `PlaybackBar` pause / 拖曳到特定時刻看該 frame

## 匯出

- 本 skill 交付可播放的 HTML，不輸出影片檔
- 使用者要 MP4 / GIF 時，交給影片 skill（host 有安裝時）；沒有時建議用瀏覽器錄影錄 Stage 播放
