import { ExpandLess, ExpandMore, Menu } from '@mui/icons-material';
import { AppBar, Box, Collapse, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoImg from '../../../assets/img/logo-prod.png';
import LSHTMImg from '../../../assets/img/LSHTM.Logo.png';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setOpenDrawer } from '../../../stores/slices/appSlice.ts';
import LanguageSwitcher from '../../LanguageSwitcher';
import { Drawer } from '../Drawer';
import { InformationCards } from '../InformationCards/InformationCards';
import { MenuHead } from '../MenuHead';
import { SelectOrganism } from '../SelectOrganism';
import { useStyles } from './HeaderMUI';

export const Header = () => {
  const classes = useStyles();
  const location = useLocation();
  const matches650 = useMediaQuery('(max-width: 650px)');
  // const matches500 = useMediaQuery('(max-width: 500px)');
  const matches999 = useMediaQuery('(max-width: 999px)');
  const matches200 = useMediaQuery('(min-width: 200px)');
  const matches1000 = useMediaQuery('(min-width: 1000px)');

  const [infoCollapse, setInfoCollapse] = useState(false);

  const dispatch = useAppDispatch();
  const organism = useAppSelector(state => state.dashboard.organism);

  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);
  const isHomePage = useMemo(() => page === '', [page]);
  const isDashboardPage = useMemo(() => !['user-guide', 'about', 'contact', 'team'].includes(page), [page]);

  // function getPageTitle() {
  //   const title = menuItems.find((item) => item.key === page).labelHead;
  //   if (title === 'Team') return 'About';
  //   return title;
  // }

  function handleToggleDrawer(event, value) {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    dispatch(setOpenDrawer(value));
  }
  function handleToggleCollapse() {
    setInfoCollapse(!infoCollapse);
  }
  return (
    <div className={classes.headerWrapper}>
      <div className={classes.headerBox}></div>
      <AppBar position="relative" sx={{ maxWidth: '1280px' }} className={classes.appBar}>
        <Toolbar className={`${classes.toolbar} `}>
          <div
            className={`${classes.toolbarWrapper} ${
              isDashboardPage ? (isHomePage ? classes.homeHead : classes.defaultHead) : classes.dashboardHead
            }`}
          >
            <div className={`${classes.leftWrapper} `}>
              <div className={classes.drawerTitleWrapper}>
                {((isDashboardPage && !isHomePage) || matches999) && (
                  <IconButton edge="start" color="inherit" onClick={event => handleToggleDrawer(event, true)}>
                    <Menu sx={{ fontSize: '1.7rem' }} />
                  </IconButton>
                )}
                <Link to="/">
                  <img src={LogoImg} alt="AMRnet" className={classes.logo} />
                </Link>
              </div>
              {isDashboardPage && !isHomePage && <SelectOrganism />}
            </div>
            {((!isDashboardPage && matches1000) || (isHomePage && !matches999)) && <MenuHead />}
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <LanguageSwitcher />
              {(!isDashboardPage || isHomePage) && matches200 && (
                <a href="https://www.lshtm.ac.uk/amrnet" target="_blank" rel="noopener noreferrer">
                  <img src={LSHTMImg} alt="AMRnet" className={classes.logo} />
                </a>
              )}
            </Box>
            {/* {!isHomePage && !isDashboardPage && !matches500 && (
              <Typography className={classes.title} variant={matches500 ? 'h6' : 'h5'} fontWeight={500}>
                {getPageTitle()}
              </Typography>
            )} */}

            {isDashboardPage &&
              !isHomePage &&
              (matches650 ? (
                organism !== 'none' && (
                  <IconButton onClick={handleToggleCollapse}>
                    {infoCollapse ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )
              ) : (
                <InformationCards />
              ))}
          </div>
          <Collapse className={classes.infoCollapse} in={infoCollapse} timeout="auto" unmountOnExit>
            <InformationCards />
          </Collapse>
        </Toolbar>
        <Drawer />
      </AppBar>
    </div>
  );
};
