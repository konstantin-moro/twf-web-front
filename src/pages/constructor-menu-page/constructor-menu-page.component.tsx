// libs and hooks
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
// components
import AppModalComponent from "../../components/app-modal/app-modal.component";
import SelectConstructorItemList from "../../components/filterable-select-list/filterable-select-list.component";
import ConstructorMenuBlock from "../../components/constructor-menu-block/constructor-menu-block.component";
// utils
import TaskSetConstructorRequestsHandler from "../../constructors/task-set-constructor/task-set-constructor.requests-handler";
import NamespaceConstructorRequestHandler from "../../constructors/namespace-constructor/namespace-constructor.requests-handler";
import { getLastEditedConstructorItemsFromLocalStorage } from "../../utils/last-edited-constructor-items-local-storage";
// types
import { NamespaceReceivedForm } from "../../constructors/namespace-constructor/namespace-constructor.types";
import { TaskSetConstructorReceivedForm } from "../../constructors/task-set-constructor/task-set-constructor.types";
import { FilterableSelectListItem } from "../../components/filterable-select-list/filterable-select-list.types";
import { ConstructorMenuBlockProps } from "../../components/constructor-menu-block/constructor-menu-block.types";
// icons
import Icon from "@mdi/react";
import { mdiPencil, mdiPlus } from "@mdi/js";
// styles
import "./constructor-menu-page.styles.scss";
import RulePackConstructorRequestsHandler from "../../constructors/rule-pack-constructor/rule-pack-constructor.requests-handler";
import { RulePackConstructorReceivedForm } from "../../constructors/rule-pack-constructor/rule-pack-constructor.types";

export const demoList = [
  "Alison Park",
  "Jackson Berger",
  "Keri Dawson",
  "Eva Gilbert",
  "Michael Edwards",
  "Delores Salazar",
  "Etta Tyson",
  "Nita Herrera",
  "Fields Chavez",
  "Aurelia Knapp",
  "Patel Hatfield",
  "Blackwell Gilmore",
  "Randolph Mayo",
  "Maureen Romero",
  "Elva Hopkins",
  "Allyson Sloan",
  "Jeri Grimes",
  "Myrtle Willis",
  "Mclean Hodges",
  "Lana Hayes",
];

export const usersDemoList = demoList.map((item: string) => ({
  label: item,
  value: item,
}));

type Tab = "taskSet" | "namespace" | "rulePack";

