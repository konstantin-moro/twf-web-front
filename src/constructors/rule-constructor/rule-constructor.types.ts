import { ArrayField } from "react-hook-form";
import { ExpressionInput } from "../task-constructor/task-constructor.types";

export interface RuleConstructorReceivedForm {
  nameEn: string;
  nameRu: string;
  code: string;
  descriptionShortRu: string;
  descriptionShortEn: string;
  descriptionRu: string;
  descriptionEn: string;
  leftStructureString?: string;
  rightStructureString?: string;
  left: ExpressionInput;
  right: ExpressionInput;
  priority: number;
  isExtending: "true" | "false" | boolean;
  simpleAdditional: "true" | "false" | boolean;
  basedOnTaskContext: "true" | "false" | boolean;
  matchJumbledAndNested: "true" | "false" | boolean;
  weight: number;
  normalizationType: string;
}

export interface RuleConstructorInputs {
  nameEn: string;
  nameRu: string;
  code: string;
  descriptionShortRu: string;
  descriptionShortEn: string;
  descriptionRu: string;
  descriptionEn: string;
  left: ExpressionInput;
  right: ExpressionInput;
  priority: number;
  isExtending: "true" | "false" | boolean;
  simpleAdditional: "true" | "false" | boolean;
  basedOnTaskContext: "true" | "false" | boolean;
  matchJumbledAndNested: "true" | "false" | boolean;
  weight: number;
  normalizationType: string;
}

export type RuleConstructorSendForm = RuleConstructorReceivedForm;

export interface RuleConstructorProps {
  index: number;
  defaultValue?: Partial<ArrayField<RuleConstructorInputs, "id">>;
}
