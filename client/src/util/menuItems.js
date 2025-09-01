import { GitHub, Groups, Home, Info, MenuBook, Storage } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import i18n from 'i18next'; // import the i18n instance

// List of drawer menu items
export const getMenuItems = () =>  [
  {
    key: '',
    label: 'Home',
    labelHead: '',
    icon: <Home />,
    link: '#/',
    target: '_self',
  },

  {
    key: 'about',
    label: 'About',
    labelHead: 'About',
    icon: <Info />,
    link: '#/about#about-section',
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
    link: `https://amrnet.readthedocs.io/${i18n.language}/latest/`,
    target: '_blank',
  },
  {
    key: 'database',
    label: 'Database',
    labelHead: 'Database',
    icon: <Storage />,
    link: `https://amrnet.readthedocs.io/${i18n.language}/latest/data.html`,
    target: '_blank',
  },
  // {
  //   key: 'documentation',
  //   label: 'Documentation',
  //   icon: <Description />
  // },
  // {
  //   key: 'api',
  //   label: 'Data Rights',
  //   labelHead: 'Data Rights',
  //   icon: <CopyrightRoundedIcon />,
  //   link: 'https://amrnet.readthedocs.io/en/latest/right.html',  // relink to correct link to Data Rights
  //   target: '_blank',
  // },
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
