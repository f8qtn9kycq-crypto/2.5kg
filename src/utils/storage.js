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
  currentCycleFocus: 'phone_diet_current_cycle_focus'
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
    currentCycleFocus: safeGetString(STORAGE_KEYS.currentCycleFocus, '')
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
  getAppState,
  savePersonalization
};
