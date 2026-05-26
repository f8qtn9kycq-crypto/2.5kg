# 📊 數據結構與技術文檔

> 本文檔針對開發者與進階用戶，説明應用程序的內部結構、數據流向與擴展方式。

---

## 1️⃣ 應用架構概覽

```
index.html (單文件應用)
├── HTML 結構
│   ├── 儀表板分頁 (tab-dash)
│   ├── 行動表分頁 (tab-plan)
│   └── 應變紅綠燈分頁 (tab-rules)
├── CSS 樣式 (內嵌 <style>)
│   └── CSS 變數系統 + 響應式設計
└── JavaScript 邏輯 (內嵌 <script>)
    ├── 數據管理 (rawData 陣列)
    ├── UI 渲染 (renderCards 等)
    ├── 狀態管理 (localStorage)
    └── 事件監聽 (onclick 處理)
```

---

## 2️⃣ 數據結構詳解

### 2.1 rawData 陣列結構

```javascript
const rawData = [
    [
        "1",                                    // [0] 日期編號 (String)
        "調整定錨：如實記錄三餐內容與份量",    // [1] 飲食任務
        "暫不安排，觀察無意識進食",            // [2] 心靈任務
        "步行 6,000 步",                        // [3] 動態任務
        "建立基準：記錄起始體重與圍度。"       // [4] 筆記/觀察
    ],
    // ... D2-D60 以此類推
]
```

**字段說明：**
| 索引 | 字段名 | 數據類型 | 示例 | 說明 |
|------|--------|---------|------|------|
| 0 | dayNum | String | "1" | 日期編號 1-60 |
| 1 | dietTask | String | "調整定錨..." | 飲食相關任務 |
| 2 | treatTask | String | "暫不安排..." | 心靈/甜點/酒精管理 |
| 3 | sportTask | String | "步行 6,000 步" | 運動/活動任務 |
| 4 | noteTask | String | "建立基準..." | 周檢視或觀察重點 |

### 2.2 LocalStorage 數據結構

```javascript
// 數據鍵值對

// 1. 已完成天數陣列
{
  key: 'phone_diet_checked_days',
  value: [1, 2, 3, 7, 14, 21, ...],  // JSON Array
  type: 'Array<number>',
  example: '[1,2,3,7,14]'
}

// 2. 起始體重
{
  key: 'phone_diet_start_w',
  value: '75',  // 存儲為字符串
  type: 'String',
  example: '75.0'
}

// 3. 目前體重
{
  key: 'phone_diet_curr_w',
  value: '74',
  type: 'String',
  example: '72.5'
}
```

**讀取示例：**
```javascript
// 讀取已完成天數
const checkedDays = JSON.parse(
  localStorage.getItem('phone_diet_checked_days')
) || [];

// 讀取體重
const startWeight = parseFloat(
  localStorage.getItem('phone_diet_start_w') || '0'
);
const currentWeight = parseFloat(
  localStorage.getItem('phone_diet_curr_w') || '0'
);
```

---

## 3️⃣ 核心函數詳解

### 3.1 分頁切換函數

```javascript
function switchTab(tabId, btn) {
  // 參數：
  // - tabId: 'dash' | 'plan' | 'rules'
  // - btn: DOM 按鈕元素

  // 1. 隱藏所有分頁內容
  document.querySelectorAll('.tab-content')
    .forEach(content => content.classList.remove('active'));

  // 2. 移除所有導覽按鈕的活躍狀態
  document.querySelectorAll('.nav-item')
    .forEach(item => item.classList.remove('active'));

  // 3. 顯示指定分頁
  document.getElementById(`tab-${tabId}`)
    .classList.add('active');

  // 4. 標記當前按鈕為活躍
  btn.classList.add('active');

  // 5. 滾動到頁面頂部
  window.scrollTo(0, 0);
}

// 調用方式：
// switchTab('dash', this)  // this 為按鈕 DOM 元素
```

### 3.2 階段切換函數

