export const personas = {
  active_health: {
    id: 'active_health',
    label: '主動健康型',
    defaultGoal: 'active_aging',
    defaultIntensity: 'moderate',
    suggestedTime: 30,
    safetyBias: 'balanced',
    defaultReminderText: '維持穩定節奏，不需要用爆汗證明努力。'
  },
  passive_improvement: {
    id: 'passive_improvement',
    label: '低摩擦改善型',
    defaultGoal: 'fat_loss',
    defaultIntensity: 'low',
    suggestedTime: 15,
    safetyBias: 'conservative',
    defaultReminderText: '今天先完成最低有效行動，短版也算成功。'
  },
  active_aging: {
    id: 'active_aging',
    label: '樂齡維持型',
    defaultGoal: 'active_aging',
    defaultIntensity: 'low_to_moderate',
    suggestedTime: 15,
    safetyBias: 'very_conservative',
    defaultReminderText: '動作品質、平衡與安全感，比強度更重要。'
  }
};

export default personas;
