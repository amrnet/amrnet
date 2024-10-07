import { AppBar, Collapse, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './HeaderMUI';
import LogoImg from '../../../assets/img/logo-prod.png';
import { ExpandLess, ExpandMore, Menu } from '@mui/icons-material';
import { Drawer } from '../Drawer';
import { SelectOrganism } from '../SelectOrganism';
import { InformationCards } from '../InformationCards/InformationCards';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setOpenDrawer } from '../../../stores/slices/appSlice.ts';
import { menuItems } from '../../../util/menuItems';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuHead } from '../MenuHead';

export const Header = () => {
  const classes = useStyles();
  const location = useLocation();
  const matches650 = useMediaQuery('(max-width: 650px)');
  const matches500 = useMediaQuery('(max-width: 500px)');
  const matches800 = useMediaQuery('(max-width: 800px)');
  const [infoCollapse, setInfoCollapse] = useState(false);

  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.app.page);
  const organism = useAppSelector((state) => state.dashboard.organism);

  const isHomePage = useMemo(() => location.pathname === '/', [location.pathname]);
  const isDashboardPage = useMemo(
    () => !['/', '/user-guide', '/about'].includes(location.pathname),
    [location.pathname],
  );

  function getPageTitle() {
    const title = menuItems.find((item) => item.key === page).labelHead;

    return title;
  }

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
          <div className={`${classes.toolbarWrapper}`}>
            <div className={`${classes.leftWrapper}`}>
              <div className={classes.drawerTitleWrapper}>
                {(!isHomePage && (!isDashboardPage || matches800)) && (
                  <IconButton edge="start" color="inherit" onClick={(event) => handleToggleDrawer(event, true)}>
                    <Menu sx={{ fontSize: '1.7rem' }} />
                  </IconButton>
                )}
                <Link to="/">
                  <img src={LogoImg} alt="AMRnet" className={classes.logo} />
                </Link>
              </div>
              {isDashboardPage && <SelectOrganism />}
            </div>
            {isHomePage && !isDashboardPage && !matches800 && <MenuHead />}
            {!isHomePage && !isDashboardPage && (
              <Typography className={classes.title} variant={matches500 ? 'h6' : 'h5'} fontWeight={500}>
                {getPageTitle()}
              </Typography>
            )}

            {isDashboardPage &&
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
