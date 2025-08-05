import { useTranslation } from 'react-i18next';
import EB from '../../../assets/img/Team/EB.jpeg';
import KH from '../../../assets/img/Team/KH.jpeg';
import LC from '../../../assets/img/Team/LC.jpeg';
import MC from '../../../assets/img/Team/MC.jpeg';
import MM from '../../../assets/img/Team/MM.jpeg';
import VS from '../../../assets/img/Team/VS.jpeg';
import ZD from '../../../assets/img/Team/ZD.jpeg';

export const useTeamCards = () => {
  const { t } = useTranslation();

  return [
    {
      name: 'Prof Kathryn Holt',
      post: t('team.post.Principal Investigator'),
      img: KH,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/holt.kathryn',
    },
    {
      name: 'Asst Prof Zoe Dyson',
      post: t('team.post.Genomic Epidemiologist'),
      img: ZD,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/dyson.zoe',
    },
    {
      name: 'Dr Louise Cerdeira',
      post: t('team.post.Lead Software Engineer/Computational Biologist'),
      img: LC,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/teixeira-cerdeira.louise',
    },
    {
      name: 'Vandana Sharma',
      post: t('team.post.Software Engineer'),
      img: VS,
      redirect: 'https://www.linkedin.com/in/vandana-sharma013/?originalSubdomain=in',
    },
    {
      name: 'Dr Megan Carey',
      post: t('team.post.Policy Engagement'),
      img: MC,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/carey.megan',
    },
    {
      name: 'Dr Mary Maranga',
      post: t('team.post.Bioinformatician'),
      img: MM,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/maranga.mary',
    },
    {
      name: 'Dr Ebenezer Foster-Nyarko',
      post: t('team.post.Enterics Expert'),
      img: EB,
      redirect: 'https://www.lshtm.ac.uk/aboutus/people/foster-nyarko.ebenn',
    },
  ];
};

// Keep the old export for backward compatibility, but it's now deprecated
export const teamCards = [
  {
    name: 'Prof Kathryn Holt',
    post: 'Principal Investigator',
    img: KH,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/holt.kathryn',
  },
  {
    name: 'Asst Prof Zoe Dyson',
    post: 'Genomic Epidemiologist',
    img: ZD,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/dyson.zoe',
  },
  {
    name: 'Dr Louise Cerdeira',
    post: 'Lead Software Engineer/Computational Biologist',
    img: LC,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/teixeira-cerdeira.louise',
  },
  {
    name: 'Vandana Sharma',
    post: 'Software Engineer',
    img: VS,
    redirect: 'https://www.linkedin.com/in/vandana-sharma013/?originalSubdomain=in',
  },
  {
    name: 'Dr Megan Carey',
    post: 'Policy Engagement',
    img: MC,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/carey.megan',
  },
  {
    name: 'Dr Mary Maranga',
    post: 'Bioinformatician',
    img: MM,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/maranga.mary',
  },
  {
    name: 'Dr Ebenezer Foster-Nyarko',
    post: 'Enterics Expert',
    img: EB,
    redirect: 'https://www.lshtm.ac.uk/aboutus/people/foster-nyarko.ebenn',
  },
];
