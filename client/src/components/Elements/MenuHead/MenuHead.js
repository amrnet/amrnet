import { useLocation } from 'react-router-dom';
import { menuItems } from '../../../util/menuItems';
import { useStyles } from './MenuHeadMUI';
import { Button, Toolbar } from '@mui/material';
import { useMemo } from 'react';
import { useMediaQuery } from '@mui/material';

export const MenuHead = () => {
  const classes = useStyles();
  const location = useLocation();
  // const dispatch = useAppDispatch();
  const matches550 = useMediaQuery('(max-width: 550px)');

  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);

  const currentMenuItems = useMemo(() => {
    if (page === 'about') {
      return menuItems.filter((item) => !['about', ''].includes(item.key));
    }

    return menuItems.filter((item) => item.key !== '');
  }, [page]);

  return (
    <div className={classes.menuHead}>
      <Toolbar className={`${ matches550? classes.toolbar_mobile: classes.toolbar}`}>
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
