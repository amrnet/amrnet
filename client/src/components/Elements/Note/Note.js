import { useStyles } from './NoteMUI';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useAppSelector } from '../../../stores/hooks';
import LogoImg from '../../../assets/img/logo-typhinet-prod.png';
// import Button from '@mui/material/Button';

export const Note = () => {
  const classes = useStyles();
  // const dispatch = useAppDispatch();
  // const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  // const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  // const dataset = useAppSelector((state) => state.map.dataset);
  // const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  // const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const organism = useAppSelector((state) => state.dashboard.organism);

  const textNote = () => {
    if (organism === 'styphi') {
      return (
        <span>
          Typhi data are curated by the{' '}
          <a href="https://www.typhoidgenomics.org" target="_blank" rel="noreferrer">
            Global Typhoid Genomics Consortium
          </a>{' '}
          and analysed using{' '}
          <a href="https://pathogen.watch" target="_blank" rel="noreferrer">
            Pathogenwatch
          </a>
        </span>
      );
    } else if (organism === 'ngono') {
      return (
        <span>
          <i>N. gonorrhoeae</i> data represent national and regional surveillance projects, sourced from{' '}
          <a href="https://pathogen.watch" target="_blank" rel="noreferrer">
            Pathogenwatch
          </a>
        </span>
      );
    } else if (organism === 'kpneumo') {
      return (
        <span>
          This data is pulled from{' '}
          <a href="https://pathogen.watch" target="_blank" rel="noreferrer">
            Pathogenwatch
          </a>{' '}
          and represents unfiltered data deposited in Enterobase/NCBI/ENA. It includes diverse sources of bacteria (not just human clinical infections) and is biased towards sequencing of resistant strains. Future updates are planned to include curation and filters, to mitigate these issues.
        </span>
      );
    } else {
      return (
        <span>
          This data is pulled from{' '}
          <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noreferrer">
            Enterobase
          </a>{' '}
          and represents unfiltered data deposited in Enterobase/NCBI/ENA, therefore may reflect a bias towards
          sequencing of resistant strains and/or outbreaks. This will change in future updates. AMR data is not yet
          available but is coming soon.
        </span>
      );
    }
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        {organism === 'styphi' ? (
          <img src={LogoImg} alt="AMRnet" className={classes.logo} />
        ) : (
          // :organism === "ngono"? null
          <Button className={classes.beta} variant="contained" href="#contained-buttons">
            BETA
          </Button>
        )}
        <Typography className={classes.note} variant="body1">
          {textNote()}
        </Typography>
      </CardContent>
    </Card>
  );
};
