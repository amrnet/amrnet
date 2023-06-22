import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './AboutMUI';
import { Footer } from '../Elements/Footer';

export const AboutPage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="body1" className={classes.paragraph}>
            AMRnet is a data visualisation dashboard that makes genome-derived antimicrobial resistance(AMR) data
            accessible to a wide range of stakeholders including policy makers.
          </Typography>

          <Typography variant="body1" className={classes.paragraph}>
            AMRnet visualisations will be geared towards showing national annual prevalence estimates and trends, that
            can be broken down and explored in terms of underlying genotypes and AMR mechanisms, for bacterial pathogens
            of public health importance.
          </Typography>

          <Typography variant="body1" className={classes.paragraph}>
            The concept is based on the{' '}
            <a href="https://github.com/zadyson/TyphiNET" target="_blank" rel="noreferrer">
              TyphiNET dashboard
            </a>
            , which serves data on the typhoid fever pathogen <i>Salmonella Typhi</i>.
          </Typography>

          <Typography variant="body1" className={classes.paragraph}>
            Find out more about the project{' '}
            <a href="https://www.lshtm.ac.uk/amrnet" target="_blank" rel="noreferrer">
              here
            </a>
            .
          </Typography>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
