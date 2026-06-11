import assert from 'node:assert/strict';
import test from 'node:test';
import { exercises } from '../data/exercises.js';
import { getAppState } from '../utils/storage.js';
import {
  getEstimatedKcal,
  getMinimumEffectiveDose,
  getRecoveryWorkout,
  getWorkoutRecommendation,
  normalizeWorkoutInputFromAppState
} from '../utils/workout.js';

function exerciseNames(workout) {
  return workout.exercises.map(exercise => exercise.name);
}

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

function getStoredWorkoutState(stored) {
  installLocalStorage(stored);
  const appState = getAppState();
  const input = normalizeWorkoutInputFromAppState(appState);
  const workout = getWorkoutRecommendation(input);

  return { appState, input, workout };
}

test.afterEach(() => {
  delete globalThis.localStorage;
});

test('stop mode returns no exercises', () => {
  const workout = getWorkoutRecommendation({ painLevel: 7, availableTime: 15 });
  assert.equal(workout.mode, 'stop');
  assert.deepEqual(workout.exercises, []);
  assert.equal(workout.estimatedKcal, null);
});

test('recovery mode returns mobility and walk suggestions', () => {
  const workout = getWorkoutRecommendation({ painLevel: 4, availableTime: 15 });
  const names = exerciseNames(workout);
  assert.equal(workout.mode, 'recovery');
  assert.ok(names.includes('gentle joint mobility'));
  assert.ok(names.includes('easy walk'));
});

test('modified mode returns minimum effective dose', () => {
  const workout = getWorkoutRecommendation({ painLevel: 3, availableTime: 15 });
  assert.equal(workout.mode, 'modified');
  assert.equal(workout.title, 'Minimum effective dose');
  assert.ok(workout.exercises.length > 0);
});

test('normal 30-minute mode returns full workout', () => {
  const workout = getWorkoutRecommendation({ painLevel: 0, availableTime: 30, equipment: 'gym' });
  assert.equal(workout.mode, 'normal');
  assert.equal(workout.durationMinutes, 30);
  assert.ok(workout.exercises.length >= 5);
});

test('shoulder pain excludes overhead-style movements', () => {
  const workout = getWorkoutRecommendation({ painLevel: 0, painAreas: ['shoulder'], availableTime: 30, equipment: 'gym' });
  const names = exerciseNames(workout).join(' ');
  assert.equal(workout.mode, 'normal');
  assert.doesNotMatch(names, /overhead press|push press|behind-neck press|upright row|dips|kipping pull-up/);
});

test('hip pain excludes deep flexion movements', () => {
  const workout = getWorkoutRecommendation({ painLevel: 0, painAreas: ['hip'], availableTime: 30, equipment: 'none' });
  const names = exerciseNames(workout).join(' ');
  assert.doesNotMatch(names, /deep squat|deep lunge|high box step-up|sit-up with deep hip flexion|mountain climber/);
});

test('knee pain excludes jump and high-impact movements', () => {
  const workout = getWorkoutRecommendation({ painLevel: 0, painAreas: ['knee'], availableTime: 30, equipment: 'none' });
  const names = exerciseNames(workout).join(' ');
  assert.doesNotMatch(names, /jump squat|burpee|running intervals|deep loaded knee flexion/);
});

test('back pain excludes heavy hinge movements', () => {
  const workout = getWorkoutRecommendation({ painLevel: 0, painAreas: ['back'], availableTime: 30, equipment: 'gym' });
  const names = exerciseNames(workout).join(' ');
  assert.doesNotMatch(names, /heavy deadlift|heavy good morning|high-volume sit-ups|russian twist/);
});

test('estimated kcal returns null or a safe estimate', () => {
  const stopWorkout = getWorkoutRecommendation({ painLevel: 8, availableTime: 15 });
  const normalWorkout = getWorkoutRecommendation({ painLevel: 0, availableTime: 15 });
  assert.equal(getEstimatedKcal(stopWorkout, { availableTime: 15 }), null);
  assert.ok(getEstimatedKcal(normalWorkout, { availableTime: 15 }) > 0);
  assert.ok(getEstimatedKcal(normalWorkout, { availableTime: 15 }) <= 100);
});

test('direct recovery and minimum-dose helpers produce expected modes', () => {
  assert.equal(getRecoveryWorkout({ painLevel: 4, availableTime: 15 }).mode, 'recovery');
  assert.equal(getMinimumEffectiveDose({ painLevel: 3, availableTime: 15 }).mode, 'modified');
});

