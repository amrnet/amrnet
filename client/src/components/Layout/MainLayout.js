import Loader from 'react-loader-spinner';
// import LogoImg from '../../assets/img/logo-prod.png';
import { Header } from '../Elements/Header';
import { useStyles } from './MainLayoutUI';
import { useAppSelector } from '../../stores/hooks';

export const MainLayout = ({ children, isHomePage = false }) => {
  const classes = useStyles();

  const page = useAppSelector((state) => state.app.page);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);

  return (
    <>
      <div className={classes.mainLayout} id="main-layout">
        <Header showSelect={isHomePage} />
        <div className={classes.childrenWrapper}>
          <div
            className={`${classes.children} ${page === 'home' ? '' : classes.otherPage}`}
          >
            {children}
          </div>
        </div>
      </div>
      {(loadingData || loadingMap) && (
        <div className={classes.loading}>
          {/* <img className={classes.logo} src={LogoImg} alt="AMRnet" /> */}
          <Loader type="Circles" color="#6F2F9F" height={70} width={70} />
        </div>
      )}
    </>
  );
};
