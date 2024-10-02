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
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {MenuHead} from '../LandingPage/MenuHead';

export const Header = ({ showSelect, showSelect2 }) => {
  // console.log("showSelect", showSelect, showSelect2);
  const classes = useStyles();
  const matches650 = useMediaQuery('(max-width: 650px)');
  const matches500 = useMediaQuery('(max-width: 500px)');
  const [infoCollapse, setInfoCollapse] = useState(false);

  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.app.page);
  const organism = useAppSelector((state) => state.dashboard.organism);

  function getPageTitle() {
    console.log("menuItems", menuItems)
    const title = menuItems.find((item) => item.key === page).labelHead;
    console.log("title", title)
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
  console.log("showSelect2", showSelect2);

  return (
    <div className={classes.headerWrapper}>
      <div className={classes.headerBox}></div>
      <AppBar position="relative" sx={{ maxWidth: '1280px' }} className={classes.appBar}>
        <Toolbar className={`${classes.toolbar} `}>
          <div className={`${classes.toolbarWrapper} ${!showSelect2 ? classes.dashboardHead : ''}`}>
            <div className={`${classes.leftWrapper} ${showSelect2 ? classes.landingPageHeadOnly : ''}`}>
              <div className={classes.drawerTitleWrapper}>
                <IconButton edge="start" color="inherit" onClick={(event) => handleToggleDrawer(event, true)}>
                  <Menu sx={{ fontSize: '1.7rem' }} />
                </IconButton>
                <Link to="/">
                  <img src={LogoImg} alt="AMRnet" className={classes.logo} />
                </Link>

              </div>
              {showSelect && <SelectOrganism />}
            </div>
            {showSelect2 ? <MenuHead/>: null}
            {!(showSelect || showSelect2) && (
              <Typography className={classes.title} variant={matches500 ? 'h6' : 'h5'} fontWeight={500}>
                {getPageTitle()}
              </Typography>
            )}
            
            {showSelect &&
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
