// libs and hooks
import { useLocation, useParams } from "react-router-dom";
// types
import { ConstructorCreationMode } from "../common-types";

const useCreationMode = (): ConstructorCreationMode => {
  const { code } = useParams<{ code: string }>();
  const isCreateByExample = useLocation().search === "?create-by-example";

  if (code && isCreateByExample) {
    return ConstructorCreationMode.CREATE_BY_EXAMPLE;
  } else if (code) {
    return ConstructorCreationMode.EDIT;
  } else {
    return ConstructorCreationMode.CREATE;
  }
};

export default useCreationMode;
