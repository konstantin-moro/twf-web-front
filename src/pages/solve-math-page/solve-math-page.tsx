// libs and hooks
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
// lib components
import { Steps } from "antd";
import { EditableMathField, MathField } from "react-mathquill";
// custom components
import ServerResponseAlert from "../../components/server-response-alert/server-response-alert.component";
import ActionButton from "../../components/action-button/action-button.component";
import AppSpinner from "../../components/app-spinner/app-spinner";
import TexEditorActionsTab from "../../components/tex-editor-actions-tab/tex-editor-actions-tab";
// utils
import { checkTex } from "../../utils/kotlin-lib-functions";
import { getAuthToken } from "../../utils/local-storage/auth-token";
import TaskSetConstructorRequestsHandler from "../../constructors/task-set-constructor/task-set-constructor.requests-handler";
import { TaskSetConstructorReceivedForm } from "../../constructors/task-set-constructor/task-set-constructor.types";
import { addStyles } from "react-mathquill";
// types
import { TaskConstructorReceivedForm } from "../../constructors/task-constructor/task-constructor.types";
import { SendLogForm } from "./solve-math-page.types";

// icons
import { mdiArrowLeftBoldBox, mdiArrowRightBoldBox } from "@mdi/js";
// styles
import "./solve-math-page.scss";
import "antd/dist/antd.compact.min.css";

// adding mathquill styles
addStyles();

