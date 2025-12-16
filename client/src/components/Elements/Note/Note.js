import { Card, CardContent, Typography } from '@mui/material';
import { Trans } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-amrnet-prod.png';
import { useAppSelector } from '../../../stores/hooks';
import { useStyles } from './NoteMUI';

const noteTranslationConfig = {
  styphi: {
    key: 'note.styphi',
    components: [
      <a href="https://www.typhoidgenomics.org" target="_blank" rel="noopener noreferrer" key="styphi-consortium" />,
      <a href="https://pathogen.watch" target="_blank" rel="noopener noreferrer" key="styphi-pathogenwatch" />,
    ],
  },
  ngono: {
    key: 'note.ngono',
    components: [
      <i key="ngono-italic" />,
      <a href="https://pathogen.watch" target="_blank" rel="noopener noreferrer" key="ngono-pathogenwatch" />,
    ],
  },
  kpneumo: {
    key: 'note.kpneumo',
    components: [
      <a href="https://pathogen.watch" target="_blank" rel="noopener noreferrer" key="kpneumo-pathogenwatch" />,
      <a
        href="https://github.com/klebgenomics/KlebNET-Metadata-Repository-Database"
        target="_blank"
        rel="noopener noreferrer"
        key="kpneumo-klebnet"
      />,
    ],
  },
  default: {
    key: 'note.default',
    components: [
      <a href="https://enterobase.warwick.ac.uk/" target="_blank" rel="noopener noreferrer" key="default-enterobase" />,
    ],
  },
};

export const Note = () => {
  const classes = useStyles();
  const organism = useAppSelector(state => state.dashboard.organism);
  const translation = noteTranslationConfig[organism] || noteTranslationConfig.default;

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        {organism === 'styphi' ? <img src={LogoImg} alt="AMRnet" className={classes.logo} /> : <div />}
        <Typography className={classes.note} variant="body1">
          <Trans i18nKey={translation.key} components={translation.components} />
        </Typography>
      </CardContent>
    </Card>
  );
};
