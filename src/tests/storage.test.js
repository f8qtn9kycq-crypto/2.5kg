import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SLEEP_VALUES,
  STORAGE_KEYS,
  getAppState,
  getWeightHistory,
  normalizeStoredSleep,
  recordTodayWeight,
  safeGetJSON,
  safeGetNumber,
  safeSetJSON,
  safeSetNumber,
  savePersonalization
} from '../utils/storage.js';
import {
  getBehaviorFeedback,
  getWeeklyCompletionInsight,
  getWeightTrendInsight
} from '../utils/cycleReport.js';

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
  return store;
}

test.afterEach(() => {
  delete globalThis.localStorage;
});

test('valid JSON loads correctly', () => {
  installLocalStorage({ sample: '{"ok":true}' });
  assert.deepEqual(safeGetJSON('sample', {}), { ok: true });
});

test('invalid JSON returns fallback', () => {
  installLocalStorage({ sample: '{bad json' });
  assert.deepEqual(safeGetJSON('sample', { fallback: true }), { fallback: true });
});

test('missing key returns fallback', () => {
  installLocalStorage();
  assert.deepEqual(safeGetJSON('missing', ['fallback']), ['fallback']);
});

test('number key parses correctly', () => {
  installLocalStorage({ weight: '72.5' });
  assert.equal(safeGetNumber('weight', 0), 72.5);
});

test('invalid number returns fallback', () => {
  installLocalStorage({ weight: 'not-a-number' });
  assert.equal(safeGetNumber('weight', 70), 70);
});

test('safe setters write JSON and numbers', () => {
  const store = installLocalStorage();
  assert.equal(safeSetJSON('items', [1, 2]), true);
  assert.equal(safeSetNumber('count', 3), true);
  assert.equal(store.get('items'), '[1,2]');
  assert.equal(store.get('count'), '3');
});

test('savePersonalization does not crash', () => {
  installLocalStorage();
  assert.equal(savePersonalization({
    persona: 'active_aging',
    availableTime: 15,
    fatigue: 'medium',
    sleep: 'between5and7',
    painAreas: ['knee'],
    painLevel: 3,
    coachQuestion: '今天怎麼調整？'
  }), true);
});

test('existing keys are not renamed', () => {
  assert.equal(STORAGE_KEYS.checkedDays, 'phone_diet_checked_days');
  assert.equal(STORAGE_KEYS.startWeight, 'phone_diet_start_w');
  assert.equal(STORAGE_KEYS.targetWeight, 'phone_diet_target_w');
  assert.equal(STORAGE_KEYS.currentWeight, 'phone_diet_curr_w');
  assert.equal(STORAGE_KEYS.theme, 'phone_diet_theme');
  assert.equal(STORAGE_KEYS.persona, 'phone_diet_persona');
  assert.equal(STORAGE_KEYS.availableTime, 'phone_diet_today_time');
  assert.equal(STORAGE_KEYS.fatigue, 'phone_diet_today_fatigue');
  assert.equal(STORAGE_KEYS.sleep, 'phone_diet_today_sleep');
  assert.equal(STORAGE_KEYS.painAreas, 'phone_diet_pain_flags');
  assert.equal(STORAGE_KEYS.painLevel, 'phone_diet_pain_level');
  assert.equal(STORAGE_KEYS.actualWorkouts, 'phone_diet_actual_workouts');
  assert.equal(STORAGE_KEYS.cycleHistory, 'phone_diet_cycle_history');
  assert.equal(STORAGE_KEYS.weightHistory, 'phone_diet_weight_history');
});

test('getAppState safely reads current app storage shape', () => {
  installLocalStorage({
    phone_diet_checked_days: '[1,2,3]',
    phone_diet_start_w: '80',
    phone_diet_target_w: '75',
    phone_diet_curr_w: '78.5',
    phone_diet_today_time: '30',
    phone_diet_today_sleep: 'under5',
    phone_diet_pain_flags: '["shoulder"]',
    phone_diet_actual_workouts: '{"1":{"mode":"full"}}'
  });
  const state = getAppState();
  assert.deepEqual(state.checkedDays, [1, 2, 3]);
  assert.equal(state.startWeight, 80);
  assert.equal(state.targetWeight, 75);
  assert.equal(state.currentWeight, 78.5);
  assert.equal(state.personalization.availableTime, 30);
  assert.equal(state.personalization.sleep, SLEEP_VALUES.under5);
  assert.deepEqual(state.personalization.painAreas, ['shoulder']);
  assert.deepEqual(state.actualWorkouts, { 1: { mode: 'full' } });
  assert.deepEqual(state.weightHistory, []);
});

test('stored sleep values are canonicalized without crashing', () => {
  assert.equal(normalizeStoredSleep('under5'), SLEEP_VALUES.under5);
  assert.equal(normalizeStoredSleep('between5and7'), SLEEP_VALUES.between5and7);
  assert.equal(normalizeStoredSleep('over7'), SLEEP_VALUES.over7);
  assert.equal(normalizeStoredSleep('invalid'), SLEEP_VALUES.between5and7);
});

test('savePersonalization preserves canonical stored sleep strings', () => {
  const store = installLocalStorage();
  assert.equal(savePersonalization({ sleep: 'under5' }), true);
  assert.equal(store.get(STORAGE_KEYS.sleep), SLEEP_VALUES.under5);

  assert.equal(savePersonalization({ sleep: 'not-valid' }), true);
  assert.equal(store.get(STORAGE_KEYS.sleep), SLEEP_VALUES.between5and7);
});

test('weekly completion insight calculates current and previous week delta', () => {
  const insight = getWeeklyCompletionInsight([1, 2, 3, 8, 9, 10, 11, 12], 12);

  assert.equal(insight.currentWeekCount, 5);
  assert.equal(insight.previousWeekCount, 3);
  assert.equal(insight.delta, 2);
  assert.equal(insight.deltaText, '比上週 +2 天');
});

