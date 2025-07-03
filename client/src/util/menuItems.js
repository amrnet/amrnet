import { Home, Info, MenuBook, GitHub, Groups, Storage } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import CopyrightRoundedIcon from '@mui/icons-material/CopyrightRounded';

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
    // target: '_blank',
  },
  {
    key: 'team',
    label: 'Team',
    labelHead: 'Team',
    icon: <Groups />,
    link: '#/about#team-section',
    // target: '_blank',
  },
  {
    key: 'user-guide',
    label: 'User Guide',
    labelHead: 'User Guide',
    icon: <MenuBook />,
    link: 'https://amrnet.readthedocs.io/en/latest/',
    target: '_blank',
  },
  {
    key: 'database',
    label: 'Database',
    labelHead: 'Database',
    icon: <Storage />,
    link: 'https://amrnet.readthedocs.io/en/latest/data.html',
    target: '_blank',
  },
  // {
  //   key: 'documentation',
  //   label: 'Documentation',
  //   icon: <Description />
  // },
  {
    key: 'api',
    label: 'Data Rights',
    labelHead: 'Data Rights',
    icon: <CopyrightRoundedIcon />,
    link: 'https://amrnet.readthedocs.io/en/latest/right.html',
    target: '_blank',
  },
  {
    key: 'contact',
    label: 'Contact',
    labelHead: 'Contact',
    icon: <EmailIcon />,
    link: 'mailto:amrnetdashboard@gmail.com',
    target: '_blank',
  },
  {
    key: 'git',
    label: 'GitHub',
    labelHead: 'GitHub',
    icon: <GitHub />,
    link: 'https://github.com/amrnet/amrnet',
    target: '_blank',
  },
];
