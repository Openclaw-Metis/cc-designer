# 預覽與驗證

交付前自己驗過，不靠使用者打開才發現錯誤。`open`、`start`、`xdg-open` 只是幫使用者開檔，看不到 console，不算驗證。

## 驗證順序

1. React 類成品先用 `inline_jsx.mjs` 重建交付檔；未內嵌的 `index.src.html` 在 `file://` 一定空白。
2. 對交付檔跑 `verify_artifact.mjs`，把截圖寫到暫存位置。
3. 用 Read 看截圖，確認版面符合設計敘事。
4. 互動類成品實際操作一輪：host 有瀏覽器工具就用它；沒有時在 caveats 寫明互動未實測。

```bash
node "<skill-root>/scripts/verify_artifact.mjs" "Onboarding Prototype.html" --screenshot "<temp-dir>/check.png"
```

選用參數：

| 參數 | 用途 |
|---|---|
| `--viewport 1920x1080` | deck / motion 用 authored size 截圖，預設 `1440x900` |
| `--settle-ms 3000` | 動畫或 Babel 轉譯較久時，延長載入後的等待 |
| `--design-md <path>` | 指定 DESIGN.md；未指定時從成品往上找 3 層 |
| `--browser <path>` | 指定 Chrome、Edge 或 Chromium 執行檔 |
| `--static-only` | 只跑靜態規則，結果是 UNVERIFIED，不可當成通過 |

## 結果處理

| status | 結束碼 | 代表 | 下一步 |
|---|---:|---|---|
| `PASS` | 0 | 靜態規則與 console 都 clean，頁面有內容 | warnings 寫進 caveats，做人工 QA |
| `FAIL` | 1 | 有 error | 修完重跑；FAIL 時不交付 |
| `UNVERIFIED` | 2 | 沒看過 console | 依下一節處理 |

靜態 error 涵蓋 critical rules：`external-jsx-src`、`babel-module`、`unpinned-runtime`、`global-styles-name`、`missing-local-asset`、`local-absolute-path`、`external-asset`、`editmode-block`、`tweaks-order`、`tweaks-no-standalone`、`lorem-ipsum`。

warnings 不阻擋交付，但要在 caveats 提到：`overused-font`、`small-slide-text`、`token-drift`、`scroll-into-view`、`missing-design-comment`、`oversize-source`。規則是 regex 判斷，warning 可能誤判；寫進 caveats 前先看一眼對應位置。

瀏覽器階段另外判定 `blank-render`（載入後沒有可見內容）與 `deck-stage` 的 slide 被其他元素包住。

工具不覆蓋的項目，用人工 QA 補：配色與版面判斷、互動流程是否完整、字型是否真的載入。

## UNVERIFIED 時

`runtime.reason` 會寫原因：

- `node_without_websocket`：Node 低於 22。
- `browser_not_found`：沒有 Chrome、Edge 或 Chromium；有裝在非預設路徑時用 `--browser` 指定。
- `browser_start_failed`：瀏覽器無法啟動，常見於受限的容器環境。

處理順序：

1. 改用 host 的瀏覽器工具（內建瀏覽器、Playwright、gstack `/browse` 等），開 `file:///<絕對路徑>` 並讀 console。
2. 都沒有時交付，訊息第一句寫「console 未驗證」，並把檔案絕對路徑給使用者。

沒有 Node 時 `inline_jsx.mjs` 也無法執行：把各 JSX 的內容手動貼進 `<script type="text/babel">`，依序保持原本載入順序；內容含 `</script` 時寫成 `<\/script`。

## 驗證 checklist

- [ ] 驗證工具回 PASS，或未驗證項目已寫進 caveats
- [ ] 主要視覺符合設計敘事
- [ ] 互動可點（prototype）、翻頁可翻（deck）、動畫可播（animation）
- [ ] Tweaks 從頁面上的入口打得開，切換有效（若有）
- [ ] Speaker notes 同步（若 deck + notes）
- [ ] 要在 iframe 預覽環境展示時，確認沒有 `scrollIntoView`

## 常見 console 錯誤

- `Access to XMLHttpRequest ... blocked by CORS policy`：JSX 還沒內嵌，或頁面用 `fetch()` 讀本地檔；`file://` 不允許這類請求，資料直接寫進頁面。
- `React is not defined`：script tag 順序錯，或 React UMD 沒成功載入（integrity hash 不對）。
- `Unexpected token <`：`.jsx` 被當一般 `.js` 載入，忘加 `type="text/babel"`。
- `X is not defined`：元件在載入順序更後面的檔案才定義；調整 `<script>` 順序。

不會報錯但畫面不對的情況：兩個檔案都宣告 `const styles`，後載入的值會蓋掉前者。靜態規則 `global-styles-name` 會擋下。
