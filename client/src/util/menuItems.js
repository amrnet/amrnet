import { Home, Info, MenuBook, Person } from '@mui/icons-material';

// List of drawer menu items
export const menuItems = [
  {
    key: '',
    label: 'Home',
    labelHead: '',
    icon: <Home />,
    link: '/',
    target: '_self',
  },
  
  {
    key: 'about',
    label: 'About',
    labelHead: 'About',
    icon: <Info />,
    link: '#/about',
    target: '_blank',
  },
  {
    key: 'team',
    label: 'Team',
    labelHead: 'Team',
    icon: <Info />,
    link: '#/team',
    target: '_blank',
  },
  {
    key: 'user-guide',
    label: 'User Guide',
    labelHead: 'User Guide',
    icon: <MenuBook />,
    link: 'https://amrnet.readthedocs.io/en/staging/',
    target: '_blank',
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
  {
    key: 'contact',
    label: 'Contact',
    icon: <Person />,
    link: '#/contact',
    target: '_blank',
  }
];
