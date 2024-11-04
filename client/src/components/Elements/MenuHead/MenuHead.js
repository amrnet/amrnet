import { useLocation } from 'react-router-dom';
import { menuItems } from '../../../util/menuItems';
import { useStyles } from './MenuHeadMUI';
import { Button, Toolbar } from '@mui/material';
import { useMemo } from 'react';

export const MenuHead = () => {
  const classes = useStyles();
  const location = useLocation();

  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);

  const currentMenuItems = useMemo(() => {
    if (page === 'about') {
      return menuItems.filter((item) => !['about', ''].includes(item.key));
    }

    return menuItems.filter((item) => item.key !== '');
  }, [page]);

  return (
    <div className={classes.menuHead}>
      <Toolbar className={classes.toolbar}>
        {currentMenuItems.map((item, index) => {
          return (
            <Button key={`toolbar-item-${index}`} className={classes.item} href={item.link} target={item.target}>
              {item.label}
            </Button>
          );
        })}
      </Toolbar>
    </div>
  );
};
