import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STORAGE_KEYS,
  getAppState,
  safeGetJSON,
  safeGetNumber,
  safeSetJSON,
  safeSetNumber,
  savePersonalization
} from '../utils/storage.js';

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
});

test('getAppState safely reads current app storage shape', () => {
  installLocalStorage({
    phone_diet_checked_days: '[1,2,3]',
    phone_diet_start_w: '80',
    phone_diet_target_w: '75',
    phone_diet_curr_w: '78.5',
    phone_diet_today_time: '30',
    phone_diet_pain_flags: '["shoulder"]',
    phone_diet_actual_workouts: '{"1":{"mode":"full"}}'
  });
  const state = getAppState();
  assert.deepEqual(state.checkedDays, [1, 2, 3]);
  assert.equal(state.startWeight, 80);
  assert.equal(state.targetWeight, 75);
  assert.equal(state.currentWeight, 78.5);
  assert.equal(state.personalization.availableTime, 30);
  assert.deepEqual(state.personalization.painAreas, ['shoulder']);
  assert.deepEqual(state.actualWorkouts, { 1: { mode: 'full' } });
});
