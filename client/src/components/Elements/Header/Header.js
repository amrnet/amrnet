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

export const Header = ({ showSelect }) => {
  const classes = useStyles();
  const matches650 = useMediaQuery('(max-width: 650px)');
  const matches500 = useMediaQuery('(max-width: 500px)');
  const [infoCollapse, setInfoCollapse] = useState(false);

  const dispatch = useAppDispatch();
  const page = useAppSelector((state) => state.app.page);
  const organism = useAppSelector((state) => state.dashboard.organism);

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
        <Toolbar className={`${classes.toolbar} ${page === 'home' ? '' : classes.otherPage}`}>
          <div className={classes.toolbarWrapper}>
            <div className={classes.leftWrapper}>
              <div className={classes.drawerTitleWrapper}>
                <IconButton edge="start" color="inherit" onClick={(event) => handleToggleDrawer(event, true)}>
                  <Menu sx={{ fontSize: '1.7rem' }} />
                </IconButton>
                <Link to="/">
                  <img src={LogoImg} alt="AMRnet" className={classes.logo} />
                </Link>

              </div>
              { <SelectOrganism />}
            </div>
            {/* {!showSelect && (
              <Typography className={classes.title} variant={matches500 ? 'h6' : 'h5'} fontWeight={500}>
                {getPageTitle()}
              </Typography>
            )} */}
            {
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