test('normalizes stored sleep string values to numeric sleep hours', () => {
  const input = normalizeWorkoutInputFromAppState({
    personalization: {
      availableTime: 15,
      sleep: 'under5',
      fatigue: 'low',
      painLevel: 0,
      painAreas: []
    }
  });

  assert.equal(input.sleepHours, 4);
});

test('stored under5 sleep maps to recovery mode through app state adapter', () => {
  const appState = {
    personalization: {
      availableTime: 15,
      painLevel: 0,
      painAreas: [],
      fatigue: 'low',
      sleep: 'under5'
    }
  };

  const input = normalizeWorkoutInputFromAppState(appState);
  const workout = getWorkoutRecommendation(input);

  assert.equal(input.sleepHours, 4);
  assert.equal(workout.mode, 'recovery');
});

test('stored getAppState sleep under5 triggers recovery mode', () => {
  const { input, workout } = getStoredWorkoutState({
    phone_diet_today_time: '15',
    phone_diet_pain_level: '0',
    phone_diet_pain_flags: '[]',
    phone_diet_today_fatigue: 'low',
    phone_diet_today_sleep: 'under5'
  });

  assert.equal(input.sleepHours, 4);
  assert.equal(workout.mode, 'recovery');
  assert.ok(workout.exercises.length > 0);
});

test('stored sleep values map to expected numeric hours', () => {
  const cases = [
    ['between5and7', 6],
    ['over7', 7.5]
  ];

  cases.forEach(([sleep, expectedHours]) => {
    const { input } = getStoredWorkoutState({
      phone_diet_today_time: '15',
      phone_diet_pain_level: '0',
      phone_diet_pain_flags: '[]',
      phone_diet_today_fatigue: 'low',
      phone_diet_today_sleep: sleep
    });

    assert.equal(input.sleepHours, expectedHours);
  });
});

test('stored between5and7 sleep state does not force recovery mode', () => {
  const workout = getWorkoutRecommendation({
    personalization: {
      availableTime: 15,
      sleep: 'between5and7',
      fatigue: 'low',
      painLevel: 0,
      painAreas: []
    }
  });

  assert.equal(workout.mode, 'normal');
});

test('stored pain and fatigue values flow through getAppState adapter', () => {
  const cases = [
    ['3', 'low', 'between5and7', 'modified'],
    ['4', 'low', 'between5and7', 'recovery'],
    ['6', 'low', 'between5and7', 'recovery'],
    ['7', 'low', 'between5and7', 'stop'],
    ['0', 'high', 'between5and7', 'recovery']
  ];

  cases.forEach(([painLevel, fatigue, sleep, expectedMode]) => {
    const { workout } = getStoredWorkoutState({
      phone_diet_today_time: '15',
      phone_diet_pain_level: painLevel,
      phone_diet_pain_flags: '[]',
      phone_diet_today_fatigue: fatigue,
      phone_diet_today_sleep: sleep
    });

    assert.equal(workout.mode, expectedMode);
  });
});

test('warning symptoms return stop mode through app state adapter', () => {
  const input = normalizeWorkoutInputFromAppState({
    availableTime: 15,
    painLevel: 0,
    painAreas: [],
    fatigue: 'low',
    sleep: 'over7',
    warningSymptoms: ['dizziness']
  });
  const workout = getWorkoutRecommendation(input);

  assert.equal(input.warningSymptoms.includes('dizziness'), true);
  assert.equal(workout.mode, 'stop');
  assert.deepEqual(workout.exercises, []);
});

test('pallof press exists for back pain safer substitutions', () => {
  const pallofPress = exercises.find(exercise => exercise.id === 'pallof_press');

  assert.ok(pallofPress);
  assert.equal(pallofPress.name, 'Pallof Press');
  assert.equal(pallofPress.category, 'core');
  assert.ok(pallofPress.substitutionFor.includes('russian twist'));
});

test('stored under5 sleep state triggers recovery mode', () => {
  const workout = getWorkoutRecommendation({
    personalization: {
      availableTime: 15,
      sleep: 'under5',
      fatigue: 'low',
      painLevel: 0,
      painAreas: []
    }
  });

  assert.equal(workout.mode, 'recovery');
  assert.ok(workout.exercises.length > 0);
});
