export enum GoalType {
  CUSTOM = "CUSTOM",
  EXPRESSION = "EXPRESSION",
  COMPUTATION = "COMPUTATION",
  SIMPLIFICATION = "SIMPLIFICATION",
  CNF = "CNF",
  DNF = "DNF",
  FACTORIZATION = "FACTORIZATION",
  UNKNOWN = "UNKNOWN",
}

export interface FetchedTask {
  namespaceCode: string;
  code: string;
  nameEn: string;
  nameRu: string;
  subjectTypes: string[];
  originalExpressionStructureString: string;
  originalExpressionTex: string;
  originalExpressionPlainText: string;
  goalType: GoalType;
  goalExpressionStructureString: string;
  goalExpressionTex: string;
  goalExpressionPlainText: string;
  goalPattern: string;
  goalNumberProperty: number;
  rulePacks: any;
  stepsNumber: number;
  time: number;
  difficulty: number;
  solution: string;
  countOfAutoGeneratedTasks: number;
  operations: string;
  stepsCountIntervals: string;
  implicitTransformationsCount: string;
  autoGeneratedRulePacks: any;
  lightWeightOperations: string;
  nullWeightOperations: string;
  maxNumberOfAutogeneratedTasks: number;
  numberOfAutogeneratedTasksToSolve: number;
  otherGoalData: any;
  otherCheckSolutionData: any;
  otherAwardData: any;
  otherAutogenerationData: any;
  otherData: any;
}

export interface FetchedTaskSet {
  code: string;
  namespaceCode: string;
  nameEn: string;
  nameRu: string;
  subjectTypes: string[];
  tasks: FetchedTask[];
  recommendedByCommunity: boolean;
  otherData: string | null;
}
