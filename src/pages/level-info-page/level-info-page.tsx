import React, { useEffect } from "react";
import translate from "../../translations/translate";
import { useParams } from "react-router-dom";
// redux
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
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
// components
import AppTabHeader from "../../components/app-tab-header/app-tab-header";
import AppTabsList from "../../components/app-tabs-list/app-tabs-list";
import InfiniteScroll from "react-infinite-scroller";
import AppSpinner from "../../components/app-spinner/app-spinner";
import FetchErrorMessage from "../../components/fetch-error-message/fetch-error-message";
// types
import { AppTabType } from "../../types/app-tabs/AppTab";
import { FetchLevelsRequestData } from "../../redux/level-tabs/level-tabs.types";
import { AppTabProps } from "../../components/app-tab/app-tab";
import {
  FetchUsersRequestData,
  UsersSortingProperty,
} from "../../redux/user-tabs/user-tabs.types";
// data
import HEADER_TABS_STATE from "../../redux/header-tabs/header-tabs.state";
// styles
import "./level-info-page.scss";

interface LevelInfoPageProps {
  // redux props
  userTabs: AppTabProps[] | null;
  isUserTabsFetching: boolean;
  isAllUserTabsFetched: boolean;
  userTabsSortedBy: UsersSortingProperty;
  usersSortedByDescending: boolean;
  userTabsPageSize: number;
  userTabsCurrentPage: number;
  userTabsError: any;
  fetchUserTabsStartAsync: (data: FetchUsersRequestData) => void;
}
const LevelInfoPage: React.FC<LevelInfoPageProps> = ({
  userTabs,
  isUserTabsFetching,
  isAllUserTabsFetched,
  userTabsSortedBy,
  usersSortedByDescending,
  userTabsPageSize,
  userTabsCurrentPage,
  userTabsError,
  fetchUserTabsStartAsync,
}) => {
  // translation vars
  const translationPrefix: string = "levelInfoPage";
  const titleId: string = translationPrefix + ".title";
  const completedLevelPlayersId: string =
    translationPrefix + ".completedLevelPlayers";
  // other
  const { levelCode } = useParams<{ levelCode: any }>();

  useEffect(() => {
    fetchUserTabsStartAsync({
      levelCode,
      gameCode: null,
      sortedBy: UsersSortingProperty.BY_RATING,
      descending: true,
      offset: 0,
      limit: userTabsPageSize,
    });
  }, [levelCode]);

  const nextUsersPage = () => {
    if (!isUserTabsFetching)
      fetchUserTabsStartAsync({
        levelCode,
        gameCode: null,
        sortedBy: userTabsSortedBy,
        descending: usersSortedByDescending,
        offset: userTabsCurrentPage * userTabsPageSize,
        limit: userTabsPageSize,
      });
  };

  return (
    <div className="level-info-page u-container">
      <h1>
        {translate(titleId)}: {levelCode}
      </h1>
      <h1>{translate(completedLevelPlayersId)}:</h1>
      <AppTabHeader
        type={AppTabType.USER}
        fields={HEADER_TABS_STATE[AppTabType.USER]}
        refersTo={{ levelCode }}
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
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  fetchLevelTabsStartAsync: (data: FetchLevelsRequestData) =>
    dispatch(fetchLevelTabsStartAsync(data)),
  fetchUserTabsStartAsync: (data: FetchUsersRequestData) =>
    dispatch(fetchUserTabsStartAsync(data)),
});

const mapStateToProps = createStructuredSelector<any, any>({
  userTabs: selectUserTabsList,
  isUserTabsFetching: selectIsUserTabsFetching,
  isAllUserTabsFetched: selectIsAllUserTabsFetched,
  userTabsError: selectUserTabsError,
  userTabsSortedBy: selectUserTabsSortedBy,
  usersSortedByDescending: selectUserTabsSortedDescending,
  userTabsPageSize: selectUserTabsPageSize,
  userTabsCurrentPage: selectUserTabsCurrentPage,
});

export default connect(mapStateToProps, mapDispatchToProps)(LevelInfoPage);
