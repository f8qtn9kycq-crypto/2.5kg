export const exercises = [
  {
    id: 'easy_walk',
    name: 'easy walk',
    category: 'walk',
    equipment: ['none'],
    goalTags: ['fat_loss', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['running intervals'],
    activeAgingFriendly: true,
    instructions: 'Walk at a pace where conversation stays possible.'
  },
  {
    id: 'fast_walking',
    name: 'fast walking',
    category: 'walk',
    equipment: ['none'],
    goalTags: ['fat_loss', 'active_aging'],
    riskTags: [],
    substitutionFor: ['jump squat', 'burpee', 'running intervals'],
    activeAgingFriendly: true,
    instructions: 'Use a brisk but low-impact pace and stop if pain increases.'
  },
  {
    id: 'box_breathing',
    name: 'breathing reset',
    category: 'mobility',
    equipment: ['none'],
    goalTags: ['active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: [],
    activeAgingFriendly: true,
    instructions: 'Breathe slowly for two to three minutes before gentle movement.'
  },
  {
    id: 'joint_mobility',
    name: 'gentle joint mobility',
    category: 'mobility',
    equipment: ['none'],
    goalTags: ['active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: [],
    activeAgingFriendly: true,
    instructions: 'Move ankles, hips, shoulders, and spine through comfortable ranges.'
  },
  {
    id: 'sit_to_stand',
    name: 'sit-to-stand',
    category: 'squat',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['jump squat', 'deep loaded knee flexion'],
    activeAgingFriendly: true,
    instructions: 'Stand from a chair with control, using hands for support if needed.'
  },
  {
    id: 'partial_squat',
    name: 'partial squat',
    category: 'squat',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'active_aging'],
    riskTags: [],
    substitutionFor: ['deep squat', 'deep loaded knee flexion'],
    activeAgingFriendly: true,
    instructions: 'Use a shallow range that keeps knees and hips comfortable.'
  },
  {
    id: 'box_squat',
    name: 'box squat',
    category: 'squat',
    equipment: ['none', 'dumbbell'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['deep squat', 'deep lunge'],
    activeAgingFriendly: true,
    instructions: 'Touch a chair or box lightly, then stand with steady control.'
  },
  {
    id: 'short_range_split_squat',
    name: 'short-range split squat',
    category: 'squat',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['deep lunge'],
    activeAgingFriendly: true,
    instructions: 'Keep the range small and hold support if balance feels uncertain.'
  },
  {
    id: 'incline_push_up',
    name: 'incline push-up',
    category: 'push',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'active_aging'],
    riskTags: [],
    substitutionFor: ['overhead press', 'push press', 'dips'],
    activeAgingFriendly: true,
    instructions: 'Use a wall, table, or counter so the shoulder stays comfortable.'
  },
  {
    id: 'elevated_push_up',
    name: 'elevated push-up',
    category: 'push',
    equipment: ['none'],
    goalTags: ['muscle_maintenance'],
    riskTags: [],
    substitutionFor: ['dips', 'push press'],
    activeAgingFriendly: true,
    instructions: 'Keep elbows comfortable and stop before shoulder symptoms increase.'
  },
  {
    id: 'band_pull_apart',
    name: 'band pull apart',
    category: 'pull',
    equipment: ['band'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['upright row', 'behind-neck press'],
    activeAgingFriendly: true,
    instructions: 'Pull the band gently at chest height without shrugging.'
  },
  {
    id: 'scaption_raise',
    name: 'scaption raise',
    category: 'push',
    equipment: ['none', 'dumbbell'],
    goalTags: ['muscle_maintenance', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['overhead press', 'push press'],
    activeAgingFriendly: true,
    instructions: 'Raise arms in a comfortable diagonal line, below painful range.'
  },
  {
    id: 'neutral_grip_pulldown',
    name: 'neutral-grip pulldown',
    category: 'pull',
    equipment: ['band', 'gym'],
    goalTags: ['muscle_maintenance'],
    riskTags: [],
    substitutionFor: ['kipping pull-up', 'upright row'],
    activeAgingFriendly: true,
    instructions: 'Use a neutral grip and stop short of any shoulder irritation.'
  },
  {
    id: 'standing_march',
    name: 'standing march',
    category: 'balance',
    equipment: ['none'],
    goalTags: ['active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['mountain climber', 'sit-up with deep hip flexion'],
    activeAgingFriendly: true,
    instructions: 'March slowly while holding a wall or chair if needed.'
  },
  {
    id: 'dead_bug',
    name: 'dead bug',
    category: 'core',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['sit-up with deep hip flexion', 'high-volume sit-ups', 'russian twist'],
    activeAgingFriendly: true,
    instructions: 'Keep the lower back comfortable and move slowly.'
  },
  {
    id: 'glute_bridge',
    name: 'glute bridge',
    category: 'hinge',
    equipment: ['none'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['heavy deadlift', 'heavy good morning'],
    activeAgingFriendly: true,
    instructions: 'Lift hips gently and avoid pushing into back discomfort.'
  },
  {
    id: 'bird_dog',
    name: 'bird dog',
    category: 'core',
    equipment: ['none'],
    goalTags: ['active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['heavy deadlift', 'russian twist'],
    activeAgingFriendly: true,
    instructions: 'Reach slowly with a quiet trunk and comfortable range.'
  },
  {
    id: 'farmer_carry',
    name: 'farmer carry',
    category: 'core',
    equipment: ['dumbbell', 'gym'],
    goalTags: ['muscle_maintenance', 'active_aging'],
    riskTags: [],
    substitutionFor: ['heavy deadlift', 'heavy good morning'],
    activeAgingFriendly: true,
    instructions: 'Carry light weights with tall posture and steady breathing.'
  },
  {
    id: 'pallof_press',
    name: 'Pallof Press',
    category: 'core',
    equipment: ['band', 'cable'],
    goalTags: ['muscle_maintenance', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['russian twist', 'heavy deadlift', 'heavy good morning'],
    activeAgingFriendly: true,
    level: 'beginner',
    instructions: [
      'Stand tall with band or cable at chest height',
      'Press hands forward slowly',
      'Resist rotation through the trunk',
      'Return with control'
    ],
    safetyNotes: [
      'Keep ribs down',
      'Avoid twisting through the lower back',
      'Use light resistance first'
    ],
    contraindications: []
  },
  {
    id: 'bike',
    name: 'bike',
    category: 'walk',
    equipment: ['gym'],
    goalTags: ['fat_loss', 'active_aging', 'rehab_friendly'],
    riskTags: [],
    substitutionFor: ['jump squat', 'burpee', 'running intervals'],
    activeAgingFriendly: true,
    instructions: 'Use easy resistance and stop if knee symptoms increase.'
  },
  {
    id: 'overhead_press',
    name: 'overhead press',
    category: 'push',
    equipment: ['dumbbell', 'gym'],
    goalTags: ['muscle_maintenance'],
    riskTags: ['shoulder_restriction'],
    substitutionFor: [],
    activeAgingFriendly: false,
    instructions: 'Restricted when shoulder pain or limitation is selected.'
  },
  {
    id: 'deep_squat',
    name: 'deep squat',
    category: 'squat',
    equipment: ['none', 'dumbbell', 'gym'],
    goalTags: ['muscle_maintenance'],
    riskTags: ['hip_restriction', 'knee_restriction'],
    substitutionFor: [],
    activeAgingFriendly: false,
    instructions: 'Restricted when hip or knee pain is selected.'
  },
  {
    id: 'jump_squat',
    name: 'jump squat',
    category: 'squat',
    equipment: ['none'],
    goalTags: ['fat_loss'],
    riskTags: ['knee_restriction'],
    substitutionFor: [],
    activeAgingFriendly: false,
    instructions: 'Restricted when knee pain or low-impact defaults are required.'
  },
  {
    id: 'heavy_deadlift',
    name: 'heavy deadlift',
    category: 'hinge',
    equipment: ['dumbbell', 'gym'],
    goalTags: ['muscle_maintenance'],
    riskTags: ['back_restriction'],
    substitutionFor: [],
    activeAgingFriendly: false,
    instructions: 'Restricted when back pain or limitation is selected.'
  }
];

export default exercises;
