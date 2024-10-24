import Loader from 'react-loader-spinner';
import { Header } from '../Elements/Header';
import { useStyles } from './MainLayoutUI';
import { useAppSelector } from '../../stores/hooks';

export const MainLayout = ({ children }) => {
  const classes = useStyles();

  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);

  return (
    <>
      <div className={classes.mainLayout} id="main-layout">
        <Header />
        <div className={classes.childrenWrapper}>
          <div className={`${classes.children}`}>{children}</div>
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
