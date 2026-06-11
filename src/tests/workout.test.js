import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getEstimatedKcal,
  getMinimumEffectiveDose,
  getRecoveryWorkout,
  getWorkoutRecommendation
} from '../utils/workout.js';

function exerciseNames(workout) {
  return workout.exercises.map(exercise => exercise.name);
}

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