test('weekly completion insight reports insufficient data state', () => {
  const insight = getWeeklyCompletionInsight([1, 2], 3);

  assert.equal(insight.hasEnoughData, false);
  assert.equal(insight.delta, null);
  assert.match(insight.deltaText, /累積資料中/);
});

test('weekly completion insight returns behavior feedback by count', () => {
  assert.equal(getWeeklyCompletionInsight([1, 2], 2).feedback, '這週先以 3 天完成為目標');
  assert.equal(getWeeklyCompletionInsight([1, 2, 3], 3).feedback, '節奏建立中，維持最低有效劑量');
  assert.equal(getWeeklyCompletionInsight([1, 2, 3, 4, 5], 5).feedback, '穩定執行，維持目前節奏');
  assert.equal(getWeeklyCompletionInsight([1, 2, 3, 4, 5, 6, 7], 7).feedback, '完成度很高，下週注意恢復');
});

test('recordTodayWeight appends today weight', () => {
  const store = installLocalStorage();
  const history = recordTodayWeight(64.2, { date: '2026-06-12' });

  assert.deepEqual(history, [{ date: '2026-06-12', weight: 64.2 }]);
  assert.deepEqual(JSON.parse(store.get(STORAGE_KEYS.weightHistory)), history);
});

test('recordTodayWeight updates today weight if already exists', () => {
  installLocalStorage({
    [STORAGE_KEYS.weightHistory]: JSON.stringify([{ date: '2026-06-12', weight: 64.2 }])
  });

  const history = recordTodayWeight(64, { date: '2026-06-12' });

  assert.deepEqual(history, [{ date: '2026-06-12', weight: 64 }]);
});

test('recordTodayWeight uses the local calendar date', () => {
  const store = installLocalStorage();
  const localLateNight = new Date('2026-06-12T00:30:00+08:00');

  const history = recordTodayWeight(64.2, { now: localLateNight });

  assert.deepEqual(history, [{ date: '2026-06-12', weight: 64.2 }]);
  assert.deepEqual(JSON.parse(store.get(STORAGE_KEYS.weightHistory)), history);
});

test('recordTodayWeight keeps max 90 entries', () => {
  const oldHistory = Array.from({ length: 95 }, (_, index) => ({
    date: `2026-03-${String(index + 1).padStart(2, '0')}`,
    weight: 70 - index * 0.1
  }));
  installLocalStorage({
    [STORAGE_KEYS.weightHistory]: JSON.stringify(oldHistory)
  });

  const history = recordTodayWeight(64.2, { date: '2026-06-12' });

  assert.equal(history.length, 90);
  assert.deepEqual(history.at(-1), { date: '2026-06-12', weight: 64.2 });
});

test('recordTodayWeight ignores invalid weights', () => {
  const store = installLocalStorage();

  assert.equal(recordTodayWeight('not-a-number', { date: '2026-06-12' }), null);
  assert.equal(recordTodayWeight(-1, { date: '2026-06-12' }), null);
  assert.equal(store.has(STORAGE_KEYS.weightHistory), false);
});

test('getWeightHistory reads normalized stored history', () => {
  installLocalStorage({
    [STORAGE_KEYS.weightHistory]: JSON.stringify([
      { date: '2026-06-13', weight: '64' },
      { date: 'bad', weight: 63 },
      { date: '2026-06-12', weight: 64.2 }
    ])
  });

  assert.deepEqual(getWeightHistory(), [
    { date: '2026-06-12', weight: 64.2 },
    { date: '2026-06-13', weight: 64 }
  ]);
});

test('weight trend calculates 7-day and 14-day change', () => {
  const insight = getWeightTrendInsight([
    { date: '2026-05-29', weight: 64.8 },
    { date: '2026-06-05', weight: 64.5 },
    { date: '2026-06-12', weight: 64.2 }
  ]);

  assert.equal(insight.sevenDayChange, -0.3);
  assert.equal(insight.fourteenDayChange, -0.6);
  assert.equal(insight.summaryText, '7天 -0.3 kg｜14天 -0.6 kg');
});

test('weight trend reports insufficient data state', () => {
  const insight = getWeightTrendInsight([{ date: '2026-06-12', weight: 64.2 }]);

  assert.equal(insight.hasEnoughData, false);
  assert.equal(insight.summaryText, '資料累積中');
});

test('behavior feedback handles low completion', () => {
  const feedback = getBehaviorFeedback({
    weeklyCompletion: { currentWeekCount: 2 },
    weightTrend: { sevenDayChange: -0.2 }
  });

  assert.equal(feedback, '完成率低：下週先以 3 天完成為目標。');
});

test('behavior feedback handles high completion with downward trend', () => {
  const feedback = getBehaviorFeedback({
    weeklyCompletion: { currentWeekCount: 5 },
    weightTrend: { sevenDayChange: -0.3 }
  });

  assert.equal(feedback, '執行率高，體重穩定下降：維持目前節奏。');
});

test('behavior feedback handles high completion with flat trend', () => {
  const feedback = getBehaviorFeedback({
    weeklyCompletion: { currentWeekCount: 6 },
    weightTrend: { sevenDayChange: 0 }
  });

  assert.equal(feedback, '完成率高但體重無變化：優先檢查週末外食與酒精。');
});

test('behavior feedback handles fast drop warning', () => {
  const feedback = getBehaviorFeedback({
    weeklyCompletion: { currentWeekCount: 5 },
    weightTrend: { sevenDayChange: -1.3 }
  });

  assert.equal(feedback, '體重下降太快：確認蛋白質與恢復是否足夠。');
});
