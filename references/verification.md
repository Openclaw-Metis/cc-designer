# 在 Claude Code 預覽 / 驗證

Claude.ai Artifacts 有 `show_to_user` / `done` / `fork_verifier_agent`；Claude Code CLI 沒有這些。以下是 Claude Code 的對應方法。

## 優先順序

1) **使用者有 gstack `/browse`** → 用它（最好，有 console log、可 eval_js、能截圖）
2) **使用者有系統 open 命令** → `xdg-open` / `open` / `start`
3) **最後**：在對話內告訴使用者「請在檔案管理員打開 `<絕對路徑>`」

## gstack `/browse`（若可用）

使用者 CLAUDE.md 若引入 gstack，可呼叫 `$B`：

```bash
# 打開本地檔案（file:// 需要絕對路徑）
$B goto file:///home/user/design/onboarding-proto/index.html

# 截圖確認版面
$B snapshot --viewport 1440x900 --out /tmp/check.png

# 看 console
$B console

# 執行 JS 驗證
$B eval 'document.querySelectorAll("[data-screen-label]").length'

# deck 驗證（翻頁）
$B key ArrowRight
$B snapshot
```

若 `/browse` 的 `load-html` 可用（gstack 1.1+）：
```bash
$B load-html /home/user/design/onboarding-proto/index.html
```

## `xdg-open` / `open` / `start`

```bash
# Linux
xdg-open /home/user/design/onboarding-proto/index.html

# macOS
open /home/user/design/onboarding-proto/index.html

# Windows（WSL 裡）
cmd.exe /c start file:///C:/Users/.../index.html
```

## 驗證 checklist

開啟後確認：
- [ ] 檔案有被載入（沒 404）
- [ ] console 無 error、無 warning（warning 至少要可解釋）
- [ ] 所有 `<script>` 都 load 成功（check Network tab 或 `$B console`）
- [ ] React / Babel pinned 版本 + integrity 沒被瀏覽器拒絕
- [ ] 主要視覺符合設計敘事
- [ ] 互動可點（prototype）、翻頁可翻（deck）、動畫可播（animation）
- [ ] Tweaks 切換有效（若有）
- [ ] Speaker notes 同步（若 deck + notes）
- [ ] 若在 iframe / Claude.ai Artifacts 預覽：確認無 `scrollIntoView` 干擾 host（本地直接開的 HTML 不受此限；不確定預覽環境就改用 `window.scrollTo()` / `element.scrollTop`）

## 若 console 有錯

修到 clean 再算交付完成。常見錯誤：
- `React is not defined` → script tag 順序錯，或 React UMD 沒成功 load（integrity hash 不對）
- `Unexpected token <` → `.jsx` 被當一般 `.js` 載入，忘加 `type="text/babel"`
- `Cannot read properties of undefined` → component 跨檔共享但沒 `Object.assign(window, ...)`
- `styles is not defined` → 某個檔案用了 `const styles = {}` 被另一檔 overwrite，改成 `<component>Styles`

## 交付前一定要本地預覽過

**不**依賴使用者自己打開才發現錯誤——先驗證再交付。這是 cc-designer 的硬規則。

## 截圖給使用者確認（可選）

若使用者不在終端旁，或想要快速視覺 feedback：

```bash
# gstack
$B snapshot --viewport 1920x1080 --out /home/user/design/onboarding-proto/preview-hero.png

# Playwright / headless-chrome（若有安裝）
# 跳過——設計師不負責 browser CI
```

然後在對話內 Read 這張圖片檢查。
