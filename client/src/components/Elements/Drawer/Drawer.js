import { useStyles } from './DrawerMUI';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setOpenDrawer, setPage } from '../../../stores/slices/appSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { menuItems } from '../../../util/menuItems';

export const Drawer = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const openDrawer = useAppSelector((state) => state.app.openDrawer);
  const page = useAppSelector((state) => state.app.page);

  useEffect(() => {
    const currentPage = location.pathname.replace('/', '');

    if (page === currentPage || (currentPage === '' && page === 'home')) {
      return;
    }

    dispatch(setPage(currentPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggleDrawer(event, value) {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    dispatch(setOpenDrawer(value));
  }

  function handleUpdatePage(item) {
    if (page === item.key) {
      return;
    }

    dispatch(setPage(item.key));

    if (item.key === menuItems[0].key) {
      navigate('/');
      return;
    }

    if (item.key === 'user-guide') {
      window.open(`https://amrnet.readthedocs.io/en/staging/`, '_blank');
      return;
    }

    // navigate(`/${item.key}`);
    window.open(`#/${item.key}`, '_blank');
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
                onClick={() => handleUpdatePage(item)}
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
