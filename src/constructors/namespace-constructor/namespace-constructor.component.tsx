// libs and hooks
import React, { Dispatch, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
// custom hooks
import useCreationMode from "../hooks/useCreationType";
// lib components
import { ClipLoader } from "react-spinners";
// custom components
import ServerResponseAlert from "../../components/server-response-alert/server-response-alert.component";
import ConstructorForm from "../../components/constructor-form/constructor-form";
// redux
import { selectNamespaceJSON } from "../../redux/constructor-jsons/constructor-jsons.selectors";
import { updateNamespaceJSON } from "../../redux/constructor-jsons/constructor-jsons.actions";
import { connect, ConnectedProps } from "react-redux";
import { createStructuredSelector } from "reselect";
import CONSTRUCTOR_JSONS_INITIAL_STATE from "../../redux/constructor-jsons/constructor-jsons.state";
// types
import {
  NamespaceConstructorInputs,
  NamespaceGrantType,
} from "./namespace-constructor.types";
import { ConstructorCreationMode } from "../common-types";
import {
  ConstructorJSONType,
  UpdateNamespaceJSONAction,
} from "../../redux/constructor-jsons/constructor-jsons.types";
import { FetchedUser, getAllUsers } from "../common-server-requests";
import { LabeledValue } from "antd/es/select";
import { RootState } from "../../redux/root-reducer";
import { ConstructorFormInput } from "../../components/constructor-form/constructor-form.types";
// utils
import getConstructorSubmitButtonAndTitleText from "../utiils/get-constructor-submit-button-and-title-text";
import { getGrantTypeUserReadableDescription } from "./namespace-constructor.utils";
import NamespaceConstructorFormatter from "./namespace-constructor.formatter";
import { addLastEditedConstructorItemToLocalStorage } from "../../utils/last-edited-constructor-items-local-storage";
import NamespaceConstructorRequestHandler from "./namespace-constructor.requests-handler";
import { setConstructorValueDueToCreationMode } from "../utils";
import {
  getLastEditedCreationMode,
  getLastExampleConstructorCode,
  setLastEditedCreationMode,
  setLastExampleConstructorCode,
} from "../../utils/local-storage/last-edited-creation-type";
// styles
import "./namespace-constructor.styles.scss";

const NamespaceConstructorComponent = ({
  namespaceJSON,
  updateNamespaceJSON,
}: ConnectedProps<typeof connector>): JSX.Element => {
  // get code from url
  const { code: namespaceCode } = useParams<{ code: any }>();

  // get creation mode using custom hook
  const creationMode: ConstructorCreationMode = useCreationMode();

  // react-hook-form core functions
  const reactHookFormFunctions = useForm<NamespaceConstructorInputs>({
    mode: "onSubmit",
    shouldUnregister: false,
  });
  const { getValues, reset, handleSubmit, watch } = reactHookFormFunctions;

  const titleAndSubmitButtonText: string = getConstructorSubmitButtonAndTitleText(
    creationMode,
    ConstructorJSONType.NAMESPACE,
    namespaceCode
  );

  // server response messages
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const [successMsg, setSuccessMsg] = useState<null | string>(null);

  // items to fetch from the server
  const [usersSelectOptions, setUsersSelectOptions] = useState<LabeledValue[]>(
    []
  );

  // show spinner while fetching
  const [showSpinner, setShowSpinner] = useState<boolean>(
    creationMode !== ConstructorCreationMode.CREATE
  );

  // watch in order to conditionally render dependent fields
  const grantType: NamespaceGrantType = watch("grantType");

  const inputs: ConstructorFormInput[] = [
    {
      name: "code",
      label: "Код",
      type: "text",
      disabled: creationMode === ConstructorCreationMode.EDIT,
    },
    {
      name: "grantType",
      label: "Доступ к чтению",
      isMulti: false,
      options: [
        NamespaceGrantType.PUBLIC_READ_WRITE,
        NamespaceGrantType.PRIVATE_READ_WRITE,
        NamespaceGrantType.PUBLIC_READ_PRIVATE_WRITE,
      ].map((accessMode: NamespaceGrantType) => {
        return {
          label: getGrantTypeUserReadableDescription(accessMode),
          value: accessMode,
        };
      }),
    },
    {
      name: "readGrantedUsers",
      label: "Пользователи с правом чтения",
      isMulti: true,
      options: usersSelectOptions,
      isRendered: grantType === NamespaceGrantType.PRIVATE_READ_WRITE,
    },
    {
      name: "writeGrantedUsers",
      label: "Пользователи с правом редактирования",
      isMulti: true,
      options: usersSelectOptions,
      isRendered:
        grantType === NamespaceGrantType.PUBLIC_READ_PRIVATE_WRITE ||
        grantType === NamespaceGrantType.PRIVATE_READ_WRITE,
    },
  ];

  // fetching all necessary entities
  // TODO: catch block
  useEffect(() => {
    getAllUsers()
      .then((res: FetchedUser[]) => {
        setUsersSelectOptions(
          res.map((user: FetchedUser) => ({
            label: user.login,
            value: user.code,
          }))
        );
      })
      .catch(() => { });
  }, []);

  // set values due to creation mode and relevant constructor state
  useEffect(() => {
    setConstructorValueDueToCreationMode(
      ConstructorJSONType.NAMESPACE,
      creationMode,
      getLastEditedCreationMode(ConstructorJSONType.NAMESPACE),
      reset,
      CONSTRUCTOR_JSONS_INITIAL_STATE.namespace,
      setLastEditedCreationMode,
      namespaceJSON,
      updateNamespaceJSON,
      namespaceCode,
      async () => {
        const res = await NamespaceConstructorRequestHandler.getOne(
          namespaceCode
        );
        return NamespaceConstructorFormatter.convertReceivedFormToConstructorInputs(
          res
        );
      },
      getLastExampleConstructorCode(ConstructorJSONType.NAMESPACE),
      namespaceCode,
      setLastExampleConstructorCode
    ).then(() => {
      setShowSpinner(false);
    });
  }, []);

  const submitNamespace = (
    data: NamespaceConstructorInputs,
    creationMode: ConstructorCreationMode
  ): void => {
    NamespaceConstructorRequestHandler.submitOne(
      creationMode === ConstructorCreationMode.EDIT ? "patch" : "post",
      NamespaceConstructorFormatter.convertConstructorInputsToSendForm(data)
    )
      .then(() => {
        setErrorMsg(null);
        setSuccessMsg(
          creationMode === ConstructorCreationMode.EDIT
            ? "Namespace успешно изменен!"
            : "Namespace успешно создан!"
        );
        addLastEditedConstructorItemToLocalStorage(
          "last-edited-namespaces",
          data.code
        );
      })
      .catch(() => {
        setSuccessMsg(null);
        setErrorMsg("Произошла ошибка!");
      });
  };

  if (showSpinner) {
    return (
      <div style={{ margin: "2rem" }}>
        <ClipLoader loading={showSpinner} />
      </div>
    );
  } else {
    return (
      <FormProvider {...reactHookFormFunctions}>
        <form
          className="namespace-constructor"
          onSubmit={handleSubmit(() => {
            submitNamespace(getValues(), creationMode);
          })}
        >
          <h1>{titleAndSubmitButtonText}</h1>
          <ConstructorForm
            inputs={inputs}
            constructorType={ConstructorJSONType.NAMESPACE}
          />
          <ServerResponseAlert errorMsg={errorMsg} successMsg={successMsg} />
          <button type="submit" className="btn u-mr-sm">
            {titleAndSubmitButtonText}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              console.log(getValues());
            }}
          >
            log values
          </button>
        </form>
      </FormProvider>
    );
  }
};

// connecting redux props
const mapState = createStructuredSelector<
  RootState,
  {
    namespaceJSON: NamespaceConstructorInputs;
  }
>({
  namespaceJSON: selectNamespaceJSON,
});

const mapDispatch = (dispatch: Dispatch<UpdateNamespaceJSONAction>) => ({
  updateNamespaceJSON: (namespaceJSON: NamespaceConstructorInputs) =>
    dispatch(updateNamespaceJSON(namespaceJSON)),
});

const connector = connect(mapState, mapDispatch);

export default connector(NamespaceConstructorComponent);
