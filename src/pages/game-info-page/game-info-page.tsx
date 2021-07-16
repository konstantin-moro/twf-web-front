import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
// intl
import translate from "../../translations/translate";
import { injectIntl } from "react-intl";
// components
import AppTabsList from "../../components/app-tabs-list/app-tabs-list";
import AppTabHeader from "../../components/app-tab-header/app-tab-header";
import AppSpinner from "../../components/app-spinner/app-spinner";
import InfiniteScroll from "react-infinite-scroller";
import { Tab, Tabs } from "react-bootstrap";
// redux
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import {
  selectIsAllLevelTabsFetched,
  selectIsLevelTabsFetching,
  selectLevelTabsCurrentPage,
  selectLevelTabsError,
  selectLevelTabsList,
  selectLevelTabsPageSize,
  selectLevelTabsSortedBy,
  selectLevelTabsSortedDescending,
} from "../../redux/level-tabs/level-tabs-selectors";
import {
  selectIsAllUserTabsFetched,
  selectIsUserTabsFetching,
  selectUserTabsCurrentPage,
  selectUserTabsError,
  selectUserTabsList,
  selectUserTabsPageSize,
  selectUserTabsSortedBy,
  selectUserTabsSortedDescending,
} from "../../redux/user-tabs/user-tabs.selectors";
import { fetchLevelTabsStartAsync } from "../../redux/level-tabs/level-tabs.actions";
import { fetchUserTabsStartAsync } from "../../redux/user-tabs/user-tabs.actions";
// types
import {
  FetchLevelsRequestData,
  LevelsSortingProperty,
} from "../../redux/level-tabs/level-tabs.types";
import {
  FetchUsersRequestData,
  UsersSortingProperty,
} from "../../redux/user-tabs/user-tabs.types";
import { AppTabType } from "../../types/app-tabs/AppTab";
import { AppTabProps } from "../../components/app-tab/app-tab";
// data
import HEADER_TABS_STATE from "../../redux/header-tabs/header-tabs.state";
// styles
import "./game-info-page.scss";
import FetchErrorMessage from "../../components/fetch-error-message/fetch-error-message";
import { LevelAppTabFieldName } from "../../types/app-tabs/LevelAppTab";

interface GameInfoPageProps {
  // using intl obj to insert translation into the tab title attribute
  intl: any;
  // REDUX PROPS
  // users
  userTabs: AppTabProps[];
  isUserTabsFetching: boolean;
  userTabsSortedBy: UsersSortingProperty;
  userTabsPageSize: number;
  userTabsCurrentPage: number;
  isAllUserTabsFetched: boolean;
  usersSortedByDescending: boolean;
  fetchUserTabsStartAsync: (data: FetchUsersRequestData) => void;
  userTabsError: any;
  // levels
  levelTabs: AppTabProps[];
  isLevelTabsFetching: boolean;
  levelTabsSortedBy: LevelsSortingProperty;
  levelTabsPageSize: number;
  levelTabsCurrentPage: number;
  isAllLevelTabsFetched: boolean;
  levelsSortedByDescending: boolean;
  fetchLevelTabsStartAsync: (data: FetchLevelsRequestData) => void;
  levelTabsError: any;
}

