import { getSafetyMode } from './safety.js';
import { getWorkoutRecommendation } from './workout.js';

export const AI_MEDICAL_DISCLAIMER = 'AI advice is informational only and is not medical advice. If pain is above 3/10, symptoms worsen, or red-flag symptoms appear, stop training and consult a qualified medical professional or physical therapist.';

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) return 'none';
  return items.join(', ');
}

function getWeeklyCompletion(appState) {
  if (Number.isFinite(Number(appState.weeklyCompletion))) {
    return `${Math.round(Number(appState.weeklyCompletion) * 100)}%`;
  }
  if (Number.isFinite(Number(appState.weeklyCompletionRate))) {
    return `${Math.round(Number(appState.weeklyCompletionRate) * 100)}%`;
  }
  return 'unknown';
}

function getPersonalization(appState) {
  return appState.personalization && typeof appState.personalization === 'object'
    ? appState.personalization
    : {};
}

function getFirstDefined(...values) {
  return values.find(value => value !== undefined && value !== null && value !== '');
}

function getSleepHours(value) {
  if (value === 'under5') return 4;
  if (value === 'between5and7') return 6;
  if (value === 'over7') return 7.5;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function generateAICoachPrompt(appState = {}) {
  const personalization = getPersonalization(appState);
  const rawSleep = getFirstDefined(appState.sleepHours, personalization.sleepHours, appState.sleep, personalization.sleep);
  const sleepHours = getSleepHours(rawSleep);
  const painAreas = getFirstDefined(
    appState.painAreas,
    appState.pain,
    personalization.painAreas,
    personalization.pain,
    []
  );
  const workoutInput = {
    availableTime: getFirstDefined(appState.availableTime, appState.time, personalization.availableTime, personalization.time, 15),
    painLevel: getFirstDefined(appState.painLevel, personalization.painLevel, 0),
    painAreas: Array.isArray(painAreas) ? painAreas : [],
    fatigue: getFirstDefined(appState.fatigue, personalization.fatigue, 'medium'),
    sleepHours,
    warningSymptoms: getFirstDefined(appState.warningSymptoms, personalization.warningSymptoms, []),
    goal: getFirstDefined(appState.goal, personalization.goal, 'active_aging'),
    equipment: getFirstDefined(appState.equipment, personalization.equipment, 'none')
  };
  const safetyMode = getSafetyMode(workoutInput);
  const workout = appState.workoutRecommendation || getWorkoutRecommendation(workoutInput);
  const exerciseSummary = workout.exercises.length > 0
    ? workout.exercises.map(item => `${item.name}: ${item.sets} x ${item.reps}`).join('; ')
    : 'No workout exercises recommended today.';

  return [
    'You are a safety-first fitness and nutrition coach. Reply in Traditional Chinese with clear, supportive, non-alarming language.',
    '',
    'User context:',
    `- Age range: ${appState.ageRange || 'not provided'}`,
    `- Current weight: ${appState.currentWeight ?? 'not provided'} kg`,
    `- Target weight: ${appState.targetWeight ?? 'not provided'} kg`,
    `- Day progress: ${appState.currentDay || appState.dayProgress || 'unknown'} / ${appState.totalDays || 60}`,
    `- Weekly completion: ${getWeeklyCompletion(appState)}`,
    `- Available time: ${workoutInput.availableTime} minutes`,
    `- Pain level: ${workoutInput.painLevel}/10`,
    `- Pain areas: ${formatList(workoutInput.painAreas)}`,
    `- Fatigue: ${workoutInput.fatigue}`,
    `- Sleep: ${rawSleep || 'not provided'}${sleepHours === null ? '' : ` (${sleepHours} hours used for safety check)`}`,
    `- Safety mode: ${safetyMode.mode} (${safetyMode.label})`,
    `- Workout recommendation: ${workout.title}; ${exerciseSummary}`,
    `- User goal: ${workoutInput.goal}`,
    getFirstDefined(appState.userQuestion, appState.coachQuestion, personalization.coachQuestion)
      ? `- User question: ${getFirstDefined(appState.userQuestion, appState.coachQuestion, personalization.coachQuestion)}`
      : '- User question: Please suggest the safest plan for today.',
    '',
    'Please output:',
    '1. Green / yellow / red training recommendation',
    '2. Specific exercises, sets, reps',
    '3. Pain-safe substitutions',
    '4. Nutrition reminder',
    '5. What to do if pain increases',
    '',
    AI_MEDICAL_DISCLAIMER,
    '',
    'Do not diagnose, promise a cure, recommend extreme dieting, or ask the user to push through pain.'
  ].join('\n');
}

export default {
  generateAICoachPrompt
};
