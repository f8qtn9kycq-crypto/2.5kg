import { exercises } from '../data/exercises.js';
import { getBodyAreaSafetyAdjustments, getSafetyMode } from './safety.js';

const TIME_TO_DURATION = {
  5: 5,
  15: 15,
  30: 30
};

function normalizeTime(value) {
  const parsed = Number(value);
  return TIME_TO_DURATION[parsed] || 15;
}

function hasAllowedEquipment(exercise, equipment) {
  if (!equipment || equipment === 'none') return exercise.equipment.includes('none');
  return exercise.equipment.includes('none') || exercise.equipment.includes(equipment);
}

function isSafeForPainAreas(exercise, painAreas) {
  return !painAreas.some(area => exercise.riskTags.includes(`${area}_restriction`));
}

function findExercise(name, input) {
  const normalizedName = name.toLowerCase();
  const painAreas = Array.isArray(input.painAreas) ? input.painAreas : [];
  const equipment = input.equipment || 'none';

  return exercises.find(exercise => (
    exercise.name === normalizedName &&
    hasAllowedEquipment(exercise, equipment) &&
    isSafeForPainAreas(exercise, painAreas)
  ));
}

function toWorkoutExercise(exercise, sets, reps, notes) {
  return {
    name: exercise.name,
    sets,
    reps,
    notes,
    category: exercise.category
  };
}

