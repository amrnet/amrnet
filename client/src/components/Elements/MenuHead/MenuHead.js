import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../stores/hooks';
import { setPage } from '../../../stores/slices/appSlice';
import { menuItems } from '../../../util/menuItems';
import { useStyles } from './MenuHeadMUI';
import { Button, Toolbar } from '@mui/material';
import { useMemo } from 'react';

export const MenuHead = () => {
  const classes = useStyles();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function handleClick(page) {
    dispatch(setPage(page));
  }

  const currentMenuItems = useMemo(() => {
    if (location.pathname === '/about') {
      return menuItems.filter((item) => item.key !== 'about');
    }

    return menuItems.filter((item) => item.key !== 'home');
  }, [location.pathname]);

  return (
    <div className={classes.menuHead}>
      <Toolbar className={classes.toolbar}>
        {currentMenuItems.map((item, index) => {
          return (
            <Button
              key={`toolbar-item-${index}`}
              className={classes.item}
              href={item.link}
              target={item.target}
              onClick={() => handleClick(item.key)}
            >
              {item.label}
            </Button>
          );
        })}
      </Toolbar>
    </div>
  );
};
