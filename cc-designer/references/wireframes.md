# Wireframe + design canvas 子流程

兩種「多選項探索」的形式：
- **Wireframe**：低擬真、著重結構與 flow——黑白、placeholder 圖、真實 copy
- **Design canvas**：把多個靜態版本並列在 pan/zoom 畫布上，讓 user 一次比較

## Wireframe

何時用：使用者還沒決定版面、flow 或資訊結構；還不想談顏色與字型。

規則：
- **不用色**——灰階 + 單一 accent（例如藍）
- **不用花俏字型**——系統字或 monospace
- **不放真圖片**——`div` + 標籤 `[Hero image — H2 product photo]`
- **放真實 copy**——草稿寫 30% 的最終 copy；不寫 Lorem
- **標注 annotations**——每個 section 旁邊有一行小字解釋意圖（目的、互動、資料來源）

```html
<section class="wf">
  <header>[Logo] [Nav: Home / Pricing / Docs] [Sign in]</header>
  <aside class="note">頂 nav 靠左 logo、靠右 CTA</aside>
  <main>
    <h1>One-line value prop</h1>
    <p>Supporting line — who it's for, what they get</p>
    <button>Primary CTA</button>
    <a>Secondary</a>
    <aside class="note">hero 用 90vh、CTA 放第一螢</aside>
  </main>
</section>
```

3-5 個方向的 wireframe 通常長這樣：
1. Conservative（照既有 pattern）
2. Content-first（放大 copy、降 UI chrome）
3. Visual-first（大圖 / 大 hero）
4. Dense（一頁解決）
5. Bold / 不尋常（unusual layout、metaphor、反模式）

## Design canvas（並列靜態選項）

何時用：探索顏色、字型、版面、icon 風格、logo variant、wireframe direction——並列一頁好比較，Figma 風 pan/zoom。

用 `assets/starters/design_canvas.jsx`——提供可 pan / 可 zoom 的畫布 + artboards + post-it 註解。

### 互動 vs. 靜態

- 外層 `<DesignCanvas>` 拖曳與縮放都內建：
  - 滑鼠按住拖 → pan
  - `wheel` + `ctrl/cmd` 或 trackpad pinch → zoom
  - `wheel` 單純 → pan
- 父容器要 `position: relative; overflow: hidden`；本 starter 預設給你
- `minScale` / `maxScale` 可調（預設 0.1 ~ 8）

### Component 形狀

```jsx
<DesignCanvas minScale={0.2} maxScale={4}>
  <DCSection title="Hero direction" subtitle="3 個 copy / typography 組合" gap={48}>
    <DCArtboard label="A — warm serif" width={1440} height={900}>
      <HeroA />
    </DCArtboard>
    <DCArtboard label="B — cold mono" width={1440} height={900}>
      <HeroB />
    </DCArtboard>
    <DCArtboard label="C — brutalist" width={1440} height={900}>
      <HeroC />
    </DCArtboard>
  </DCSection>

  <DCPostIt top={200} left={1500} rotate={-3}>
    客戶反饋：想要 B 的 typographic confidence + A 的 warmth
  </DCPostIt>
</DesignCanvas>
```

- `<DCSection>` 給一組 artboard 上標題 + 副標題；多 section 可直接 stack
- `<DCArtboard label width height>` 是單張板；label 會在頂端渲染
- `<DCPostIt top left right bottom rotate width>` 是絕對定位的便利貼，用來放註解

### 沒有 `<Cell>`

舊版 `<Cell>` 已被 `<DCArtboard>` 取代。若看到舊 example 寫 `<Cell label="...">`，換成 `<DCArtboard label="..." width={...} height={...}>` 即可。

### 量

- 至少 3 張 artboard——canvas 的 value 在「同時並列看」
- 單 canvas 上不超過 ~12 張 artboard，否則 zoom 拉遠看不到細節

## 混合：canvas of prototypes

有時使用者要同時比較「多個 onboarding flow 的第一 screen」：
- 用 `DesignCanvas` + 每格放一個 `<IOSDevice>`（或 `<AndroidDevice>`）
- 保持輕量——每格別跑完整 prototype，只 render 關鍵 screen

## 變體命名

不要用「Variant 1 / 2 / 3」——太抽象。用意圖命名：
- 「Warm serif, strong hero」
- 「Mono, minimal chrome」
- 「Split layout, product photo dominant」

## 交付

交一份 HTML，讓使用者選方向；使用者挑定方向後，**再**進 prototype 或 deck 流程——不要一次把 wireframe 與 hi-fi 都交。
