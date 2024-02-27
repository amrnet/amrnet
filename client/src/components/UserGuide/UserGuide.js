import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './UserGuideMUI';
import { Footer } from '../Elements/Footer';

export const UserGuidePage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          {/* <Typography variant="body1" className={classes.paragraph}>
            Under development, please see the TyphiNET{' '}
            <a href="https://github.com/zadyson/TyphiNET/wiki" target="_blank" rel="noreferrer">
              wiki
            </a>{' '}
            for details.
          </Typography> */}
          <Typography variant="body1" className={classes.paragraph}>
            This wiki explains how to use the AMRnet dashboard (hosted at http://amrnet.net/) via a web browser. 
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Download Plots
          </Typography>
          <Typography variant="body1" className={classes.paragraph}>
            This wiki explains how to use the AMRnet dashboard (hosted at http://amrnet.net/) via a web browser. 
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Download Report
          </Typography>
          <Typography variant="body1" className={classes.paragraph}>
            This wiki explains how to use the AMRnet dashboard (hosted at http://amrnet.net/) via a web browser. 
          </Typography>
          <br/>
          <Typography variant="subtitle2" className={classes.paragraph}>
            Download Dataset
          </Typography>
          <Typography variant="body1" className={classes.paragraph}>
            This wiki explains how to use the AMRnet dashboard (hosted at http://amrnet.net/) via a web browser. 
          </Typography>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
