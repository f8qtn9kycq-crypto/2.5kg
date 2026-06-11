function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function getCompletedDays(appState) {
  if (Array.isArray(appState.checkedDays)) return appState.checkedDays.length;
  if (Number.isFinite(Number(appState.completedDays))) return Number(appState.completedDays);
  return 0;
}

function getCompletionRate(appState, completedDays) {
  if (Number.isFinite(Number(appState.completionRate))) return clamp01(Number(appState.completionRate));
  const totalDays = Number(appState.totalDays) || 60;
  return clamp01(completedDays / totalDays);
}

function getWeeklyAverageWeightChange(appState) {
  const logs = Array.isArray(appState.weightLogs) ? appState.weightLogs : [];
  if (logs.length < 2) return null;

  const first = logs[0];
  const last = logs[logs.length - 1];
  const firstWeight = toNumber(first.weight);
  const lastWeight = toNumber(last.weight);
  const firstDate = first.date ? new Date(first.date) : null;
  const lastDate = last.date ? new Date(last.date) : null;

  if (firstWeight === null || lastWeight === null || !firstDate || !lastDate) return null;
  const elapsedDays = Math.max((lastDate - firstDate) / 86400000, 1);
  return ((lastWeight - firstWeight) / elapsedDays) * 7;
}

function classifyResult(goalCompletionPercentage, completedDays) {
  if (completedDays < 7) return 'insufficient_data';
  if (goalCompletionPercentage >= 100) return 'goal_achieved';
  if (goalCompletionPercentage >= 70) return 'near_goal';
  return 'not_achieved';
}

function buildSuccessFactors(completionRate, goalCompletionPercentage) {
  const factors = [];
  if (completionRate >= 0.7) factors.push('Consistent daily check-ins');
  if (goalCompletionPercentage >= 70) factors.push('Weight trend moved toward the target');
  if (factors.length === 0) factors.push('Started building repeatable health habits');
  return factors;
}

function buildLimitingFactors(appState, completionRate, goalCompletionPercentage) {
  const personalization = appState.personalization && typeof appState.personalization === 'object'
    ? appState.personalization
    : {};
  const fatigue = appState.fatigue ?? personalization.fatigue;
  const painLevel = appState.painLevel ?? personalization.painLevel;
  const factors = [];
  if (completionRate < 0.5) factors.push('Daily tasks may have been too demanding for the current routine');
  if (goalCompletionPercentage < 70) factors.push('Weight change was slower than the target pace');
  if (fatigue === 'high') factors.push('Fatigue may be limiting recovery and consistency');
  if (Number(painLevel) >= 3) factors.push('Pain or movement limits require a more conservative training plan');
  if (factors.length === 0) factors.push('Keep monitoring sleep, stress, and meal consistency');
  return factors;
}

function suggestNextFocus(classification, completionRate, appState) {
  const personalization = appState.personalization && typeof appState.personalization === 'object'
    ? appState.personalization
    : {};
  const fatigue = appState.fatigue ?? personalization.fatigue;
  const painLevel = appState.painLevel ?? personalization.painLevel;

  if (classification === 'goal_achieved') {
    return 'maintenance_and_strength';
  }
  if (Number(painLevel) >= 3 || fatigue === 'high') {
    return 'recovery_consistency';
  }
  if (completionRate < 0.5) {
    return 'minimum_effective_dose';
  }
  return 'nutrition_anchor_and_low_impact_training';
}

export function generateCycleReport(appState = {}) {
  const startWeight = toNumber(appState.startWeight, null);
  const currentWeight = toNumber(appState.currentWeight, null);
  const targetWeight = toNumber(appState.targetWeight, null);
  const completedDays = getCompletedDays(appState);
  const completionRate = getCompletionRate(appState, completedDays);

  const hasWeightData = startWeight !== null && currentWeight !== null && targetWeight !== null;
  const totalWeightChange = hasWeightData ? currentWeight - startWeight : null;
  const targetChange = hasWeightData ? targetWeight - startWeight : null;
  const progressChange = hasWeightData ? currentWeight - startWeight : null;
  const goalCompletionPercentage = hasWeightData && targetChange !== 0
    ? Math.round(clamp01(progressChange / targetChange) * 100)
    : 0;
  const classification = hasWeightData
    ? classifyResult(goalCompletionPercentage, completedDays)
    : 'insufficient_data';

  return {
    startWeight,
    currentWeight,
    targetWeight,
    totalWeightChange,
    goalCompletionPercentage,
    completedDays,
    completionRate,
    weeklyAverageWeightChange: getWeeklyAverageWeightChange(appState),
    classification,
    successFactors: buildSuccessFactors(completionRate, goalCompletionPercentage),
    limitingFactors: buildLimitingFactors(appState, completionRate, goalCompletionPercentage),
    suggestedNextCycleFocus: suggestNextFocus(classification, completionRate, appState),
    note: 'This report summarizes behavior and progress patterns only. It does not guarantee weight loss or provide medical advice.'
  };
}

export default {
  generateCycleReport
};