function uniqueExercises(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item || seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function buildSafetyNotes(input, safetyMode) {
  const adjustments = getBodyAreaSafetyAdjustments(input.painAreas || []);
  return Array.from(new Set([
    safetyMode.userMessage,
    ...safetyMode.safetyNotes,
    ...adjustments.safetyNotes,
    adjustments.excludedExercises.length > 0
      ? `Avoid: ${adjustments.excludedExercises.join(', ')}.`
      : '',
    adjustments.saferSubstitutions.length > 0
      ? `Safer options: ${adjustments.saferSubstitutions.join(', ')}.`
      : ''
  ].filter(Boolean)));
}

function pickSubstitutionExercises(input, limit = 2) {
  const adjustments = getBodyAreaSafetyAdjustments(input.painAreas || []);
  return adjustments.saferSubstitutions
    .map(name => findExercise(name, input))
    .filter(Boolean)
    .slice(0, limit);
}

export function getEstimatedKcal(workout, input = {}) {
  if (!workout || workout.mode === 'stop' || workout.exercises.length === 0) return null;

  const duration = Number(workout.durationMinutes) || normalizeTime(input.availableTime);
  const baseByDuration = {
    5: 30,
    15: 80,
    30: 145
  };
  const base = baseByDuration[duration] || Math.round(duration * 5);
  const modeMultiplier = {
    normal: 1,
    modified: 0.65,
    recovery: 0.35
  }[workout.mode] || 0.75;
  const fatigueMultiplier = input.fatigue === 'high' ? 0.85 : 1;

  return Math.max(10, Math.round(base * modeMultiplier * fatigueMultiplier));
}

export function getRecoveryWorkout(input = {}) {
  const durationMinutes = Math.min(normalizeTime(input.availableTime), 15);
  const safetyMode = getSafetyMode(input);
  const selected = [
    ['breathing reset', '1', '2-3 minutes', 'Use this to downshift before movement.'],
    ['gentle joint mobility', '1', '3-5 minutes', 'Stay in comfortable range only.'],
    ['easy walk', '1', '5-10 minutes', 'Keep it easy enough to hold a conversation.']
  ].map(([name, sets, reps, notes]) => {
    const exercise = findExercise(name, { ...input, equipment: input.equipment || 'none' });
    return exercise ? toWorkoutExercise(exercise, sets, reps, notes) : null;
  });

  const workout = {
    mode: 'recovery',
    title: 'Recovery mode',
    durationMinutes,
    exercises: uniqueExercises(selected),
    estimatedKcal: null,
    safetyNotes: buildSafetyNotes(input, safetyMode),
    nextAction: 'Keep movement gentle today and prioritize sleep, hydration, and normal meals.'
  };

  return {
    ...workout,
    estimatedKcal: getEstimatedKcal(workout, input)
  };
}

export function getMinimumEffectiveDose(input = {}) {
  const durationMinutes = Math.min(normalizeTime(input.availableTime), 15);
  const safetyMode = getSafetyMode({ ...input, painLevel: input.painLevel ?? 3 });
  const baseNames = ['sit-to-stand', 'incline push-up', 'dead bug', 'easy walk'];
  const substitutions = pickSubstitutionExercises(input, 2);
  const selected = [...substitutions, ...baseNames.map(name => findExercise(name, input))]
    .filter(Boolean)
    .filter(exercise => isSafeForPainAreas(exercise, input.painAreas || []))
    .slice(0, durationMinutes <= 5 ? 3 : 5)
    .map(exercise => toWorkoutExercise(
      exercise,
      '1-2',
      exercise.category === 'walk' ? '3-8 minutes' : '6-10 controlled reps',
      'Use small range, stop if pain increases, and leave effort in reserve.'
    ));

  const workout = {
    mode: 'modified',
    title: 'Minimum effective dose',
    durationMinutes,
    exercises: uniqueExercises(selected),
    estimatedKcal: null,
    safetyNotes: buildSafetyNotes(input, safetyMode),
    nextAction: 'Finish feeling better than when you started; shorter is acceptable today.'
  };

  return {
    ...workout,
    estimatedKcal: getEstimatedKcal(workout, input)
  };
}

function getNormalWorkout(input = {}) {
  const durationMinutes = normalizeTime(input.availableTime);
  const safetyMode = getSafetyMode(input);
  const namesByDuration = {
    5: ['sit-to-stand', 'incline push-up', 'easy walk'],
    15: ['sit-to-stand', 'incline push-up', 'band pull apart', 'dead bug', 'fast walking'],
    30: ['box squat', 'incline push-up', 'neutral-grip pulldown', 'glute bridge', 'farmer carry', 'standing march', 'fast walking']
  };

  const selected = namesByDuration[durationMinutes]
    .map(name => findExercise(name, input))
    .filter(Boolean)
    .filter(exercise => isSafeForPainAreas(exercise, input.painAreas || []))
    .map(exercise => toWorkoutExercise(
      exercise,
      exercise.category === 'walk' ? '1' : '2-3',
      exercise.category === 'walk' ? '8-15 minutes' : '8-12 controlled reps',
      'Keep a conversational pace and avoid chasing exhaustion.'
    ));

  const workout = {
    mode: 'normal',
    title: `${durationMinutes}-minute low-impact workout`,
    durationMinutes,
    exercises: uniqueExercises(selected),
    estimatedKcal: null,
    safetyNotes: buildSafetyNotes(input, safetyMode),
    nextAction: 'Record what you completed and keep tomorrow simple.'
  };

  return {
    ...workout,
    estimatedKcal: getEstimatedKcal(workout, input)
  };
}

export function getWorkoutRecommendation(input = {}) {
  const normalizedInput = {
    availableTime: normalizeTime(input.availableTime),
    painLevel: Number(input.painLevel) || 0,
    painAreas: Array.isArray(input.painAreas) ? input.painAreas : [],
    fatigue: input.fatigue || 'medium',
    sleepHours: input.sleepHours ?? null,
    warningSymptoms: Array.isArray(input.warningSymptoms) ? input.warningSymptoms : [],
    goal: input.goal || 'active_aging',
    equipment: input.equipment || 'none'
  };
  const safetyMode = getSafetyMode(normalizedInput);

  if (safetyMode.mode === 'stop') {
    return {
      mode: 'stop',
      title: 'Stop training today',
      durationMinutes: 0,
      exercises: [],
      estimatedKcal: null,
      safetyNotes: buildSafetyNotes(normalizedInput, safetyMode),
      nextAction: 'Do not train today. Rest and seek qualified support if symptoms are severe, unusual, or worsening.'
    };
  }

  if (safetyMode.mode === 'recovery') {
    return getRecoveryWorkout(normalizedInput);
  }

  if (safetyMode.mode === 'modified') {
    return getMinimumEffectiveDose(normalizedInput);
  }

  return getNormalWorkout(normalizedInput);
}

export default {
  getWorkoutRecommendation,
  getEstimatedKcal,
  getMinimumEffectiveDose,
  getRecoveryWorkout
};