```javascript
function switchPhase(phaseNum) {
  // 參數：
  // - phaseNum: 1 | 2 | 3 | 4

  // 1. 更新全局階段變量
  currentPhase = phaseNum;

  // 2. 更新按鈕樣式（只有對應按鈕為 active）
  document.querySelectorAll('.phase-btn').forEach((btn, idx) => {
    if (idx + 1 === phaseNum) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 3. 重新渲染卡片
  renderCards();
}

// 階段與日期映射：
// Phase 1: D1-15   (idx 0-14)
// Phase 2: D16-30  (idx 15-29)
// Phase 3: D31-45  (idx 30-44)
// Phase 4: D46-60  (idx 45-59)
```

### 3.3 卡片渲染函數

```javascript
function renderCards() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';  // 清空舊內容

  // 1. 計算當前階段的開始與結束索引
  const startIdx = (currentPhase - 1) * 15;  // Phase 1: 0, Phase 2: 15...
  const endIdx = startIdx + 15;
  const phaseDays = rawData.slice(startIdx, endIdx);

  // 2. 遍歷該階段的每一天
  phaseDays.forEach(row => {
    const dayNum = parseInt(row[0]);
    const isChecked = checkedDays.includes(dayNum);

    // 3. 建立卡片 DOM
    const card = document.createElement('div');
    card.className = `day-card ${isChecked ? 'completed' : ''}`;
    
    // 4. 生成卡片 HTML
    card.innerHTML = `
      <div class="day-checkbox-wrapper">
        <input type="checkbox" 
               ${isChecked ? 'checked' : ''} 
               onchange="toggleDayCard(${dayNum}, this)">
      </div>
      <div class="day-content">
        <div class="day-header">
          <span class="day-label">Day ${row[0]}</span>
        </div>
        <div class="task-box">
          <span class="task-tag tag-diet">飲食</span>
          <span class="task-text">${row[1]}</span>
        </div>
        <div class="task-box">
          <span class="task-tag tag-treat">心靈</span>
          <span class="task-text">${row[2]}</span>
        </div>
        <div class="task-box">
          <span class="task-tag tag-sport">動態</span>
          <span class="task-text">${row[3]}</span>
        </div>
        <div class="task-box">
          <span class="task-tag tag-note">筆記</span>
          <span class="task-text" style="color:var(--text-light); font-style:italic;">
            ${row[4]}
          </span>
        </div>
      </div>
    `;
    
    // 5. 添加至容器
    container.appendChild(card);
  });
}

// 時間複雜度：O(15) 每次切換階段
// 空間複雜度：O(15) 存儲 15 個卡片 DOM
```

### 3.4 勾選切換函數

```javascript
function toggleDayCard(dayNum, checkbox) {
  // 參數：
  // - dayNum: 日期編號 (1-60)
  // - checkbox: 複選框 DOM 元素

  const card = checkbox.closest('.day-card');

  if (checkbox.checked) {
    // 1. 如果勾選且尚未在列表中，加入
    if (!checkedDays.includes(dayNum)) {
      checkedDays.push(dayNum);
    }
    card.classList.add('completed');  // 卡片變綠色
  } else {
    // 2. 如果取消勾選，從列表移除
    checkedDays = checkedDays.filter(d => d !== dayNum);
    card.classList.remove('completed');  // 卡片恢復白色
  }

  // 3. 保存至 LocalStorage
  localStorage.setItem(
    'phone_diet_checked_days',
    JSON.stringify(checkedDays)
  );

  // 4. 更新進度
  updateProgress();
}
```

### 3.5 進度更新函數

```javascript
function updateProgress() {
  const totalDays = 60;
  const checkedCount = checkedDays.length;
  const percentage = Math.round((checkedCount / totalDays) * 100);

  // 1. 更新天數顯示
  document.getElementById('days-count').innerText = 
    `${checkedCount} / ${totalDays} 天`;

  // 2. 更新進度百分比
  document.getElementById('progress-text').innerText = 
    `${percentage}%`;

  // 3. 更新進度條寬度（CSS transition 平滑動畫）
  document.getElementById('main-progress').style.width = 
    `${percentage}%`;
}

// 計算邏輯：
// 進度 = (已完成天數 / 總天數) × 100%
// 例：15天 / 60天 = 25%
```

### 3.6 體重保存函數

