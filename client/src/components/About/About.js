import { Card, CardContent, Typography , Divider} from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './AboutMUI';
import { Team } from './Team/Team';
// import { Sponsors } from './Sponsors/Sponsors';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const AboutPage = () => {
  const classes = useStyles();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <MainLayout>
      <Card className={classes.card} id="about-section">
        <CardContent className={classes.cardContent}>
          <Typography variant="h5" className={classes.heading}>
            {t('about.title')}
          </Typography>
          <Divider />
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.paragraph1')}
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.paragraph2.intro')}{' '}
            <a href={t('about.links.typhiNet')} target="_blank" rel="noreferrer">
              {t('about.paragraph2.typhiNet')}
            </a>{' '}
            {t('about.paragraph2.middle1')}{' '}
            <a href={t('about.links.globalTyphoidGenomics')} target="_blank" rel="noreferrer">
              {t('about.paragraph2.globalTyphoid')}
            </a>{' '}
            {t('about.paragraph2.middle2')}{' '}
            <a href={t('about.links.pathogenWatch')} target="_blank" rel="noreferrer">
              {t('about.paragraph2.pathogenwatch1')}
            </a>{' '}
            {t('about.paragraph2.middle3')}{' '}
            <a href={t('about.links.pathogenWatch')} target="_blank" rel="noreferrer">
              {t('about.paragraph2.pathogenwatch2')}
            </a>
            {t('about.paragraph2.middle4')}
            <a href={t('about.links.enterobase')} target="_blank" rel="noreferrer">
              {' '}
              {t('about.paragraph2.enterobase')}
            </a>
            {t('about.paragraph2.end')}
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.paragraph3.text')}
            <a href={t('about.links.contact')}>
              {t('about.paragraph3.contact')}
            </a>
            {t('about.paragraph3.end')}
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.paragraph4.text')}{' '}
            <a href={t('about.links.teamInfo')} target="_blank" rel="noreferrer">
              {t('about.paragraph4.linkText')}
            </a>
            {t('about.paragraph4.end')}
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.paragraph5.intro')}{' '}
            <a href={t('about.links.github')} target="_blank" rel="noreferrer">
              {t('about.paragraph5.github')}
            </a>
            {t('about.paragraph5.middle1')}{' '}
            <a href={t('about.links.userGuide')} target="_blank" rel="noreferrer">
              {t('about.paragraph5.userGuide')}
            </a>{' '}
            {t('about.paragraph5.middle2')}{' '}
            <a href={t('about.links.api')} target="_blank" rel="noreferrer">
              {t('about.paragraph5.api')}
            </a>{' '}
            {t('about.paragraph5.middle3')}{' '}
            <a href={t('about.links.issues')} target="_blank" rel="noreferrer">
              {t('about.paragraph5.issues')}
            </a>
            {t('about.paragraph5.end')}
          </Typography>
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            {t('about.citation.title')}
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            {t('about.citation.intro')}
            <span className={classes.paragraphBold}> {t('about.citation.githubLabel')} </span>{' '}
            <a href={t('about.citation.githubUrl')} target="_blank" rel="noreferrer">
              {t('about.citation.githubUrl')}
            </a>
            ,<span className={classes.paragraphBold}> {t('about.citation.doiLabel')}</span>{' '}
            <a href={t('about.citation.doiUrl')} target="_blank" rel="noreferrer">
              {t('about.citation.doiUrl')}
            </a>
            <br />
          </Typography>
          <br />
          <Typography variant="caption text">
            {t('about.funding')}
          </Typography>
        </CardContent>
      </Card>
      <div id="team-section">
        <Team />
      </div>
      {/* <div id="sponsors-section">
        <Sponsors />
      </div> */}
      {/* <Footer /> */}
    </MainLayout>
  );
};
