import {
  ADD_ITEM_TO_TASK_SET_HISTORY,
  ConstructorHistory,
  ConstructorHistoryActionTypes,
} from "./constructor-history.types";
import CONSTRUCTOR_HISTORY_INITIAL_STATE from "./constructor-history.state";

import deepEqual from "fast-deep-equal/es6";

const constructorHistoryReducer = (
  state: ConstructorHistory = CONSTRUCTOR_HISTORY_INITIAL_STATE,
  action: ConstructorHistoryActionTypes
): ConstructorHistory => {
  switch (action.type) {
    case "ADD_ITEM_TO_TASK_SET_HISTORY":
      if (
        deepEqual(
          state.taskSet[state.taskSet.length - 1],
          action.payload.oldVal
        )
      ) {
        return {
          ...state,
          taskSet: [
            ...state.taskSet.slice(0, state.taskSetIdx + 1),
            action.payload.newVal,
          ],
          taskSetIdx: state.taskSetIdx + 1,
        };
      } else {
        return {
          ...state,
          taskSet: [
            ...state.taskSet
              .slice(0, state.taskSetIdx + 1)
              .concat([action.payload.oldVal, action.payload.newVal]),
          ],
          taskSetIdx: state.taskSetIdx + 2,
        };
      }
    case "REDO_TASK_SET_HISTORY":
      return {
        ...state,
        taskSetIdx:
          state.taskSetIdx !== state.taskSet.length - 1
            ? ++state.taskSetIdx
            : state.taskSetIdx,
      };
    case "UNDO_TASK_SET_HISTORY":
      return {
        ...state,
        taskSetIdx:
          state.taskSetIdx >= 0 ? --state.taskSetIdx : state.taskSetIdx,
      };
    default:
      return state;
  }
};

export default constructorHistoryReducer;
