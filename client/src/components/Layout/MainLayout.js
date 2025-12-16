import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Circles } from 'react-loader-spinner';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../stores/hooks';
import { Header } from '../Elements/Header';
import { useStyles } from './MainLayoutUI';

export const MainLayout = ({ children }) => {
  const classes = useStyles();
  const location = useLocation();
  const loadingData = useAppSelector(state => state.dashboard.loadingData);
  const loadingMap = useAppSelector(state => state.map.loadingMap);
  const { t } = useTranslation();
  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);
  const isHomePage = useMemo(() => page === '', [page]);
  const isDashboardPage = useMemo(() => !['user-guide', 'about', 'contact', 'team'].includes(page), [page]);

  return (
    <>
      <div className={classes.mainLayout} id="main-layout">
        <Header />
        <div className={classes.childrenWrapper}>
          <div className={`${classes.children} ${isDashboardPage && !isHomePage ? classes.childrenOrg : ''}`}>
            {children}
          </div>
        </div>
        {(loadingData || loadingMap) && (
          <div className={classes.loading}>
            <Circles color="#6F2F9F" height={60} width={60} />
            <p style={{ marginTop: '16px', color: '#6F2F9F', fontSize: '14px', textAlign: 'center' }}>
              {t('layout.loadingThanks')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
