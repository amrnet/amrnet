import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setOpenDrawer } from '../../../stores/slices/appSlice.ts';
import { useMenuItems } from '../../../util/menuItems';
import { useStyles } from './DrawerMUI';

export const Drawer = () => {
  const classes = useStyles();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const openDrawer = useAppSelector(state => state.app.openDrawer);
  const menuItems = useMenuItems();

  const page = location.pathname.replace('/', '');

  const handleToggleDrawer = (event, value) => {
    if (event?.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    dispatch(setOpenDrawer(value));
  }

  const handleClick = item => {
    if (item.key === 'team') {
      scrollToHash('team-section');
    }

    if (item.key === 'about') {
      scrollToTop();
    }
  };

  const scrollToHash = id => {
    if (location.hash === `#${id}`) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    document.getElementById('main-layout')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isItemActive = item => {
    // Special case: highlight only "team" if hash is #team-section
    if (location.pathname === '/about' && location.hash === '#team-section') {
      return item.key === 'team';
    }

    // Default case: active if page matches item key
    return page === item.key;
  };

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

  return (
    <SwipeableDrawer
      anchor="left"
      open={openDrawer}
      onOpen={event => handleToggleDrawer(event, true)}
      onClose={event => handleToggleDrawer(event, false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={event => handleToggleDrawer(event, false)}
        onKeyDown={event => handleToggleDrawer(event, false)}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={`menu-item-${index}`} disablePadding>
              <ListItemButton
                className={isItemActive(item) ? classes.activeItem : ''}
                href={item.link}
                target={item.target}
                onClick={() => handleClick(item)}
              >
                <ListItemIcon className={isItemActive(item) ? classes.activeItemIcon : ''}>{item.icon}</ListItemIcon>
                <ListItemText primary={getTranslatedLabel(item)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};
