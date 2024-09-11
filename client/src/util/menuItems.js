import { Home, Info, MenuBook } from '@mui/icons-material';

// List of drawer menu items
export const menuItems = [
  {
    key: 'home',
    label: 'Dashboard',
    labelHead: 'Home',
    icon: <Home />,
  },
  {
    key: 'about',
    label: 'About',
    labelHead: 'About AMRnet',
    icon: <Info />,
  },
  {
    key: 'user-guide',
    label: 'User Guide',
    labelHead: 'User Guide',
    icon: <MenuBook />,
  },
  // {
  //   key: 'database',
  //   label: 'Database',
  //   icon: <Storage />
  // },
  // {
  //   key: 'documentation',
  //   label: 'Documentation',
  //   icon: <Description />
  // },
  // {
  //   key: 'contact',
  //   label: 'Contact',
  //   icon: <Person />
  // }
];
