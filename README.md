# 2.5kg 可持續生活化減重工具

60 天台灣使用者友善的生活化減重 Web App。  
核心目標是幫助使用者用低壓力、可持續的日常行為完成 2.5 kg 左右的溫和減重，不走極端節食、不做重度卡路里計算，也不是醫療診斷工具。

## 目前版本重點

- 單頁靜態 Web App，可直接部署到 GitHub Pages
- 60 天行動表，分為 4 個階段
- Persona onboarding：上班久坐型、家庭忙碌型、樂齡維持型、主動健康型
- Persona-aware 動態任務，依使用情境、可用時間、疲勞、疼痛限制調整
- 今日訓練客製化：睡眠、疼痛程度、安全紅綠燈與今日建議
- 建議訓練 vs 實際完成比較，含靜態 kcal 差距
- 60 天結訓報告與下一輪/維持期流程
- Active Aging 安全規則，避免高衝擊與含糊的高風險訓練建議
- AI 顧問提示詞產生器，可複製到 ChatGPT / Gemini / Claude 免費版
- 目標體重、目前體重、完成進度與建議每週速度
- 深色模式、手機 safe-area、localStorage 持久化

## 檔案結構

```text
2.5kg/
├── index.html           # GitHub Pages 部署入口
├── README.md            # 專案說明與部署指南
├── DATA-STRUCTURE.md    # 開發者資料結構說明
├── .nojekyll            # GitHub Pages 靜態檔案直出
└── .gitignore           # 忽略本機備份與 macOS 暫存檔
```

本機保留的 `archived/` 與 `index_v*.html` 是版本快照，不會被提交或部署。

## GitHub Pages 部署

此專案不需要 build step。

1. 確認 `index.html` 在 repo 根目錄。
2. 提交變更：

```bash
git add index.html README.md DATA-STRUCTURE.md .gitignore .nojekyll
git commit -m "Prepare GitHub Pages deployment"
git push origin main
```

3. 到 GitHub repo：
   - `Settings` -> `Pages`
   - `Build and deployment`
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`

4. 發布後網址：

```text
https://f8qtn9kycq-crypto.github.io/2.5kg/
```

## 本機預覽

建議用本機伺服器預覽，行為會比直接打開檔案更接近 GitHub Pages。

```bash
python3 -m http.server 5177
```

然後開啟：

```text
http://localhost:5177/index.html
```

## LocalStorage 鍵值

| Key | 用途 |
| --- | --- |
| `phone_diet_checked_days` | 已完成天數 |
| `phone_diet_start_w` | 起始體重 |
| `phone_diet_curr_w` | 目前體重 |
| `phone_diet_target_w` | 目標體重 |
| `phone_diet_theme` | 深色/淺色模式 |
| `phone_diet_persona` | 使用者 persona |
| `phone_diet_today_time` | 今天可用時間 |
| `phone_diet_today_fatigue` | 今天疲勞程度 |
| `phone_diet_today_sleep` | 今天睡眠狀態 |
| `phone_diet_pain_flags` | 疼痛或限制 |
| `phone_diet_pain_level` | 疼痛程度 0-10 |
| `phone_diet_actual_workouts` | 每日實際訓練完成度與自訂 kcal |
| `phone_diet_cycle_history` | 已完成週期摘要 |
| `phone_diet_current_cycle_focus` | 下一輪或維持期焦點 |
| `phone_diet_coach_question` | AI 顧問問題草稿 |

## 產品邊界

本工具提供一般生活化健康行為建議，不是醫療工具。若使用者有胸悶、頭暈、急性疼痛、慢性病、術後狀況或不確定是否能運動，應先詢問醫師、物理治療師或合格專業人員。

## 技術

- HTML / CSS / Vanilla JavaScript
- 無框架、無後端、無付費 API
- GitHub Pages compatible
- 所有資料只存在使用者瀏覽器 localStorage
