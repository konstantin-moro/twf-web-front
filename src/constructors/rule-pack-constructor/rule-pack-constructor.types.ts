import {
  RuleConstructorInputs,
  RuleConstructorReceivedForm,
  RuleConstructorSendForm,
} from "../rule-constructor/rule-constructor.types";

export interface RulePackConstructorReceivedForm {
  namespaceCode: string;
  code: string;
  nameEn: string;
  nameRu: string;
  descriptionShortRu: string;
  descriptionShortEn: string;
  descriptionRu: string;
  descriptionEn: string;
  subjectType: string;
  rulePacks?: RulePackLink[];
  rules?: RuleConstructorReceivedForm[];
}

export interface RulePackConstructorInputs {
  namespaceCode: string;
  code: string;
  nameEn: string;
  nameRu: string;
  descriptionShortRu: string;
  descriptionShortEn: string;
  descriptionRu: string;
  descriptionEn: string;
  subjectType: string;
  rulePacks?: string[];
  rules?: RuleConstructorInputs[];
}

export interface RulePackConstructorSendForm {
  namespaceCode: string;
  code: string;
  nameEn: string;
  nameRu: string;
  descriptionShortRu: string;
  descriptionShortEn: string;
  descriptionRu: string;
  descriptionEn: string;
  subjectType: string;
  rulePacks?: { rulePackCode: string }[];
  rules?: RuleConstructorSendForm[];
}

export interface RulePackLink {
  rulePackCode: string;
  namespaceCode?: string;
  rulePackNameEn?: string;
  rulePackNameRy?: string;
}
