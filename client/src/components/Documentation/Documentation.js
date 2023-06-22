import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './DocumentationMUI';
import { Footer } from '../Elements/Footer';

export const DocumentationPage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="body1" className={classes.paragraph}>
            Under development, please see the TyphiNET{' '}
            <a href="https://github.com/zadyson/TyphiNET/wiki" target="_blank" rel="noreferrer">
              wiki
            </a>{' '}
            for details.
          </Typography>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
