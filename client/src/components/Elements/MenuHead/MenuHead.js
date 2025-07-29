import { useLocation } from 'react-router-dom';
import { menuItems } from '../../../util/menuItems';
import { useStyles } from './MenuHeadMUI';
import { Button, Toolbar, Tooltip } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';

const ICON_BUTTONS = ['GitHub', 'Contact', 'Data Rights'];

export const MenuHead = () => {
  const classes = useStyles();
  const location = useLocation();

  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);

  const currentMenuItems = useMemo(() => {
    return menuItems.filter(item => item.key !== '');
  }, [page]);

  const target = useCallback(
    item => {
      return page === 'about' && (item.key === 'team' || item.key === 'about') ? '_self' : item.target;
    },
    [page],
  );

  const handleClick = item => {
    if (item.key === 'team') {
      scrollToHash('team-section');
    } else if (item.key === 'about') {
      scrollToHash('about-section');
    }
  };

  const scrollToHash = id => {
    if (location.hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      scrollToHash(id);
    }
  }, [location]);

  return (
    <div className={classes.menuHead}>
      <Toolbar className={classes.toolbar}>
        {currentMenuItems.map((item, index) => {
          return (
            <Tooltip key={`toolbar-item-${index}`} title={ICON_BUTTONS.includes(item.label) ? item.label : undefined}>
              <Button className={classes.item} href={item.link} target={target(item)} onClick={() => handleClick(item)}>
                {ICON_BUTTONS.includes(item.label) ? item.icon : item.label}
              </Button>
            </Tooltip>
          );
        })}
      </Toolbar>
    </div>
  );
};
