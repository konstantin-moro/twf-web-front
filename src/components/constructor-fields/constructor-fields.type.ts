export enum TaskType {
  PROOF = "PROOF",
  REDUCTION = "REDUCTION",
  COMPUTATION = "COMPUTATION"
}

export enum ComputationGoalType {
  NUMBER_TYPE = "NUMBER_TYPE",
  CONCRETE_ANSWERS = "CONCRETE_ANSWERS",
  PATTERN = "PATTERN",
  WEIGHT = "WEIGHT",
}

export enum ReductionGoalType {
  FACTORIZATION = "FACTORIZATION",
  REDUCTION = "REDUCTION",
  POLYNOMIAL = "POLYNOMIAL",
  // OTHER = "OTHER",
}

export enum Panel {
  SUBJECT_TASK_TYPE = 'subject_task_type',
  MAIN_CONDITIONS = 'main_conditions',
}