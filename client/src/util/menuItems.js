import { Description, Home, Info, MenuBook, Person, Storage } from '@mui/icons-material';

// List of drawer menu items
export const menuItems = [
  {
    key: 'home',
    label: 'Home',
    icon: <Home />
  },
  {
    key: 'about',
    label: 'About',
    icon: <Info />
  },
  {
    key: 'user-guide',
    label: 'User Guide',
    icon: <MenuBook />
  },
  {
    key: 'database',
    label: 'Database',
    icon: <Storage />
  },
  {
    key: 'documentation',
    label: 'Documentation',
    icon: <Description />
  },
  {
    key: 'contact',
    label: 'Contact',
    icon: <Person />
  }
];
