export const STORAGE_KEYS = {
  checkedDays: 'phone_diet_checked_days',
  startWeight: 'phone_diet_start_w',
  targetWeight: 'phone_diet_target_w',
  currentWeight: 'phone_diet_curr_w',
  theme: 'phone_diet_theme',
  persona: 'phone_diet_persona',
  availableTime: 'phone_diet_today_time',
  fatigue: 'phone_diet_today_fatigue',
  sleep: 'phone_diet_today_sleep',
  painAreas: 'phone_diet_pain_flags',
  painLevel: 'phone_diet_pain_level',
  coachQuestion: 'phone_diet_coach_question',
  actualWorkouts: 'phone_diet_actual_workouts',
  cycleHistory: 'phone_diet_cycle_history',
  currentCycleFocus: 'phone_diet_current_cycle_focus',
  weightHistory: 'phone_diet_weight_history'
};

export const SLEEP_VALUES = {
  under5: 'under5',
  between5and7: 'between5and7',
  over7: 'over7'
};

const ALLOWED_SLEEP_VALUES = new Set(Object.values(SLEEP_VALUES));

function getStorage() {
  try {
    return globalThis.localStorage || null;
  } catch (error) {
    return null;
  }
}

export function safeGetJSON(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function safeSetJSON(key, value) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

export function safeGetNumber(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

export function safeSetNumber(key, value) {
  const storage = getStorage();
  if (!storage || !Number.isFinite(Number(value))) return false;

  try {
    storage.setItem(key, String(value));
    return true;
  } catch (error) {
    return false;
  }
}

function safeGetString(key, fallback = '') {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const value = storage.getItem(key);
    return value === null || value === undefined ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function getTodayISODate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeWeightHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map(entry => ({
      date: typeof entry?.date === 'string' ? entry.date.slice(0, 10) : '',
      weight: Number(entry?.weight)
    }))
    .filter(entry => /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && Number.isFinite(entry.weight) && entry.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeightHistory() {
  return normalizeWeightHistory(safeGetJSON(STORAGE_KEYS.weightHistory, []));
}

export function recordTodayWeight(weight, options = {}) {
  const parsedWeight = Number(weight);
  if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) return null;

  const date = typeof options.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(options.date)
    ? options.date
    : getTodayISODate(options.now);
  const existingHistory = Array.isArray(options.history)
    ? options.history
    : safeGetJSON(STORAGE_KEYS.weightHistory, []);
  const withoutToday = normalizeWeightHistory(existingHistory).filter(entry => entry.date !== date);
  const nextHistory = [
    ...withoutToday,
    { date, weight: parsedWeight }
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);

  if (!Array.isArray(options.history)) {
    safeSetJSON(STORAGE_KEYS.weightHistory, nextHistory);
  }

  return nextHistory;
}

export function normalizeStoredSleep(value, fallback = SLEEP_VALUES.between5and7) {
  const normalized = typeof value === 'string' ? value : String(value ?? '');
  return ALLOWED_SLEEP_VALUES.has(normalized) ? normalized : fallback;
}

export function getAppState() {
  return {
    checkedDays: safeGetJSON(STORAGE_KEYS.checkedDays, []),
    startWeight: safeGetNumber(STORAGE_KEYS.startWeight, null),
    targetWeight: safeGetNumber(STORAGE_KEYS.targetWeight, null),
    currentWeight: safeGetNumber(STORAGE_KEYS.currentWeight, null),
    theme: safeGetString(STORAGE_KEYS.theme, 'light'),
    personalization: {
      persona: safeGetString(STORAGE_KEYS.persona, ''),
      availableTime: safeGetNumber(STORAGE_KEYS.availableTime, 15),
      fatigue: safeGetString(STORAGE_KEYS.fatigue, 'medium'),
      sleep: normalizeStoredSleep(safeGetString(STORAGE_KEYS.sleep, SLEEP_VALUES.between5and7)),
      painAreas: safeGetJSON(STORAGE_KEYS.painAreas, ['none']),
      painLevel: safeGetNumber(STORAGE_KEYS.painLevel, 0),
      coachQuestion: safeGetString(STORAGE_KEYS.coachQuestion, '')
    },
    actualWorkouts: safeGetJSON(STORAGE_KEYS.actualWorkouts, {}),
    cycleHistory: safeGetJSON(STORAGE_KEYS.cycleHistory, []),
    currentCycleFocus: safeGetString(STORAGE_KEYS.currentCycleFocus, ''),
    weightHistory: getWeightHistory()
  };
}

export function savePersonalization(input = {}) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    if (input.persona !== undefined && input.persona !== null) {
      storage.setItem(STORAGE_KEYS.persona, String(input.persona));
    }
    if (input.availableTime !== undefined || input.time !== undefined) {
      storage.setItem(STORAGE_KEYS.availableTime, String(input.availableTime ?? input.time));
    }
    if (input.fatigue !== undefined) {
      storage.setItem(STORAGE_KEYS.fatigue, String(input.fatigue));
    }
    if (input.sleep !== undefined) {
      storage.setItem(STORAGE_KEYS.sleep, normalizeStoredSleep(input.sleep));
    }
    if (input.painAreas !== undefined || input.pain !== undefined) {
      storage.setItem(STORAGE_KEYS.painAreas, JSON.stringify(input.painAreas ?? input.pain));
    }
    if (input.painLevel !== undefined) {
      storage.setItem(STORAGE_KEYS.painLevel, String(input.painLevel));
    }
    if (input.coachQuestion !== undefined || input.question !== undefined) {
      storage.setItem(STORAGE_KEYS.coachQuestion, String(input.coachQuestion ?? input.question ?? ''));
    }
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  SLEEP_VALUES,
  safeGetJSON,
  safeSetJSON,
  safeGetNumber,
  safeSetNumber,
  normalizeStoredSleep,
  getWeightHistory,
  recordTodayWeight,
  getAppState,
  savePersonalization
};
