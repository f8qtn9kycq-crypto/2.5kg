import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBodyAreaSafetyAdjustments,
  getSafetyMode,
  shouldStopWorkout,
  shouldUseRecoveryMode
} from '../utils/safety.js';

test('pain 0 maps to normal mode', () => {
  assert.equal(getSafetyMode({ painLevel: 0 }).mode, 'normal');
});

test('pain 2 maps to normal mode', () => {
  assert.equal(getSafetyMode({ painLevel: 2 }).mode, 'normal');
});

test('pain 3 maps to modified mode', () => {
  assert.equal(getSafetyMode({ painLevel: 3 }).mode, 'modified');
});

test('pain 4 maps to recovery mode', () => {
  assert.equal(getSafetyMode({ painLevel: 4 }).mode, 'recovery');
});

test('pain 6 maps to recovery mode', () => {
  assert.equal(getSafetyMode({ painLevel: 6 }).mode, 'recovery');
});

test('pain 7 maps to stop mode', () => {
  assert.equal(getSafetyMode({ painLevel: 7 }).mode, 'stop');
  assert.equal(shouldStopWorkout({ painLevel: 7 }), true);
});

test('pain 10 maps to stop mode', () => {
  assert.equal(getSafetyMode({ painLevel: 10 }).mode, 'stop');
});

test('warning symptom maps to stop mode', () => {
  const input = { painLevel: 0, warningSymptoms: ['dizziness'] };
  assert.equal(getSafetyMode(input).mode, 'stop');
  assert.equal(shouldStopWorkout(input), true);
});

test('fatigue high maps to recovery mode', () => {
  const input = { painLevel: 0, fatigue: 'high' };
  assert.equal(getSafetyMode(input).mode, 'recovery');
  assert.equal(shouldUseRecoveryMode(input), true);
});

test('sleep under 5 maps to recovery mode', () => {
  const input = { painLevel: 0, sleepHours: 4.5 };
  assert.equal(getSafetyMode(input).mode, 'recovery');
  assert.equal(shouldUseRecoveryMode(input), true);
});

test('shoulder pain returns shoulder exclusions and substitutions', () => {
  const result = getBodyAreaSafetyAdjustments(['shoulder']);
  assert.ok(result.excludedExercises.includes('overhead press'));
  assert.ok(result.excludedExercises.includes('upright row'));
  assert.ok(result.saferSubstitutions.includes('incline push-up'));
  assert.ok(result.saferSubstitutions.includes('neutral-grip pulldown'));
});

test('hip pain returns hip exclusions and substitutions', () => {
  const result = getBodyAreaSafetyAdjustments(['hip']);
  assert.ok(result.excludedExercises.includes('deep squat'));
  assert.ok(result.excludedExercises.includes('mountain climber'));
  assert.ok(result.saferSubstitutions.includes('box squat'));
  assert.ok(result.saferSubstitutions.includes('standing march'));
});

test('knee pain returns knee exclusions and substitutions', () => {
  const result = getBodyAreaSafetyAdjustments(['knee']);
  assert.ok(result.excludedExercises.includes('jump squat'));
  assert.ok(result.excludedExercises.includes('running intervals'));
  assert.ok(result.saferSubstitutions.includes('sit-to-stand'));
  assert.ok(result.saferSubstitutions.includes('bike'));
});

test('back pain returns back exclusions and substitutions', () => {
  const result = getBodyAreaSafetyAdjustments(['back']);
  assert.ok(result.excludedExercises.includes('heavy deadlift'));
  assert.ok(result.excludedExercises.includes('russian twist'));
  assert.ok(result.saferSubstitutions.includes('bird dog'));
  assert.ok(result.saferSubstitutions.includes('pallof press'));
});