const ConstructorMenuPageComponent: React.FC = () => {
  const tabs: Tab[] = ["taskSet", "namespace", "rulePack"];
  const { activeTab } = useParams<{ activeTab: any }>();
  const [currentTab, setCurrentTab] = useState<Tab>(tabs[0]);
  const [showAllItemsModal, setShowAllItemsModal] = useState(false);
  const history = useHistory();
  const [items, setItems] = useState<FilterableSelectListItem[]>([]);
  const [propsToFilter, setPropsToFilter] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab && tabs.includes(activeTab)) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const [rulePacks, setRulePacks] = useState<RulePackConstructorReceivedForm[]>(
    []
  );
  const [taskSets, setTaskSets] = useState<TaskSetConstructorReceivedForm[]>(
    []
  );
  const [namespaces, setNamespaces] = useState<NamespaceReceivedForm[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isFetched, setIsFetched] = useState<boolean>(false);

  useEffect(() => {
    setIsFetched(false);
    if (currentTab === "taskSet") {
      TaskSetConstructorRequestsHandler.getAll()
        .then((res: TaskSetConstructorReceivedForm[]) => {
          setTaskSets(res);
          setIsFetched(true);
        })
        .catch((e: AxiosError) => {
          console.error("Error fetching task-sets", e.message);
          setIsFetched(true);
        });
    } else if (currentTab === "rulePack") {
      RulePackConstructorRequestsHandler.getAll()
        .then((res: RulePackConstructorReceivedForm[]) => {
          setRulePacks(res);
          setIsFetched(true);
        })
        .catch((e: AxiosError) => {
          setIsFetched(true);
          console.error("Error fetching rule-packs", e.message);
        });
    } else if (currentTab === "namespace") {
      NamespaceConstructorRequestHandler.getAll()
        .then((res: NamespaceReceivedForm[]) => {
          setNamespaces(res);
          setErrorMsg(null);
          setIsFetched(true);
        })
        .catch((e: AxiosError) => {
          setIsFetched(true);
          console.error("Error fetching rule-packs", e.message);
        });
    }
  }, [currentTab]);

  const gameBlocks: any = [
    {
      title: "Создать новый набор задач",
      titleIconUrl: mdiPlus,
      options: [
        {
          name: "С нуля",
          action: () => history.push("/constructor/task-set/"),
        },
        {
          name: "На основе уже существующей",
          action: () => {
            setItems(
              taskSets.map((taskSet: TaskSetConstructorReceivedForm) => {
                const { code, nameRu, namespaceCode } = taskSet;
                return {
                  code,
                  name: nameRu,
                  namespaceCode,
                  onSelect: (): void => {
                    history.push(
                      "/constructor/task-set/" + code + "?create-by-example"
                    );
                  },
                };
              })
            );
            setPropsToFilter(["namespaceCode"]);
            setShowAllItemsModal(true);
          },
        },
      ],
    },
    {
      title: "Редактировать существующие наборы задач",
      titleIconUrl: mdiPencil,
      options:
        getLastEditedConstructorItemsFromLocalStorage(
          "last-edited-task-sets"
        ) !== null
          ? // @ts-ignore
          getLastEditedConstructorItemsFromLocalStorage(
            "last-edited-task-sets"
          )
            .map((taskSet) => ({
              name: taskSet,
              action: () =>
                // @ts-ignore
                history.push("/constructor/task-set/" + taskSet),
            }))
            .concat([
              {
                name: "Смотреть все",
                action: () => {
                  setItems(
                    taskSets.map(
                      (taskSet: TaskSetConstructorReceivedForm) => {
                        const { code, nameRu, namespaceCode } = taskSet;
                        return {
                          code,
                          name: nameRu,
                          namespaceCode,
                          onSelect: (): void => {
                            history.push("/constructor/task-set/" + code);
                          },
                        };
                      }
                    )
                  );
                  setPropsToFilter(["namespaceCode"]);
                  setShowAllItemsModal(true);
                },
              },
            ])
          : [
            {
              name: "Смотреть все",
              action: () => {
                setItems(
                  taskSets.map((taskSet: TaskSetConstructorReceivedForm) => {
                    const { code, nameRu, namespaceCode } = taskSet;
                    return {
                      code,
                      name: nameRu,
                      namespaceCode,
                      onSelect: (): void => {
                        history.push("/constructor/task-set/" + code);
                      },
                    };
                  })
                );
                setPropsToFilter(["namespaceCode"]);
                setShowAllItemsModal(true);
              },
            },
          ],
    },
  ];

  const gameSpaceBlocks: any = [
    {
      title: "Создать новый Namespace",
      titleIconUrl: mdiPlus,
      options: [
        {
          name: "С нуля",
          action: () => history.push("/constructor/namespace"),
        },
        {
          name: "На основе уже существующего",
          action: () => {
            setItems(
              namespaces.map((namespace: NamespaceReceivedForm) => {
                const { code } = namespace;
                return {
                  name: code,
                  onSelect: (): void => {
                    history.push(
                      "/constructor/namespace/" + code + "?create-by-example"
                    );
                  },
                };
              })
            );
            setPropsToFilter([]);
            setShowAllItemsModal(true);
          },
        },
      ],
    },
    {
      title: "Редактировать существующий Namespace",
      titleIconUrl: mdiPencil,
      options:
        getLastEditedConstructorItemsFromLocalStorage(
          "last-edited-namespaces"
        ) !== null
          ? // @ts-ignore
          getLastEditedConstructorItemsFromLocalStorage(
            "last-edited-namespaces"
          )
            .map((namespaceCode) => ({
              name: namespaceCode,
              action: () =>
                // @ts-ignore
                history.push("/constructor/namespace/" + namespaceCode),
            }))
            .concat([
              {
                name: "Смотреть все",
                action: () => {
                  setItems(
                    namespaces.map((namespace: NamespaceReceivedForm) => {
                      const { code } = namespace;
                      return {
                        code,
                        name: code,
                        onSelect: (): void => {
                          history.push("/constructor/namespace/" + code);
                        },
                      };
                    })
                  );
                  setPropsToFilter([]);
                  setShowAllItemsModal(true);
                },
              },
            ])
          : [
            {
              name: "Смотреть все",
              action: () => {
                setItems(
                  namespaces.map((namespace: NamespaceReceivedForm) => {
                    const { code } = namespace;
                    return {
                      code,
                      name: code,
                      onSelect: (): void => {
                        history.push("/constructor/namespace/" + code);
                      },
                    };
                  })
                );
                setPropsToFilter([]);
                setShowAllItemsModal(true);
              },
            },
          ],
    },
  ];

  const rulePacksBlocks: any = [
    {
      title: "Создать новый пакет правил",
      titleIconUrl: mdiPlus,
      options: [
        {
          name: "С нуля",
          action: () => history.push("/constructor/rule-pack"),
        },
        {
          name: "На основе уже существующего",
          action: () => {
            setItems(
              rulePacks.map((rulePack: any) => {
                const { code, nameRu, namespaceCode } = rulePack;
                return {
                  code,
                  name: nameRu,
                  namespaceCode,
                  onSelect: (): void => {
                    history.push(
                      "/constructor/rule-pack/" + code + "?create-by-example"
                    );
                  },
                };
              })
            );
            setPropsToFilter(["namespaceCode"]);
            setShowAllItemsModal(true);
          },
        },
      ],
    },
    {
      title: "Редактировать существующий пакет правил",
      titleIconUrl: mdiPencil,
      options:
        getLastEditedConstructorItemsFromLocalStorage(
          "last-edited-rule-packs"
        ) !== null
          ? // @ts-ignore
          getLastEditedConstructorItemsFromLocalStorage(
            "last-edited-rule-packs"
          )
            .map((rulePack) => ({
              name: rulePack,
              action: () =>
                // @ts-ignore
                history.push("/constructor/rule-pack/" + rulePack),
            }))
            .concat([
              {
                name: "Смотреть все",
                action: () => {
                  setItems(
                    rulePacks.map((rulePack: any) => {
                      const { code, nameRu, namespaceCode } = rulePack;
                      return {
                        code,
                        name: nameRu,
                        namespaceCode,
                        onSelect: (): void => {
                          history.push("/constructor/rule-pack/" + code);
                        },
                      };
                    })
                  );
                  setPropsToFilter(["namespaceCode"]);
                  setShowAllItemsModal(true);
                },
              },
            ])
          : [
            {
              name: "Смотреть все",
              action: () => {
                setItems(
                  rulePacks.map((rulePack: any) => {
                    const { code, nameRu, namespaceCode } = rulePack;
                    return {
                      code,
                      name: nameRu,
                      namespaceCode,
                      onSelect: (): void => {
                        history.push("/constructor/rule-pack/" + code);
                      },
                    };
                  })
                );
                setPropsToFilter(["namespaceCode"]);
                setShowAllItemsModal(true);
              },
            },
          ],
    },
  ];

  return (
    <div className="constructor-menu-page">
      <ul className="constructor-menu-page__tabs">
        <li
          className={`constructor-menu-page__tab ${currentTab === tabs[0] && "constructor-menu-page__tab--active"
            }`}
          onClick={() => history.push("/constructor-menu/" + tabs[0])}
        >
          Наборы задач
        </li>
        <li
          className={`constructor-menu-page__tab ${currentTab === tabs[1] && "constructor-menu-page__tab--active"
            }`}
          onClick={() => history.push("/constructor-menu/" + tabs[1])}
        >
          Namespaces
        </li>
        <li
          className={`constructor-menu-page__tab ${currentTab === tabs[2] && "constructor-menu-page__tab--active"
            }`}
          onClick={() => history.push("/constructor-menu/" + tabs[2])}
        >
          Пакеты Правил
        </li>
      </ul>
      <div className="constructor-menu-page__blocks">
        {currentTab === tabs[0] &&
          gameBlocks.map((block: ConstructorMenuBlockProps, i: number) => {
            return (
              <ConstructorMenuBlock
                key={i}
                {...block}
                isDataFetched={isFetched}
              />
            );
          })}
        {currentTab === tabs[1] &&
          gameSpaceBlocks.map((block: ConstructorMenuBlockProps, i: number) => {
            return (
              <ConstructorMenuBlock
                key={i}
                {...block}
                isDataFetched={isFetched}
              />
            );
          })}
        {currentTab === tabs[2] &&
          rulePacksBlocks.map((block: ConstructorMenuBlockProps, i: number) => {
            return (
              <ConstructorMenuBlock
                key={i}
                {...block}
                isDataFetched={isFetched}
              />
            );
          })}
      </div>
      <AppModalComponent
        isOpen={showAllItemsModal}
        close={() => setShowAllItemsModal(false)}
        width="50%"
        height="70%"
      >
        <SelectConstructorItemList
          items={items}
          propsToFilter={propsToFilter}
        />
      </AppModalComponent>
    </div>
  );
};

export default ConstructorMenuPageComponent;
