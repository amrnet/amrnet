import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './AboutMUI';
import { Footer } from '../Elements/Footer';
import { Team } from './Team';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const AboutPage = () => {
  const classes = useStyles();
  const location = useLocation();
  useEffect(() => {
    if (location.hash === '#team-section') {
      document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="body1" className={classes.paragraph}>
            The AMRnet dashboard aims to make high-quality, robust and reliable genome-derived AMR surveillance data
            accessible to a wide audience. Visualisations are geared towards showing national annual AMR prevalence
            estimates and trends over time, which can be broken down and explored in terms of underlying genotypes and resistance
            mechanisms. We do not generate sequence data, but we hope that by making publicly deposited data more
            accessible and useful, we can encourage and motivate more sequencing and data sharing.
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            We started with Salmonella Typhi and built on our{' '}
            <a href="https://www.typhi.net" target="_blank" rel="noreferrer">
              TyphiNET
            </a>{' '}
            dashboard which uses data that have been curated by the{' '}
            <a href="http://typhoidgenomics.org" target="_blank" rel="noreferrer">
              Global Typhoid Genomics Consortium
            </a>{' '}
            (to improve data quality and identify which datasets are suitable for inclusion) and analysed in{' '}
            <a href="http://pathogen.watch" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>{' '}
            (to call AMR determinants and lineages from sequence data). More organisms will be added throughout 2024-25,
            using data sourced from analysis platforms such as{' '}
            <a href="http://pathogen.watch" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            ,
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              {' '}
              Enterobase
            </a>
            , and potentially others.
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            A major barrier to using public data for surveillance is the need for careful data curation in order to identify
            which datasets are relevant for inclusion in pooled estimates of AMR and genotype prevalence. This kind of
            curation can benefit a wide range of users and we plan to work with additional organism-specific communities to curate
            data, and to contribute to wider efforts around metadata standards. Please get in touch if you would like to
            work with us (<a href="mailto:amrnetdashboard@gmail.com">amrnetdashboard@gmail.com</a>)
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            Find out more about the project team (based at London School of Hygiene and Tropical Medicine), and our
            policy advisory group,{' '}
            <a href="https://www.lshtm.ac.uk/amrnet" target="_blank" rel="noreferrer">
              here
            </a>
            .
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            The dashboard code is open access and available in{' '}
            <a href="https://github.com/amrnet/amrnet" target="_blank" rel="noreferrer">
              GitHub
            </a>
            . Issues and feature requests can be posted{' '}
            <a href="https://github.com/amrnet/amrnet/issues" target="_blank" rel="noreferrer">
              here
            </a>
            . An API is coming soon!
          </Typography>
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            Citation for AMRnet
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            If you use the AMRnet website or code, please cite AMRnet (Louise Cerdeira, Vandana Sharma, Mary Maranga, Megan Carey, Zoe Dyson, Kat Holt), 
            <span className={classes.paragraphBold}> GitHub: </span>
             https://github.com/amrnet/amrnet, 
             <span className={classes.paragraphBold}> DOI:</span> 10.5281/zenodo.10810219
          </Typography>
        </CardContent>
      </Card>
      <div id="team-section">
        <Team />
      </div>
      {/* <Footer /> */}
    </MainLayout>
  );
};
