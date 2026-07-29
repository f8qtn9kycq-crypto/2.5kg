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

function uniquePlanDays(checkedDays) {
  if (!Array.isArray(checkedDays)) return [];

  return [...new Set(
    checkedDays
      .map(day => Number(day))
      .filter(day => Number.isInteger(day) && day >= 1 && day <= 60)
  )].sort((a, b) => a - b);
}

function inferCurrentPlanDay(days, currentDay) {
  if (Number.isInteger(Number(currentDay)) && Number(currentDay) >= 1) {
    return Math.min(Number(currentDay), 60);
  }

  if (days.length === 0) return 1;
  return Math.min(Math.max(days[days.length - 1] + 1, 1), 60);
}

function getWeeklyFeedback(count) {
  if (count <= 2) return '這週先以 3 天完成為目標';
  if (count <= 4) return '節奏建立中，維持最低有效劑量';
  if (count <= 6) return '穩定執行，維持目前節奏';
  return '完成度很高，下週注意恢復';
}

function formatDelta(delta) {
  if (delta === null || delta === undefined) return '累積資料中';
  if (delta > 0) return `比上週 +${delta} 天`;
  if (delta < 0) return `比上週 ${delta} 天`;
  return '和上週一樣';
}

export function getWeeklyCompletionInsight(checkedDays = [], currentDay) {
  const days = uniquePlanDays(checkedDays);
  const planDay = inferCurrentPlanDay(days, currentDay);
  const weekStart = Math.floor((planDay - 1) / 7) * 7 + 1;
  const weekEnd = Math.min(weekStart + 6, 60);
  const previousWeekStart = weekStart - 7;
  const previousWeekEnd = weekStart - 1;
  const currentWeekCount = days.filter(day => day >= weekStart && day <= weekEnd).length;
  const previousWeekCount = previousWeekStart >= 1
    ? days.filter(day => day >= previousWeekStart && day <= previousWeekEnd).length
    : 0;
  const hasEnoughData = days.length >= 3;
  const delta = hasEnoughData && previousWeekStart >= 1
    ? currentWeekCount - previousWeekCount
    : null;

  return {
    currentDay: planDay,
    weekStart,
    weekEnd,
    currentWeekCount,
    previousWeekCount,
    delta,
    hasEnoughData,
    summaryText: `本週完成 ${currentWeekCount} / ${weekEnd - weekStart + 1} 天`,
    deltaText: hasEnoughData ? formatDelta(delta) : `累積資料中，完成 3 天後會顯示週趨勢`,
    feedback: getWeeklyFeedback(currentWeekCount)
  };
}

function normalizeWeightHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .map(entry => ({
      date: typeof entry?.date === 'string' ? entry.date.slice(0, 10) : '',
      weight: Number(entry?.weight)
    }))
    .filter(entry => /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && Number.isFinite(entry.weight) && entry.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function daysBetween(startDate, endDate) {
  return Math.round((endDate - startDate) / 86400000);
}

function getChangeForWindow(history, days) {
  if (history.length < 2) return null;

  const latest = history[history.length - 1];
  const latestDate = new Date(`${latest.date}T00:00:00Z`);
  const baseline = [...history]
    .reverse()
    .find(entry => daysBetween(new Date(`${entry.date}T00:00:00Z`), latestDate) >= days);

  if (!baseline) return null;
  return Number((latest.weight - baseline.weight).toFixed(1));
}

function formatWeightChange(change) {
  if (change === null || change === undefined) return '資料累積中';
  if (change > 0) return `+${change.toFixed(1)} kg`;
  if (change < 0) return `${change.toFixed(1)} kg`;
  return '0.0 kg';
}

export function getWeightTrendInsight(weightHistory = []) {
  const history = normalizeWeightHistory(weightHistory);
  const sevenDayChange = getChangeForWindow(history, 7);
  const fourteenDayChange = getChangeForWindow(history, 14);
  const hasEnoughData = sevenDayChange !== null || fourteenDayChange !== null;

  return {
    history,
    hasEnoughData,
    sevenDayChange,
    fourteenDayChange,
    sevenDayText: formatWeightChange(sevenDayChange),
    fourteenDayText: formatWeightChange(fourteenDayChange),
    summaryText: hasEnoughData
      ? `7天 ${formatWeightChange(sevenDayChange)}｜14天 ${formatWeightChange(fourteenDayChange)}`
      : '資料累積中'
  };
}

export function getBehaviorFeedback({ weeklyCompletion = {}, weightTrend = {} } = {}) {
  const currentWeekCount = Number(weeklyCompletion.currentWeekCount ?? weeklyCompletion.completedDays ?? 0);
  const sevenDayChange = Number.isFinite(Number(weightTrend.sevenDayChange))
    ? Number(weightTrend.sevenDayChange)
    : null;
  const fourteenDayChange = Number.isFinite(Number(weightTrend.fourteenDayChange))
    ? Number(weightTrend.fourteenDayChange)
    : null;
  const availableTrend = sevenDayChange ?? fourteenDayChange;

  if (currentWeekCount <= 2) {
    return '完成率低：下週先以 3 天完成為目標。';
  }
  if (availableTrend !== null && availableTrend <= -1.2) {
    return '體重下降太快：確認蛋白質與恢復是否足夠。';
  }
  if (currentWeekCount >= 5 && availableTrend !== null && availableTrend < -0.1) {
    return '執行率高，體重穩定下降：維持目前節奏。';
  }
  if (currentWeekCount >= 5 && (availableTrend === null || Math.abs(availableTrend) <= 0.1)) {
    return '完成率高但體重無變化：優先檢查週末外食與酒精。';
  }
  if (currentWeekCount <= 4) {
    return '節奏建立中：維持最低有效劑量。';
  }
  return '維持目前節奏。';
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
  generateCycleReport,
  getWeeklyCompletionInsight,
  getWeightTrendInsight,
  getBehaviorFeedback
};
