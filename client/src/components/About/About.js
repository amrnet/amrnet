import { Card, CardContent, Typography } from '@mui/material';
import { MainLayout } from '../Layout';
import { useStyles } from './AboutMUI';
import { Team } from './Team/Team';
import { Sponsors } from './Sponsors/Sponsors';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const AboutPage = () => {
  const classes = useStyles();

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="body1" className={classes.paragraph}>
            The AMRnet dashboard aims to make high-quality, robust and reliable genome-derived AMR surveillance data
            accessible to a wide audience. Visualisations are geared towards showing national annual AMR prevalence
            estimates and trends over time, which can be broken down and explored in terms of underlying genotypes and
            resistance mechanisms. We do not generate sequence data, but we hope that by making publicly deposited data
            more accessible and useful, we can encourage and motivate more sequencing and data sharing.
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
            (to call AMR determinants and lineages from sequence data). Additional organisms have been added, using data sourced from{' '}
            <a href="http://pathogen.watch" target="_blank" rel="noreferrer">
              Pathogenwatch
            </a>
            , and
            <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
              {' '}
              Enterobase
            </a>
            , however these dashboards are in beta mode as data curation is still ongoing. More organisms will be added throughout 2025.
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            A major barrier to using public data for surveillance is the need for careful data curation in order to
            identify which datasets are relevant for inclusion in pooled estimates of AMR and genotype prevalence. This
            kind of curation can benefit a wide range of users and we plan to work with additional organism-specific
            communities to curate data, and to contribute to wider efforts around metadata standards. Please get in
            touch if you would like to work with us (
            <a href="mailto:amrnetdashboard@gmail.com">amrnetdashboard@gmail.com</a>)
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
            . along with {' '}
            <a href="https://amrnet.readthedocs.io/en/latest" target="_blank" rel="noreferrer">
            user guide
            </a> and {' '}
            <a href="https://amrnet.readthedocs.io/en/latest/api.html" target="_blank" rel="noreferrer">
            API
            </a>  to access the data. Issues and feature requests can be posted{' '}
            <a href="https://github.com/amrnet/amrnet/issues" target="_blank" rel="noreferrer">
              here
            </a>
            .
          </Typography>
          <br />
          <Typography variant="h6" className={classes.paragraph}>
            Citation for AMRnet
          </Typography>
          <br />
          <Typography variant="body1" className={classes.paragraph}>
            If you use the AMRnet website or code, please cite AMRnet (Louise Cerdeira, Vandana Sharma, Mary Maranga,
            Megan Carey, Zoe Dyson, Kat Holt),
            <span className={classes.paragraphBold}> GitHub: </span> {' '}
            <a href="https://github.com/amrnet/amrnet" target="_blank" rel="noreferrer">
            https://github.com/amrnet/amrnet
            </a>
            ,
            <span className={classes.paragraphBold}> DOI:</span> {' '}
            <a href="https://zenodo.org/doi/10.5281/zenodo.10810218" target="_blank" rel="noreferrer">
            https://zenodo.org/doi/10.5281/zenodo.10810218 
            </a>
            <br/>
          </Typography>
          <br/>
          <Typography variant="caption text" >
            The project is funded by the Wellcome Trust (grant 226432/Z/22/Z).
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
