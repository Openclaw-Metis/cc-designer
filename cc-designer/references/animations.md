# Animation / motion 子流程

Motion 是設計的一部分——不是裝飾。做動畫時你是 animator，不是 web designer。

## 選動畫工具

優先順序：
1. `assets/starters/animations.jsx` — Stage + Sprite + `PlaybackBar` + Easing + `useTime()` / `useSprite()` + `interpolate()` / `animate()`
2. CSS transitions / React state（簡單 hover、state 變化）
3. Popmotion / Framer Motion 等外部 lib — **只在** starter 真的覆蓋不到時才退回

## Stage + Sprite 模型（starter 提供）

```jsx
<Stage width={1920} height={1080} duration={6} autoPlay loop>
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

- `<Stage width height duration autoPlay loop showControls>` — 自動 scale、內建 `PlaybackBar`；可用 `showControls={false}` 收起來
- `<Sprite start end keepMounted>` — 顯示在 `[start, end)` 秒；`keepMounted` 會保留但 opacity=0（避免 enter 動畫重跑）
- `<TextSprite>` / `<ImageSprite>` / `<RectSprite>` — 三個便利元件，內建 enter / exit + 位移；props 見檔案開頭
- Hooks：
  - `useTime()` → 取 Stage 內全域 `time`、`duration`、`playing`
  - `useSprite()` → 本 sprite 的 `localTime`、`progress`（0–1）、`duration`
- `interpolate([inputs], [outputs], easing?)` → **curry**，回傳 `(t) => value`；不是舊版 `interpolate(t, inputs, outputs)`
- `animate([{ at, value, easing }, ...])` → 多 keyframe interpolator
- `Easing`：`linear`、`easeInQuad/OutQuad/InOutQuad`、`easeInCubic/OutCubic/InOutCubic`、`easeInOutQuart/Quint/Sine/Expo`；**沒有** `Easing.spring`

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
- 混合：用 Stage 做主動畫，但有 Tweaks 可 pause / 拖曳到特定時刻看該 frame

## 匯出

- 影片？用瀏覽器 screen recording 錄 Stage 播放
- GIF？同上後 convert（ffmpeg）
- 不做進階 MP4 匯出——這份 skill 不負責影片 encode
