import { useStyles } from './DrawerMUI';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { setOpenDrawer } from '../../../stores/slices/appSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { menuItems } from '../../../util/menuItems';

export const Drawer = () => {
  const classes = useStyles();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const openDrawer = useAppSelector((state) => state.app.openDrawer);

  const page = useMemo(() => location.pathname.replace('/', ''), [location.pathname]);

  function handleToggleDrawer(event, value) {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    dispatch(setOpenDrawer(value));
  }

  return (
    <SwipeableDrawer
      anchor="left"
      open={openDrawer}
      onOpen={(event) => handleToggleDrawer(event, true)}
      onClose={(event) => handleToggleDrawer(event, false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={(event) => handleToggleDrawer(event, false)}
        onKeyDown={(event) => handleToggleDrawer(event, false)}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={`menu-item-${index}`} disablePadding>
              <ListItemButton
                className={`${page === item.key ? classes.activeItem : ''}`}
                href={item.link}
                target={item.target}
              >
                <ListItemIcon className={page === item.key ? classes.activeItemIcon : ''}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};