const SolveMathPage: React.FC = () => {
  const { Step } = Steps;
  const { taskSetCode } = useParams<{ taskSetCode: any }>();

  const [isTaskSetFetched, setIsTaskSetFetched] = useState<boolean>(false);
  const [taskSet, setTaskSet] = useState<TaskSetConstructorReceivedForm>();
  const [currentTaskIdx, setCurrentTaskIdx] = useState<number>(0);
  const [solutions, setSolutions] = useState<string[]>([]);
  const [errMessages, setErrMessages] = useState<(string | null)[]>([]);
  const [successMessages, setSuccessMessages] = useState<
    ("Правильно!" | null)[]
  >([]);
  const [mathField, setMathField] = useState<MathField>();
  const [lastSentLogSolution, setLastSentLogSolution] = useState<string>("");

  // UTILS
  const sendLog = (data: SendLogForm): Promise<AxiosResponse> => {
    return axios({
      method: "post",
      url: process.env.REACT_APP_SERVER_API + "/activity_log/create",
      data,
      headers: {
        Authorization: "Bearer " + getAuthToken(),
      },
    })
      .then((res: AxiosResponse) => {
        console.log("Log sent!", res);
        return res;
      })
      .catch((e) => {
        console.error("Error while sending log ", e.message, e.response);
        throw e;
      });
  };

  const prepareDataForLogging = (
    activityTypeCode: "interim" | "win" | "loose",
    solution: string,
    taskSet: TaskSetConstructorReceivedForm,
    currentTaskIdx: number
  ): SendLogForm => ({
    activityTypeCode,
    appCode: "test_app_code",
    clientActionTs: new Date().toISOString(),
    currSolution: solution,
    difficulty: taskSet.tasks[currentTaskIdx].difficulty,
    goalExpression: taskSet.tasks[currentTaskIdx].goalExpressionTex,
    originalExpression: taskSet.tasks[currentTaskIdx].originalExpressionTex,
    taskCode: taskSet.tasks[currentTaskIdx].code,
    tasksetCode: taskSet.code,
    tasksetVersion: 0,
    taskVersion: 0,
  });

  // USER ACTIONS
  const onCheckTex = (solutionInTex: string): void => {
    if (taskSet?.tasks[currentTaskIdx]) {
      const res = checkTex(
        solutionInTex,
        taskSet?.tasks[currentTaskIdx].originalExpressionStructureString,
        taskSet?.tasks[currentTaskIdx].goalExpressionStructureString
      );
      if (res.errorMessage) {
        setSuccessMessages((prevState) => {
          const newState = [...prevState];
          newState[currentTaskIdx] = null;
          return newState;
        });
        setErrMessages((prevState) => {
          const newState = [...prevState];
          newState[currentTaskIdx] = res.errorMessage;
          return newState;
        });
      } else {
        setErrMessages((prevState) => {
          const newState = [...prevState];
          newState[currentTaskIdx] = null;
          return newState;
        });
        setSuccessMessages((prevState) => {
          const newState = [...prevState];
          newState[currentTaskIdx] = "Правильно!";
          return newState;
        });
      }
      setSolutions((prevState: string[]) =>
        prevState.map((solution: string, i: number) =>
          i === currentTaskIdx ? res.validatedSolution : solution
        )
      );
    }
    // send log
    if (taskSet && mathField && mathField.latex() !== lastSentLogSolution) {
      sendLog(
        prepareDataForLogging(
          "interim",
          mathField.latex(),
          taskSet,
          currentTaskIdx
        )
      ).then(() => {
        setLastSentLogSolution(mathField.latex());
      });
    }
  };

  const onChangeCurrentTask = (selectedTaskIdx: number): void => {
    if (
      mathField &&
      taskSet &&
      currentTaskIdx >= 0 &&
      currentTaskIdx < taskSet?.tasks.length
    ) {
      setCurrentTaskIdx((prevIdx: number) => {
        if (mathField.latex() !== lastSentLogSolution) {
          sendLog(
            prepareDataForLogging(
              "interim",
              mathField.latex(),
              taskSet,
              prevIdx
            )
          ).then(() => {
            setLastSentLogSolution(mathField.latex());
          });
        }
        setSolutions((prevState: string[]) =>
          prevState.map((solution: string, i: number) =>
            i === prevIdx ? mathField.latex() : solution
          )
        );
        return selectedTaskIdx;
      });
    }
  };

  const onSendAllSolutions = async () => {
    if (taskSet) {
      let correctSolutions = 0;
      for (let idx = 0; idx < solutions.length; idx++) {
        const solution = solutions[idx];
        const checkRes = checkTex(
          solution,
          taskSet.tasks[idx].originalExpressionTex,
          taskSet.tasks[idx].goalExpressionTex
        );
        if (checkRes.errorMessage) {
          await sendLog(prepareDataForLogging("loose", solution, taskSet, idx));
        } else {
          await sendLog(prepareDataForLogging("win", solution, taskSet, idx));
          correctSolutions++;
        }
      }
      alert(
        "Вы решили правильно " +
        correctSolutions +
        " задач из " +
        taskSet.tasks.length
      );
    }
  };

  // fetching taskSet
  useEffect(() => {
    TaskSetConstructorRequestsHandler.getOne(taskSetCode).then(
      (res: TaskSetConstructorReceivedForm) => {
        setTaskSet(res);
        setSolutions(
          res.tasks.map(
            (task: TaskConstructorReceivedForm) =>
              task.originalExpressionTex + "=...=" + task.goalExpressionTex
          )
        );
        setSolutions(
          res.tasks.map((task: TaskConstructorReceivedForm) => {
            return (
              task.originalExpressionTex + "=...=" + task.goalExpressionTex
            );
          })
        );
        setIsTaskSetFetched(true);
      }
    );
  }, []);

  // setting up logging interval
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (taskSet && mathField && mathField.latex() !== lastSentLogSolution) {
        sendLog(
          prepareDataForLogging(
            "interim",
            mathField.latex(),
            taskSet,
            currentTaskIdx
          )
        ).then(() => {
          setLastSentLogSolution(mathField.latex());
        });
      }
    }, 5000);
    return () => {
      clearInterval(logInterval);
    };
  }, [
    isTaskSetFetched,
    taskSet,
    mathField,
    lastSentLogSolution,
    currentTaskIdx,
  ]);

  if (isTaskSetFetched) {
    return (
      <div className="solve-math">
        <h1 className="u-text-center u-mt-sm">Набор задач {taskSet?.nameRu}</h1>
        <div style={{ width: "80%", margin: "2rem auto 0 auto" }}>
          <Steps
            progressDot={true}
            current={currentTaskIdx}
            direction={"horizontal"}
          >
            {taskSet?.tasks.map(
              (task: TaskConstructorReceivedForm, i: number) => {
                return (
                  <Step
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onChangeCurrentTask(i);
                    }}
                    title={<b>{task.nameRu}</b>}
                  />
                );
              }
            )}
          </Steps>
        </div>
        <div className="solve-math__tex-solution u-mt-md">
          {mathField && <TexEditorActionsTab mathField={mathField} />}
          <EditableMathField
            latex={solutions[currentTaskIdx]}
            mathquillDidMount={(mathField: MathField) => {
              setMathField(mathField);
            }}
            style={{
              minWidth: "40rem",
              maxWidth: window.innerWidth - 100 + "px",
            }}
          />
        </div>
        <ServerResponseAlert
          errorMsg={errMessages[currentTaskIdx]}
          successMsg={successMessages[currentTaskIdx]}
          style={{ marginTop: "2rem", maxWidth: window.innerWidth / 2 }}
        />
        <div className="solve-math__buttons">
          <div>
            <ActionButton
              mdiIconPath={mdiArrowLeftBoldBox}
              size={2}
              margin={"0 1rem 0 0"}
              action={() => {
                onChangeCurrentTask(currentTaskIdx - 1);
              }}
            />
            <ActionButton
              mdiIconPath={mdiArrowRightBoldBox}
              size={2}
              action={() => {
                onChangeCurrentTask(currentTaskIdx + 1);
              }}
            />
          </div>
          <div>
            <button
              className="btn u-mr-sm"
              onClick={() => {
                if (mathField) {
                  onCheckTex(mathField?.latex());
                }
              }}
            >
              Проверить
            </button>
            <button
              className="btn"
              onClick={async () => {
                if (
                  window.confirm(
                    "Вы точно уверены, что хотите отправить все решения?"
                  )
                ) {
                  await onSendAllSolutions();
                }
              }}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return <AppSpinner loading={!isTaskSetFetched} />;
  }
};

export default SolveMathPage;
