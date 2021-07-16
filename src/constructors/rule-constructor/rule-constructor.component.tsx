// libs and hooks
import React from "react";
// custom components
import ConstructorForm from "../../components/constructor-form/constructor-form";
// types
import { RuleConstructorProps } from "./rule-constructor.types";
import { ConstructorJSONType } from "../../redux/constructor-jsons/constructor-jsons.types";
import { ConstructorFormInput } from "../../components/constructor-form/constructor-form.types";
// styles
import "./rule-constructor.styles.scss";

const RuleConstructor = ({ index }: RuleConstructorProps): JSX.Element => {
  const inputs: ConstructorFormInput[] = [
    {
      name: `rules[${index}].nameEn`,
      label: "Название En",
      type: "text",
    },
    {
      name: `rules[${index}].nameRu`,
      label: "Название Ru",
      type: "text",
    },
    {
      name: `rules[${index}].code`,
      label: "Код",
      type: "text",
    },
    {
      name: `rules[${index}].descriptionShortRu`,
      label: "Краткое описание Ru",
      type: "text",
    },
    {
      name: `rules[${index}].descriptionShortEn`,
      label: "Краткое описание En",
      type: "text",
    },
    {
      name: `rules[${index}].descriptionRu`,
      label: "Описание Ru",
      type: "text",
      isTextArea: true,
    },
    {
      name: `rules[${index}].descriptionEn`,
      label: "Описание En",
      type: "text",
      isTextArea: true,
    },
    {
      name: `rules[${index}].left`,
      label: "Левая часть",
      type: "text",
      isExpressionInput: true,
    },
    {
      name: `rules[${index}].right`,
      label: "Правая часть",
      type: "text",
      isExpressionInput: true,
    },
    {
      name: `rules[${index}].priority`,
      label: "Приоритет",
      type: "number",
    },
    {
      name: `rules[${index}].normalizationType`,
      label: "Тип нормализации",
      type: "text",
    },
    {
      name: `rules[${index}].weight`,
      label: "Вес",
      type: "text",
    },
    {
      name: `rules[${index}].isExtending`,
      label: "isExtending",
      options: [
        { value: "true", label: "да" },
        { value: "false", label: "нет" },
      ],
      isMulti: false,
    },
    {
      name: `rules[${index}].simpleAdditional`,
      label: "simpleAdditional",
      options: [
        { value: "true", label: "да" },
        { value: "false", label: "нет" },
      ],
      isMulti: false,
    },
    {
      name: `rules[${index}].basedOnTaskContext`,
      label: "Based on task context",
      options: [
        { value: "true", label: "да" },
        { value: "false", label: "нет" },
      ],
      isMulti: false,
    },
    {
      name: `rules[${index}].matchJumbledAndNested`,
      label: "Match jumbled and nested",
      options: [
        { value: "true", label: "да" },
        { value: "false", label: "нет" },
      ],
      isMulti: false,
    },
  ];

  return (
    <ConstructorForm
      inputs={inputs}
      constructorType={ConstructorJSONType.RULE_PACK}
      className="rule-constructor"
      showUndoRedoPanel={false}
    />
  );
};

export default RuleConstructor;
