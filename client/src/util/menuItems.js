import { GitHub, Groups, Home, Info, MenuBook, Storage } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'react-i18next';

export const useMenuItems = () => {
  const { i18n } = useTranslation(); 
  const lang = i18n.language;
  return [
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
    },
    {
      key: 'team',
      label: 'Team',
      labelHead: 'Team',
      icon: <Groups />,
      link: '#/about#team-section',
    },
    {
      key: 'user-guide',
      label: 'User Guide',
      labelHead: 'User Guide',
      icon: <MenuBook />,
      link: `https://amrnet.readthedocs.io/${lang}/latest/`,
      target: '_blank',
    },
    {
      key: 'database',
      label: 'Database',
      labelHead: 'Database',
      icon: <Storage />,
      link: `https://amrnet.readthedocs.io/${lang}/latest/data.html`,
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
};
