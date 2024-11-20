import Loader from 'react-loader-spinner';
import { Header } from '../Elements/Header';
import { useStyles } from './MainLayoutUI';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../stores/hooks';
import { Link, useLocation } from 'react-router-dom';

export const MainLayout = ({ children }) => {
  const classes = useStyles();
  const location = useLocation();
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);
  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);
  const isHomePage = useMemo(() => page === '', [page]);
  const isDashboardPage = useMemo(() => !['user-guide', 'about', 'contact','team'].includes(page), [page]);

  return (
    <>
      <div className={classes.mainLayout} id="main-layout">
        <Header />
        <div className={classes.childrenWrapper}>
          <div className={`${classes.children} ${isDashboardPage && !isHomePage ? classes.childrenOrg:''}`}>{children}</div>
        </div>
      </div>
      {(loadingData || loadingMap) && (
        <div className={classes.loading}>
          <Loader type="Circles" color="#6F2F9F" height={70} width={70} />
        </div>
      )}
    </>
  );
};
