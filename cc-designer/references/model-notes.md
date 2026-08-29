# Model notes

針對不同 foundation model 的 cc-designer 使用差異。

## GPT-style / Sonnet-style

- 本 skill 的 imperative 步驟、critical rules、Tweaks 協定、React pinned hashes 都已寫得足夠具體，直接照做即可
- 預設 output contract 與 numbered workflow 對這類模型最穩

## Reasoning models（Opus / thinking-mode）

- 重點給「目標、品牌敘事、使用者期待」，讓模型自由決定版面與 motion
- Critical rules 區段仍需硬性遵守
- 不要把 middle-of-the-road visual decisions 寫死；留空間給模型挑 typography / layout

## 多回合拆分（所有模型通用）

複雜 prototype / deck 應拆成五個回合，而不是單一 mega prompt：

1. 探索 + 敘事（資料收集、design observation、敘事文）
2. 骨架 + 早期預覽（v0，含 placeholder）
3. React components + 互動（v1）
4. Tweaks + 變體（v2）
5. 驗證 + 交付（打開瀏覽器、console 檢查、極短交付訊息）

每一回合結束讓使用者確認方向，再進下一回合。單 mega prompt 的失敗率明顯較高——中途方向跑偏就來不及修。

## Token / cost 提醒

- Starter 複製是 filesystem 操作，不會 inflate conversation token
- 但 early preview（Step 4）打開瀏覽器確認時若用 `/browse`，snapshot 會回灌 context；只在必要 checkpoint 用
- 深度 reasoning model（Opus）跑完整 5 回合約 30-60k input tokens；Sonnet-style 約 20-40k
