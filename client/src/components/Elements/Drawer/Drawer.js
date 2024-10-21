import { useStyles } from './DrawerMUI';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setOpenDrawer, setPage } from '../../../stores/slices/appSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { menuItems } from '../../../util/menuItems';

/**
 * A drawer component that renders a list of menu items on the left side of the screen.
 *
 * It uses the Material-UI <SwipeableDrawer> component to provide a swipe gesture to open and close the drawer.
 * The drawer is open by default, and it can be closed by swiping to the left or clicking outside of the drawer.
 *
 * The drawer contains a list of menu items, which are rendered as <ListItem> components. Each item has an icon and a label.
 * The currently selected item is highlighted with a different background color.
 *
 * When an item is clicked, the drawer is closed and the page is updated to the selected item.
 */
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

  /**
   * Handles the toggle event for the drawer. If the event is a keydown and the key is Tab or Shift,
   * do nothing. Otherwise, dispatch the setOpenDrawer action with the given value.
   * @param {React.KeyboardEvent|React.MouseEvent} event The event that triggered this function
   * @param {boolean} value The value to set for the openDrawer state
   */
  function handleToggleDrawer(event, value) {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    dispatch(setOpenDrawer(value));
  }

  /**
   * Handles the click event for a menu item. If the currently selected page is the same as the clicked item,
   * do nothing. Otherwise, update the page and navigate to the correct location.
   *
   * If the clicked item is the Home page, simply navigate to the root URL.
   * If the clicked item is the User Guide, open the guide in a new tab.
   * Otherwise, open the page in a new tab.
   * @param {Object} item The menu item that was clicked
   */
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
