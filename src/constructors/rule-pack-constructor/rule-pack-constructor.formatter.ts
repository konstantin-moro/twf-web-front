import {
  RulePackConstructorInputs,
  RulePackConstructorReceivedForm,
  RulePackConstructorSendForm,
  RulePackLink,
} from "./rule-pack-constructor.types";
import {
  convertMathInput,
  MathInputFormat,
} from "../../utils/kotlin-lib-functions";
import {
  ExpressionInput
} from "../task-constructor/task-constructor.types";
import {
  RuleConstructorInputs,
  RuleConstructorReceivedForm,
} from "../rule-constructor/rule-constructor.types";

class RulePackConstructorFormatter {
  public static convertReceivedFormToConstructorInputs(
    data: RulePackConstructorReceivedForm
  ): RulePackConstructorInputs {
    const res = {
      ...data,
      rulePacks: data.rulePacks?.map((rp: RulePackLink) => {
        return rp.rulePackCode;
      }),
    };
    if (res.rules) {
      res.rules = res.rules.map((rule: RuleConstructorReceivedForm) => {
        const formattedRule: RuleConstructorReceivedForm = { ...rule };
        if (formattedRule.hasOwnProperty("leftStructureString")) {
          delete formattedRule.leftStructureString;
        }
        if (formattedRule.hasOwnProperty("rightStructureString")) {
          delete formattedRule.rightStructureString;
        }
        return formattedRule;
      });
    }
    return res;
  }

  public static convertConstructorInputsToSendForm(
    data: RulePackConstructorInputs
  ): RulePackConstructorSendForm {
    const res = { ...data };
    if (res.rulePacks) {
      // @ts-ignore
      res.rulePacks = res.rulePacks.map((code: string) => ({
        rulePackCode: code,
      }));
    }

    if (res.rules) {
      res.rules = res.rules.map((rule: RuleConstructorInputs) => {
        const formattedRule = { ...rule };

        if (!rule.left && !rule.right) {
          return formattedRule;
        }

        // @ts-ignore
        formattedRule.leftStructureString = convertMathInput(
          rule.left.format,
          MathInputFormat.STRUCTURE_STRING,
          rule.left.expression
        );
        // @ts-ignore
        formattedRule.rightStructureString = convertMathInput(
          rule.right.format,
          MathInputFormat.STRUCTURE_STRING,
          rule.right.expression
        );
        return formattedRule;
      });
    }
    // @ts-ignore
    return res;
  }
}

export default RulePackConstructorFormatter;
