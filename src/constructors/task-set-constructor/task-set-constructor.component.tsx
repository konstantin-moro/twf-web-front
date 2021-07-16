// libs and hooks
import React, { Dispatch, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
// custom hooks
import useCreationMode from "../hooks/useCreationType";
// redux
import { createStructuredSelector } from "reselect";
import { selectTaskSetJSON } from "../../redux/constructor-jsons/constructor-jsons.selectors";
import { updateTaskSetJSON } from "../../redux/constructor-jsons/constructor-jsons.actions";
import { connect, ConnectedProps } from "react-redux";
import { addMultipleLinesChangeToHistory } from "../../redux/constructor-history/constructor-history.actions";
import CONSTRUCTOR_JSONS_INITIAL_STATE from "../../redux/constructor-jsons/constructor-jsons.state";
// lib components
import Draggable from "react-draggable";
// custom components
import TaskConstructor from "../task-constructor/task-constructor.component";
import AppModal from "../../components/app-modal/app-modal.component";
import ServerResponseAlert from "../../components/server-response-alert/server-response-alert.component";
import { ClipLoader } from "react-spinners";
import ConstructorForm from "../../components/constructor-form/constructor-form";
import HintsBlock from "../../components/hints-block/hints-block.component";
// utils
import getConstructorSubmitButtonAndTitleText from "../utiils/get-constructor-submit-button-and-title-text";
import {
  getLastEditedCreationMode,
  getLastExampleConstructorCode,
  setLastEditedCreationMode,
  setLastExampleConstructorCode,
} from "../../utils/local-storage/last-edited-creation-type";
import NamespaceConstructorRequestHandler from "../namespace-constructor/namespace-constructor.requests-handler";
import TaskSetConstructorRequestsHandler from "./task-set-constructor.requests-handler";
import TaskSetConstructorFormatter from "./task-set-constructor.formatter";
import { addLastEditedConstructorItemToLocalStorage } from "../../utils/last-edited-constructor-items-local-storage";
import RulePackConstructorRequestsHandler from "../rule-pack-constructor/rule-pack-constructor.requests-handler";
import { setConstructorValueDueToCreationMode } from "../utils";
// types
import { RulePackConstructorReceivedForm } from "../rule-pack-constructor/rule-pack-constructor.types";
import { RootState } from "../../redux/root-reducer";
import { TaskConstructorInputs } from "../task-constructor/task-constructor.types";
import {
  ConstructorJSONType,
  UpdateTaskSetJSONAction,
} from "../../redux/constructor-jsons/constructor-jsons.types";
import { ConstructorCreationMode } from "../common-types";
import {
  TaskSetConstructorInputs,
  VisualizationMode,
} from "./task-set-constructor.types";
import { NamespaceReceivedForm } from "../namespace-constructor/namespace-constructor.types";
import { ConstructorFormInput } from "../../components/constructor-form/constructor-form.types";
import { MathInputFormat } from "../../utils/kotlin-lib-functions";
import { AddMultipleLinesChangeToHistoryAction } from "../../redux/constructor-history/constructor-history.types";
// data
import {
  mockTaskSetSubjectTypes,
  taskConstructorDefaultValues,
} from "./task-set-constructor.data";
// icons
import Icon from "@mdi/react";
import {
  mdiCloseCircle,
  mdiCommentQuestion,
  mdiFormatListBulleted,
  mdiPlus,
  mdiRobot,
  mdiTableLarge,
  mdiWrench,
} from "@mdi/js";
// styles
import "./task-set-constructor.styles.scss";

// creating context with FieldArray functions that will be used in task constructors
// @ts-ignore
export const TasksFieldArrayActionsContext = React.createContext();

const TaskSetConstructor = ({
  // redux props
  taskSetJSON,
  updateTaskSetJSON,
  addMultipleLinesChangeToHistory,
}: ConnectedProps<typeof connector>): JSX.Element => {
  // get code from url
  const { code: taskSetCode } = useParams<{ code: any }>();

  // get creation mode using custom hook
  const creationMode: ConstructorCreationMode = useCreationMode();

  // react-hook-form initialization and getting its needed tools
  const reactHookFormFunctions = useForm<TaskSetConstructorInputs>({
    mode: "onSubmit",
    shouldUnregister: false,
  });
  const {
    getValues,
    control,
    reset,
    handleSubmit,
    watch,
  } = reactHookFormFunctions;

  // react-hook-form's fieldArray initialization and getting its needed tools
  // in order to manage task constructors
  const fieldArrayMethods = useFieldArray<TaskConstructorInputs>({
    control,
    name: "tasks",
  });
  const { fields, append } = fieldArrayMethods;

  const titleAndSubmitButtonText: string = getConstructorSubmitButtonAndTitleText(
    creationMode,
    ConstructorJSONType.TASK_SET,
    taskSetCode
  );

  // hints block dependencies
  const isHintsBlockInMobileMode = window.innerWidth <= 650;
  const [hintsDeltaX, setHintsDeltaX] = useState(0);
  const [showHintsBlock, setShowHintsBlock] = useState(false);

  const getHintsBlockSolutionInput = () => {
    return (
      watch(`tasks[${selectedTask}].originalExpression.expression`) +
      "=...=" +
      watch(`tasks[${selectedTask}].goalExpression.expression`)
    );
  };

  // server response messages
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const [successMsg, setSuccessMsg] = useState<null | string>(null);

  // items to fetch from the server
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [rulePacks, setRulePacks] = useState<string[]>([]);

  const [currentVisualizationMode, setCurrentVisualizationMode] = useState<
    "table" | "list"
  >("list");
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  // show spinner while fetching
  const [showSpinner, setShowSpinner] = useState<boolean>(
    creationMode !== ConstructorCreationMode.CREATE
  );

  const inputs: ConstructorFormInput[] = [
    {
      name: "code",
      label: "Код",
      type: "text",
      disabled: creationMode === ConstructorCreationMode.EDIT,
    },
    {
      name: "namespaceCode",
      label: "Namespace",
      type: "text",
      options: namespaces.map((ns: string) => ({ label: ns, value: ns })),
      isMulti: false,
      disabled: creationMode === ConstructorCreationMode.EDIT,
    },
    {
      name: "nameEn",
      label: "Имя en",
      type: "text",
    },
    {
      name: "nameRu",
      label: "Имя ru",
      type: "text",
    },
    {
      name: "descriptionShortRu",
      label: "Краткое описание Ru",
      type: "text",
    },
    {
      name: "descriptionShortEn",
      label: "Краткое описание En",
      type: "text",
    },
    {
      name: "descriptionRu",
      label: "Описание Ru",
      type: "text",
      isTextArea: true,
    },
    {
      name: "descriptionEn",
      label: "Описание En",
      type: "text",
      isTextArea: true,
    },
    {
      name: "subjectType",
      label: "Предметная область",
      isMulti: false,
      options: [
        { value: "standart_math", label: "Стандартная математика" },
        { value: "combinatorics", label: "Комбинаторика" },
        //{ value: "derivations_integrals", label: "Производные и интегралы" },
        //{ value: "probability_and_math_stat", label: "Мат. статистика и мат. вероятность" },
        { value: "complex_numbers", label: "Комплексные числа" },
        //{ value: "asymptotic_analysis", label: "Асимптотический анализ" },
        //{ value: "set", label: "Множества" },
        { value: "logic", label: "Математическая логика" },
        { value: "physics", label: "Физика" },
      ],
    },
    {
      name: "otherData",
      label: "Дополнительная информация",
      type: "text",
      isTextArea: true,
    },
  ];

  const visualizationModes: VisualizationMode[] = [
    {
      name: "list",
      iconUrl: mdiFormatListBulleted,
    },
    {
      name: "table",
      iconUrl: mdiTableLarge,
    },
  ];

  const submitTaskSet = (data: TaskSetConstructorInputs) => {
    TaskSetConstructorRequestsHandler.submitOne(
      TaskSetConstructorFormatter.convertConstructorInputsToSendForm(data),
      creationMode === ConstructorCreationMode.EDIT ? "patch" : "post"
    )
      .then(() => {
        setErrorMsg(null);
        setSuccessMsg(
          creationMode === ConstructorCreationMode.EDIT
            ? "Набор задач успешно изменен!"
            : "Набор задач успешно создан!"
        );
        addLastEditedConstructorItemToLocalStorage(
          "last-edited-task-sets",
          data.code
        );
      })
      .catch(() => {
        setSuccessMsg(null);
        setErrorMsg("Произошла ошибка!");
      });
  };

  const onAddTask = async (taskType: "auto" | "manual") => {
    const oldValue = await getValues();
    await append({
      ...taskConstructorDefaultValues,
      taskCreationType: taskType,
    });
    addMultipleLinesChangeToHistory(oldValue, getValues());
    updateTaskSetJSON(getValues());
  };

  // select last task as current when rendered or when task added/removed
  useEffect(() => {
    if (fields.length !== 0) {
      setSelectedTask(fields.length - 1);
    } else {
      setSelectedTask(null);
    }
  }, [fields]);

  // fetching all necessary entities
  // TODO: catch blocks
  useEffect(() => {
    NamespaceConstructorRequestHandler.getAll().then(
      (res: NamespaceReceivedForm[]) => {
        setNamespaces(res.map((ns: NamespaceReceivedForm) => ns.code));
      }
    );
    RulePackConstructorRequestsHandler.getAll().then(
      (res: RulePackConstructorReceivedForm[]) => {
        setRulePacks(res.map((rp: RulePackConstructorReceivedForm) => rp.code));
      }
    );
  }, []);

  // set values due to creation mode and relevant constructor state
  useEffect(() => {
    setConstructorValueDueToCreationMode(
      ConstructorJSONType.TASK_SET,
      creationMode,
      getLastEditedCreationMode(ConstructorJSONType.TASK_SET),
      reset,
      CONSTRUCTOR_JSONS_INITIAL_STATE.taskSet,
      setLastEditedCreationMode,
      taskSetJSON,
      updateTaskSetJSON,
      taskSetCode,
      async () => {
        const res = await TaskSetConstructorRequestsHandler.getOne(taskSetCode);
        return TaskSetConstructorFormatter.convertReceivedFormToConstructorInputs(
          res
        );
      },
      getLastExampleConstructorCode(ConstructorJSONType.TASK_SET),
      taskSetCode,
      setLastExampleConstructorCode
    ).then(() => {
      setShowSpinner(false);
    });
  }, []);

  if (showSpinner) {
    return (
      <div style={{ margin: "2rem" }}>
        <ClipLoader loading={showSpinner} />
      </div>
    );
  } else {
    return (
      <div className="task-set-constructor">
        <div
          className="task-set-constructor__form-container"
          style={{
            width:
              !showHintsBlock || isHintsBlockInMobileMode
                ? "100%"
                : `calc(50% + ${hintsDeltaX}px)`,
          }}
        >
          <div className="task-set-constructor__form">
            <FormProvider {...reactHookFormFunctions}>
              <TasksFieldArrayActionsContext.Provider value={fieldArrayMethods}>
                <form
                  onSubmit={handleSubmit(() => {
                    submitTaskSet(getValues());
                  })}
                >
                  <h2 className="u-mt-sm">{titleAndSubmitButtonText}</h2>
                  <ConstructorForm
                    inputs={inputs}
                    constructorType={ConstructorJSONType.TASK_SET}
                  />
                  <div className="u-flex" style={{ alignItems: "center" }}>
                    <h3>Задачи</h3>
                    <div className="task-set-constructor__visualization-mode-switchers">
                      {visualizationModes.map((mode: VisualizationMode) => {
                        const { name, iconUrl } = mode;
                        return (
                          <div
                            className={`task-set-constructor__visualization-mode-switcher ${name === currentVisualizationMode
                              ? "task-set-constructor__visualization-mode-switcher--active"
                              : ""
                              }`}
                            onClick={() => {
                              setCurrentVisualizationMode(name);
                            }}
                          >
                            <Icon path={iconUrl} size={1.5} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={`${currentVisualizationMode === "table"
                      ? "form-levels-table"
                      : "form-levels-list"
                      }`}
                  >
                    {currentVisualizationMode === "list" && (
                      <div className="form-levels-list__select">
                        {fields.map((field, index) => {
                          return (
                            <div
                              key={field.id}
                              onClick={() => setSelectedTask(index)}
                              className={`form-levels-list__select-option ${index === selectedTask &&
                                "form-levels-list__select-option--active"
                                }`}
                            >
                              <Icon
                                path={
                                  field.taskCreationType === "auto"
                                    ? mdiRobot
                                    : mdiWrench
                                }
                                size={2}
                                style={{ marginRight: "1rem" }}
                              />
                              <span>
                                Задача {index + 1}.{" "}
                                {watch(`tasks[${index}].nameRu`)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="form-levels-list__action-buttons">
                          <button
                            type="button"
                            className="btn form-levels-list__action-button"
                            onClick={async () => {
                              await onAddTask("manual");
                            }}
                          >
                            <Icon path={mdiPlus} size={1.2} />
                            <span>
                              <b>ручная задача</b>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="btn form-levels-list__action-button"
                            onClick={async () => {
                              await onAddTask("auto");
                            }}
                          >
                            <Icon path={mdiPlus} size={1.2} />
                            <span>авто задача</span>
                          </button>
                          <button
                            type="button"
                            className="btn form-levels-list__action-button u-mr-sm"
                            onClick={() => { }}
                          >
                            <Icon path={mdiPlus} size={1.2} />
                            <span>существующая задача</span>
                          </button>
                          <button
                            type="button"
                            className="btn form-levels-list__action-button"
                            onClick={() => console.log(getValues())}
                          >
                            log values
                          </button>
                        </div>
                      </div>
                    )}
                    <div
                      className={`${currentVisualizationMode === "list"
                        ? "form-levels-list__selected-level"
                        : ""
                        }`}
                    >
                      {fields.map((field, index: number) => {
                        return (
                          <TaskConstructor
                            key={field.id}
                            index={index}
                            defaultValue={
                              taskSetJSON.tasks[index]
                                ? taskSetJSON.tasks[index]
                                : fields[index]
                            }
                            updateDemo={() => { }}
                            visualizationMode={currentVisualizationMode}
                            isRendered={
                              currentVisualizationMode === "list" &&
                              index !== selectedTask
                            }
                            rulePacks={rulePacks}
                          />
                        );
                      })}
                    </div>
                    {currentVisualizationMode === "table" && (
                      <div className="form-levels-table__action-buttons">
                        <button
                          type="button"
                          className="btn form-levels-table__action-button"
                          onClick={async () => {
                            await onAddTask("manual");
                          }}
                        >
                          <Icon path={mdiPlus} size={1.2} />
                          <span>
                            <b>ручная задача</b>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="btn form-levels-table__action-button"
                          onClick={async () => {
                            await onAddTask("auto");
                          }}
                        >
                          <Icon path={mdiPlus} size={1.2} />
                          <span>авто задача</span>
                        </button>
                        <button
                          type="button"
                          className="btn form-levels-table__action-button"
                          onClick={() => { }}
                        >
                          <Icon path={mdiPlus} size={1.2} />
                          <span>существующая задача</span>
                        </button>
                        <button
                          type="button"
                          className="btn form-levels-table__action-button"
                          onClick={() => console.log(getValues())}
                        >
                          get values
                        </button>
                      </div>
                    )}
                  </div>
                  <ServerResponseAlert
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                  />
                  <button type="submit" className="btn u-mt-sm">
                    {titleAndSubmitButtonText}
                  </button>
                </form>
              </TasksFieldArrayActionsContext.Provider>
            </FormProvider>
          </div>
        </div>

        {/*HINTS BLOCK*/}
        <div
          className="task-set-constructor__icon"
          onClick={() => setShowHintsBlock(!showHintsBlock)}
        >
          <Icon
            size={3}
            path={showHintsBlock ? mdiCloseCircle : mdiCommentQuestion}
          />
        </div>
        <div
          className={`task-set-constructor__hints-desktop ${showHintsBlock && "task-set-constructor__hints-desktop--visible"
            }`}
          style={{
            width: showHintsBlock ? `calc(50% - ${hintsDeltaX}px)` : "0",
          }}
        >
          <Draggable
            axis="x"
            position={{
              x: 0,
              y: 0,
            }}
            defaultClassName="task-set-constructor__hints-desktop-dragger"
            defaultClassNameDragging="task-set-constructor__hints-desktop-dragger task-set-constructor__hints-desktop-dragger--dragging"
            onStop={(_, { lastX }) => {
              setHintsDeltaX((prevState) => {
                return prevState + lastX;
              });
            }}
          >
            <span />
          </Draggable>
          {showHintsBlock && (
            <HintsBlock
              format={
                watch(
                  `tasks[${selectedTask}].originalExpression.format`
                ) as MathInputFormat
              }
              expression={getHintsBlockSolutionInput()}
            />
          )}
        </div>
        <div className="task-set-constructor__hints-phone">
          {isHintsBlockInMobileMode && (
            <AppModal
              isOpen={showHintsBlock}
              close={() => setShowHintsBlock(false)}
            >
              <HintsBlock
                format={
                  watch(
                    `tasks[${selectedTask}].originalExpression.format`
                  ) as MathInputFormat
                }
                expression={getHintsBlockSolutionInput()}
              />
            </AppModal>
          )}
        </div>
      </div>
    );
  }
};

// connecting redux
const mapState = createStructuredSelector<
  RootState,
  {
    taskSetJSON: TaskSetConstructorInputs;
  }
>({
  taskSetJSON: selectTaskSetJSON,
});

const mapDispatch = (
  dispatch: Dispatch<
    UpdateTaskSetJSONAction | AddMultipleLinesChangeToHistoryAction
  >
) => ({
  updateTaskSetJSON: (taskSetJSON: TaskSetConstructorInputs) =>
    dispatch(updateTaskSetJSON(taskSetJSON)),
  addMultipleLinesChangeToHistory: (
    oldVal: TaskSetConstructorInputs,
    newVal: TaskSetConstructorInputs
  ) =>
    dispatch(
      addMultipleLinesChangeToHistory({
        oldVal,
        newVal,
        constructorType: ConstructorJSONType.TASK_SET,
      })
    ),
});

const connector = connect(mapState, mapDispatch);

export default connector(TaskSetConstructor);
