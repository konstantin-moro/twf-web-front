import React from "react";
import { injectIntl } from "react-intl";

import { Modal, Tab, Tabs } from "react-bootstrap";

import LoginFormComponent from "../forms/login-form/login-form.component";
import RegisterFormComponent from "../forms/regiser-form/register-form.component";

import "./login-register-modal.scss";

interface LoginRegisterModalProps {
  showModal: boolean;
  setShowModal: (status: boolean) => void;
  intl: any;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  showModal,
  setShowModal,
  intl,
}) => {
  // translation vars
  const translationPrefix: string = "loginRegisterModal";
  const loginTabId: string = translationPrefix + ".loginTab";
  const registerTabId: string = translationPrefix + ".registerTab";

  return (
    <div className="login-register-modal">
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Tabs defaultActiveKey="login" id="login-register-tabs">
          <Tab
            eventKey="login"
            title={intl.formatMessage({ id: loginTabId })}
            className="login-register-modal__form"
          >
            <LoginFormComponent hideModal={() => setShowModal(false)} />
          </Tab>
          <Tab
            eventKey="register"
            title={intl.formatMessage({ id: registerTabId })}
            className="login-register-modal__form"
          >
            <RegisterFormComponent hideModal={() => setShowModal(false)} />
          </Tab>
        </Tabs>
      </Modal>
    </div>
  );
};

export default injectIntl(LoginRegisterModal);