```javascript
function saveMetrics() {
  // 1. 獲取輸入框的值
  const startWeight = document.getElementById('start-weight').value;
  const currentWeight = document.getElementById('current-weight').value;

  // 2. 存儲至 LocalStorage
  localStorage.setItem('phone_diet_start_w', startWeight);
  localStorage.setItem('phone_diet_curr_w', currentWeight);

  // 觸發條件：onchange 事件（用戶編輯輸入框）
}
```

---

## 4️⃣ CSS 變數系統

### 4.1 變數定義

```css
:root {
  /* 顏色變數 */
  --primary: #2563eb;           /* 主色（藍色） */
  --primary-light: #eff6ff;     /* 主色淺色 */
  --success: #10b981;           /* 成功色（綠色） */
  --success-light: #f0fdf4;     /* 成功色淺色 */
  
  /* 背景與文字 */
  --bg: #f8fafc;                /* 頁面背景 */
  --card-bg: #ffffff;           /* 卡片背景 */
  --text: #1e293b;              /* 主文字色 */
  --text-light: #64748b;        /* 輔助文字色 */
  --border: #e2e8f0;            /* 邊框色 */
}
```

### 4.2 使用示例

```css
/* 應用變數 */
.card {
  background: var(--card-bg);      /* 白色卡片 */
  border: 1px solid var(--border); /* 淺灰邊框 */
  color: var(--text);              /* 深灰文字 */
}

.progress-fill {
  background: linear-gradient(90deg, var(--primary), var(--success));
  /* 藍色 → 綠色漸層 */
}
```

### 4.3 快速修改配色

**修改全局主色：**
```css
:root {
  --primary: #7c3aed;  /* 從藍色改為紫色 */
}
/* 所有使用 var(--primary) 的元素自動更新 */
```

---

## 5️⃣ 事件流程圖

### 5.1 應用初始化流程

```
頁面加載
  ↓
執行 <script> 區塊
  ↓
1. 初始化 rawData 陣列（D1-D30 + 自動補完 D31-D60）
  ↓
2. 載入 checkedDays （若無則為 []）
  ↓
3. 載入體重數據（若無則使用預設）
  ↓
4. 執行 renderCards() → 渲染 Phase 1 卡片
  ↓
5. 執行 updateProgress() → 計算進度
  ↓
應用就緒 ✅
```

### 5.2 用戶勾選任務流程

```
用戶點擊複選框
  ↓
觸發 onchange 事件
  ↓
調用 toggleDayCard(dayNum, checkbox)
  ↓
┌─────────────────────────────┐
│ checkbox.checked 是否為 true？ │
└─────────────────────────────┘
     ↙ 是              ↘ 否
更新 checkedDays   從 checkedDays 移除
添加 dayNum         dayNum
     ↓                ↓
localStorage.setItem()
     ↓
updateProgress()
     ↓
進度條與計數器更新 ✅
```

---

## 6️⃣ CSS 樣式層級

### 6.1 樣式優先級

```
特異性：ID > class > element
優先級：
  1. #tab-dash {} (ID)
  2. .tab-content {} (class)
  3. div {} (element)
  4. ::before, ::after (pseudo-element)
```

### 6.2 響應式設計

**行動優先設計：**
```css
/* 基礎（行動設備） */
.container {
  width: 100%;
  max-width: 600px;  /* 行動限寬 */
  padding: 16px;
}

/* 沒有額外的 @media 查詢 = 無縫適配所有尺寸 */
/* 因為最大寬度已設定，大螢幕會自動呈現居中 */
```

### 6.3 關鍵類別

| 類別 | 用途 | 狀態 |
|------|------|------|
| `.active` | 當前活躍分頁/按鈕 | 動態切換 |
| `.completed` | 已完成任務卡片 | 綠色背景 + 刪除線 |
| `.tab-content` | 分頁容器 | display: none/block |
| `.day-card` | 任務卡片 | 基礎樣式 |

---

## 7️⃣ 擴展與自訂

### 7.1 新增自訂任務

**修改 rawData：**
```javascript
const rawData = [
  ["61", "新自訂任務", "新心靈任務", "新運動", "新筆記"],  // 添加 D61
  // ... 繼續
];
```

**更新總天數：**
```javascript
function updateProgress() {
  const totalDays = 90;  // 改為 90 天
  // ... 其餘邏輯不變
}
```

