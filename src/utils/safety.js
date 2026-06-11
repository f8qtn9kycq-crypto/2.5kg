export const WARNING_SYMPTOMS = [
  'chest_pain',
  'dizziness',
  'shortness_of_breath',
  'acute_joint_pain',
  'numbness',
  'weakness',
  'recent_fall',
  'fever',
  'unable_to_bear_weight',
  'joint_deformity',
  'swelling_warmth_redness'
];

export const BODY_AREA_SAFETY_RULES = {
  shoulder: {
    excludedExercises: [
      'overhead press',
      'push press',
      'behind-neck press',
      'upright row',
      'dips',
      'kipping pull-up'
    ],
    saferSubstitutions: [
      'incline push-up',
      'elevated push-up',
      'band pull apart',
      'scaption raise',
      'neutral-grip pulldown'
    ],
    note: 'Keep shoulder work below painful range and avoid aggressive overhead loading.'
  },
  hip: {
    excludedExercises: [
      'deep squat',
      'deep lunge',
      'high box step-up',
      'sit-up with deep hip flexion',
      'mountain climber'
    ],
    saferSubstitutions: [
      'box squat',
      'short-range split squat',
      'dead bug',
      'standing march',
      'glute bridge'
    ],
    note: 'Use shorter ranges and avoid deep hip flexion when symptoms are present.'
  },
  knee: {
    excludedExercises: [
      'jump squat',
      'burpee',
      'running intervals',
      'deep loaded knee flexion'
    ],
    saferSubstitutions: [
      'sit-to-stand',
      'fast walking',
      'partial squat',
      'bike'
    ],
    note: 'Prefer low-impact movement and shallow knee bend.'
  },
  back: {
    excludedExercises: [
      'heavy deadlift',
      'heavy good morning',
      'high-volume sit-ups',
      'russian twist'
    ],
    saferSubstitutions: [
      'bird dog',
      'dead bug',
      'glute bridge',
      'farmer carry',
      'pallof press'
    ],
    note: 'Avoid heavy hinging and high-volume spinal flexion or twisting.'
  }
};

function normalizePainLevel(painLevel) {
  const parsed = Number(painLevel);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(Math.round(parsed), 0), 10);
}

function normalizePainAreas(painAreas) {
  if (!Array.isArray(painAreas)) return [];
  return Array.from(new Set(painAreas.filter(Boolean).map(area => String(area).trim())));
}

function normalizeWarningSymptoms(warningSymptoms) {
  if (!Array.isArray(warningSymptoms)) return [];
  return warningSymptoms.filter(symptom => WARNING_SYMPTOMS.includes(symptom));
}

export function getBodyAreaSafetyAdjustments(painAreas = []) {
  const selectedAreas = normalizePainAreas(painAreas).filter(area => BODY_AREA_SAFETY_RULES[area]);
  const excludedExercises = [];
  const saferSubstitutions = [];
  const safetyNotes = [];

  selectedAreas.forEach(area => {
    const rule = BODY_AREA_SAFETY_RULES[area];
    excludedExercises.push(...rule.excludedExercises);
    saferSubstitutions.push(...rule.saferSubstitutions);
    safetyNotes.push(rule.note);
  });

  return {
    painAreas: selectedAreas,
    excludedExercises: Array.from(new Set(excludedExercises)),
    saferSubstitutions: Array.from(new Set(saferSubstitutions)),
    safetyNotes: Array.from(new Set(safetyNotes))
  };
}

export function shouldStopWorkout(input = {}) {
  const painLevel = normalizePainLevel(input.painLevel);
  const painAreas = normalizePainAreas(input.painAreas);
  const warningSymptoms = normalizeWarningSymptoms(input.warningSymptoms);

  return painLevel >= 7 || warningSymptoms.length > 0 || painAreas.includes('warning');
}

export function shouldUseRecoveryMode(input = {}) {
  if (shouldStopWorkout(input)) return false;
  const painLevel = normalizePainLevel(input.painLevel);
  const fatigue = input.fatigue || 'medium';
  const sleepHours = input.sleepHours;
  const hasSleepHours = sleepHours !== null && sleepHours !== undefined && sleepHours !== '';
  const parsedSleepHours = hasSleepHours ? Number(sleepHours) : null;

  return (
    (painLevel >= 4 && painLevel <= 6) ||
    fatigue === 'high' ||
    (Number.isFinite(parsedSleepHours) && parsedSleepHours < 5)
  );
}

export function getPainLevelGuidance(painLevel = 0) {
  const level = normalizePainLevel(painLevel);
  if (level <= 2) return '0-2/10: normal training is allowed if movement stays comfortable.';
  if (level === 3) return '3/10: use modified training and minimum effective dose.';
  if (level <= 6) return '4-6/10: use recovery mode instead of formal training.';
  return '7+/10: stop training today and consider qualified professional guidance.';
}

export function getSafetyMode(input = {}) {
  const painLevel = normalizePainLevel(input.painLevel);
  const painAreas = normalizePainAreas(input.painAreas);
  const adjustments = getBodyAreaSafetyAdjustments(painAreas);
  const baseNotes = [
    'This tool offers general movement guidance only.',
    'Stop any movement that increases pain or feels unsafe.'
  ];

  if (shouldStopWorkout({ ...input, painLevel, painAreas })) {
    return {
      mode: 'stop',
      label: 'Red: stop training',
      reason: painLevel >= 7 ? 'Pain level is 7/10 or higher, or a warning symptom is present.' : 'A warning symptom is present.',
      userMessage: 'Stop training today. Rest, monitor symptoms, and consult a qualified medical professional or physical therapist if symptoms are severe, unusual, or worsening.',
      safetyNotes: [...baseNotes, ...adjustments.safetyNotes]
    };
  }

  if (shouldUseRecoveryMode({ ...input, painLevel, painAreas })) {
    return {
      mode: 'recovery',
      label: 'Red: recovery mode',
      reason: 'Pain, fatigue, or short sleep suggests recovery should be prioritized.',
      userMessage: 'Use gentle mobility, easy walking, breathing, and rest today. Keep intensity low and stop if pain increases.',
      safetyNotes: [...baseNotes, ...adjustments.safetyNotes]
    };
  }

  if (painLevel === 3) {
    return {
      mode: 'modified',
      label: 'Yellow: modified training',
      reason: 'Pain level is 3/10, so training should be reduced and adjusted.',
      userMessage: 'Use minimum effective dose: fewer sets, smaller range, and pain-safe substitutions.',
      safetyNotes: [...baseNotes, ...adjustments.safetyNotes]
    };
  }

  return {
    mode: 'normal',
    label: 'Green: normal training',
    reason: 'Pain is 0-2/10 and no stop or recovery condition is present.',
    userMessage: 'Normal low-impact training is allowed. Keep a conversational pace and avoid forcing painful movement.',
    safetyNotes: [...baseNotes, ...adjustments.safetyNotes]
  };
}

export default {
  getSafetyMode,
  getPainLevelGuidance,
  getBodyAreaSafetyAdjustments,
  shouldStopWorkout,
  shouldUseRecoveryMode
};
