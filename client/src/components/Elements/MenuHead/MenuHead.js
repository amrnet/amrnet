import { Button, Toolbar, Tooltip } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useMenuItems } from '../../../util/menuItems';
import { useStyles } from './MenuHeadMUI';

const ICON_BUTTONS = ['GitHub', 'Contact'];

export const MenuHead = () => {
  const classes = useStyles();
  const location = useLocation();
  const { t } = useTranslation();
  const menuItems = useMenuItems();
  const page = location.pathname.replace('/', '');

  const getTranslatedLabel = item => {
    const labelMap = {
      Home: t('navigation.home'),
      About: t('navigation.about'),
      Team: t('navigation.team'),
      'User Guide': t('navigation.userguide'),
      Database: t('navigation.database'),
      Contact: t('navigation.contact'),
      GitHub: 'GitHub', // Keep in English
    };
    return labelMap[item.label] || item.label;
  };

  const currentMenuItems = menuItems.filter(item => item.key !== '');

  const target = item => {
    return page === 'about' && (item.key === 'team' || item.key === 'about') ? '_self' : item.target;
  };

  const handleClick = item => {
    if (item.key === 'team') scrollToHash('team-section');
    if (item.key === 'about') scrollToHash('about-section');
    if (item.key === 'about') scrollToTop();
  };

  const scrollToHash = id => {
    if (location.hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    document.getElementById('main-layout')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
          const translatedLabel = getTranslatedLabel(item);
          return (
            <Tooltip
              key={`toolbar-item-${index}`}
              title={ICON_BUTTONS.includes(item.label) ? translatedLabel : undefined}
            >
              <Button className={classes.item} href={item.link} target={target(item)} onClick={() => handleClick(item)}>
                {ICON_BUTTONS.includes(item.label) ? item.icon : translatedLabel}
              </Button>
            </Tooltip>
          );
        })}
      </Toolbar>
    </div>
  );
};