### 7.2 新增階段

**修改 HTML：**
```html
<button class="phase-btn" onclick="switchPhase(5)">
  Phase 5 加強鞏固 (D61-75)
</button>
```

**更新 JavaScript：**
```javascript
// 每階段 15 天的邏輯會自動工作
// 因為使用 (currentPhase - 1) * 15 計算
```

### 7.3 修改配色方案

**方案 A - 直接修改 CSS 變數：**
```html
<style>
  :root {
    --primary: #e11d48;      /* 紅色 */
    --success: #f59e0b;      /* 琥珀色 */
  }
</style>
```

**方案 B - 創建主題類別：**
```css
:root.theme-dark {
  --bg: #1f2937;
  --card-bg: #111827;
  --text: #f3f4f6;
}
```

---

## 8️⃣ 性能最佳實踐

### 8.1 時間複雜度分析

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| renderCards | O(15) | 固定每階段 15 天 |
| switchPhase | O(15) | 重新渲染 15 張卡片 |
| toggleDayCard | O(n) | n = checkedDays 長度（最多 60） |
| updateProgress | O(1) | 常數時間計算 |

### 8.2 空間複雜度

```javascript
// rawData: O(60) - 固定 60 天
// checkedDays: O(60) - 最多 60 天已檢查
// DOM 渲染: O(15) - 同時顯示 15 張卡片
// 總計: O(135) - 完全可接受的行動設備
```

### 8.3 優化建議

**當前状態：** ✅ 已優化
- 無框架開銷
- localStorage 快速讀寫
- DOM 操作最小化
- CSS 動畫使用 transform（GPU 加速）

**未來改進空間：**
```javascript
// 1. 虛擬列表（若天數超過 100）
// 2. Service Worker 離線支持
// 3. IndexedDB 替代 localStorage（容量更大）
```

---

## 9️⃣ 除錯指南

### 9.1 常見問題排查

**問題：進度不更新**
```javascript
// 檢查 checkedDays 是否正確
console.log('Checked Days:', checkedDays);
console.log('localStorage:', 
  localStorage.getItem('phone_diet_checked_days')
);

// 檢查 updateProgress() 是否被調用
// （應在 toggleDayCard 末尾調用）
```

**問題：卡片顯示不出來**
```javascript
// 檢查 renderCards() 是否執行
console.log('Current Phase:', currentPhase);
console.log('Start Index:', (currentPhase - 1) * 15);
console.log('Phase Days:', rawData.slice((currentPhase-1)*15, currentPhase*15));
```

### 9.2 控制台快速命令

```javascript
// 清除所有數據
localStorage.clear();

// 檢視所有存儲的數據
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});

// 強制完成所有 60 天
checkedDays = [...Array(60).keys()].map(i => i + 1);
localStorage.setItem('phone_diet_checked_days', JSON.stringify(checkedDays));
updateProgress();

// 重置進度為某個特定百分比（e.g., 50%）
checkedDays = [...Array(30).keys()].map(i => i + 1);
localStorage.setItem('phone_diet_checked_days', JSON.stringify(checkedDays));
updateProgress();
```

---

## 🔟 技術棧總結

| 層次 | 技術 | 說明 |
|------|------|------|
| **標記** | HTML5 | 語義化結構 |
| **樣式** | CSS3 | CSS 變數、Flexbox、Grid |
| **邏輯** | Vanilla JS | 無依賴、純 JavaScript |
| **存儲** | LocalStorage API | 瀏覽器本地持久化 |
| **部署** | 靜態文件 | 無需後端伺服器 |

---

## 部署指南

### 本地測試
```bash
# 直接打開 index.html
# 在瀏覽器中：file:///path/to/index.html
```

### GitHub Pages 部署
```bash
git push
# 在 Settings → Pages → Source 選擇 main 分支
# 自動發佈至 https://f8qtn9kycq-crypto.github.io/2.5kg
```

### 其他部署選項
- Vercel (推薦，零配置)
- Netlify (推薦，零配置)
- Firebase Hosting
- AWS S3 + CloudFront
- 任何靜態網頁伺服器

---

**版本：** 1.0  
**最後更新：** 2026年5月26日  
**面向用戶：** 開發者、進階用戶