const GameInfoPage: React.FC<GameInfoPageProps> = ({
  intl,
  // REDUX PROPS
  // users
  userTabs,
  isUserTabsFetching,
  userTabsSortedBy,
  userTabsPageSize,
  userTabsCurrentPage,
  isAllUserTabsFetched,
  usersSortedByDescending,
  fetchUserTabsStartAsync,
  userTabsError,
  // levels
  levelTabs,
  isLevelTabsFetching,
  levelTabsSortedBy,
  levelTabsPageSize,
  levelTabsCurrentPage,
  isAllLevelTabsFetched,
  levelsSortedByDescending,
  fetchLevelTabsStartAsync,
  levelTabsError,
}) => {
  // translation vars
  const translationPrefix: string = "gameInfoPage";
  const gameNameTitleId: string = translationPrefix + ".gameNameTitle";
  const playersTabId: string = translationPrefix + ".playersTab";
  const levelsTabId: string = translationPrefix + ".levelsTab";

  const { gameCode } = useParams<{ gameCode: any }>();

  useEffect(() => {
    fetchLevelTabsStartAsync({
      userCode: null,
      gameCode,
      sortedBy: LevelsSortingProperty.BY_USERS_COUNT,
      descending: true,
      offset: 0,
      limit: levelTabsPageSize,
    });
    fetchUserTabsStartAsync({
      levelCode: null,
      gameCode,
      sortedBy: UsersSortingProperty.BY_RATING,
      descending: true,
      offset: 0,
      limit: userTabsPageSize,
    });
  }, [gameCode]);

  const nextUsersPage = () => {
    if (!isUserTabsFetching)
      fetchUserTabsStartAsync({
        levelCode: null,
        gameCode,
        sortedBy: userTabsSortedBy,
        descending: usersSortedByDescending,
        offset: userTabsCurrentPage * userTabsPageSize,
        limit: userTabsPageSize,
      });
  };

  const nextLevelsPage = () => {
    if (!isLevelTabsFetching)
      fetchLevelTabsStartAsync({
        userCode: null,
        gameCode,
        sortedBy: levelTabsSortedBy,
        descending: levelsSortedByDescending,
        offset: levelTabsCurrentPage * levelTabsPageSize,
        limit: levelTabsPageSize,
      });
  };

  return (
    <div className="game-info-page u-container">
      <h1>
        {translate(gameNameTitleId)} {gameCode}
      </h1>
      <Tabs defaultActiveKey="players" id="tabs">
        <Tab
          eventKey="players"
          title={intl.formatMessage({ id: playersTabId })}
        >
          <AppTabHeader
            type={AppTabType.USER}
            fields={HEADER_TABS_STATE[AppTabType.USER]}
            refersTo={{ gameCode }}
          />
          {userTabs ? (
            <InfiniteScroll
              loadMore={() => {
                nextUsersPage();
              }}
              hasMore={!isAllUserTabsFetched}
              loader={<AppSpinner key={0} loading={true} />}
            >
              <AppTabsList tabs={userTabs} />
            </InfiniteScroll>
          ) : userTabsError ? (
            <FetchErrorMessage serverError={userTabsError} />
          ) : (
            <AppSpinner loading={true} />
          )}
        </Tab>
        <Tab eventKey="levels" title={intl.formatMessage({ id: levelsTabId })}>
          <AppTabHeader
            type={AppTabType.LEVEL}
            fields={HEADER_TABS_STATE[AppTabType.LEVEL]}
            customFieldIds={[
              {
                name: LevelAppTabFieldName.steps,
                translationId: "appTabHeader.averageSteps",
              },
            ]}
            refersTo={{ gameCode }}
          />
          {levelTabs ? (
            <InfiniteScroll
              loadMore={() => {
                nextLevelsPage();
              }}
              hasMore={!isAllLevelTabsFetched}
              loader={<AppSpinner key={0} loading={true} />}
            >
              <AppTabsList tabs={levelTabs} />
            </InfiniteScroll>
          ) : levelTabsError ? (
            <FetchErrorMessage serverError={levelTabsError} />
          ) : (
            <AppSpinner loading={true} />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

const mapStateToProps = createStructuredSelector<any, any>({
  // user tabs
  userTabs: selectUserTabsList,
  isUserTabsFetching: selectIsUserTabsFetching,
  userTabsSortedBy: selectUserTabsSortedBy,
  usersSortedByDescending: selectUserTabsSortedDescending,
  userTabsPageSize: selectUserTabsPageSize,
  userTabsCurrentPage: selectUserTabsCurrentPage,
  isAllUserTabsFetched: selectIsAllUserTabsFetched,
  userTabsError: selectUserTabsError,
  // level tabs
  levelTabs: selectLevelTabsList,
  isLevelTabsFetching: selectIsLevelTabsFetching,
  levelTabsSortedBy: selectLevelTabsSortedBy,
  levelsSortedByDescending: selectLevelTabsSortedDescending,
  levelTabsPageSize: selectLevelTabsPageSize,
  levelTabsCurrentPage: selectLevelTabsCurrentPage,
  isAllLevelTabsFetched: selectIsAllLevelTabsFetched,
  levelTabsError: selectLevelTabsError,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchLevelTabsStartAsync: (data: FetchLevelsRequestData) =>
    dispatch(fetchLevelTabsStartAsync(data)),
  fetchUserTabsStartAsync: (data: FetchUsersRequestData) =>
    dispatch(fetchUserTabsStartAsync(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(GameInfoPage));
