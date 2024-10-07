import { Home, Info, MenuBook } from '@mui/icons-material';

// List of drawer menu items
export const menuItems = [
  {
    key: 'home',
    label: 'Home',
    labelHead: '',
    icon: <Home />,
    link: '/',
    target: '_self',
  },
  {
    key: 'user-guide',
    label: 'User Guide',
    labelHead: 'User Guide',
    icon: <MenuBook />,
    link: 'https://amrnet.readthedocs.io/en/staging/',
    target: '_blank',
  },
  {
    key: 'about',
    label: 'About',
    labelHead: 'About AMRnet',
    icon: <Info />,
    link: '#/about',
    target: '_self',
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
