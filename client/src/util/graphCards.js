import { BarChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';

export const graphCards = [
  {
    collapse: 'frequencies',
    title: 'Resistance frequencies within genotypes',
    description: ['Top Genotypes (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
    organisms: ['typhi', 'klebe']
  },
  {
    collapse: 'drugResistance',
    title: 'Drug resistance trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: ['typhi', 'klebe']
  },
  {
    collapse: 'determinants',
    title: 'Resistance determinants within genotypes',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['typhi', 'klebe']
  },
  {
    collapse: 'distribution',
    title: 'Genotype distribution',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['typhi', 'klebe']
  },
  {
    collapse: 'trendsKP',
    title: 'Carbapenems and ESBL resistant determinant trends',
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'CERDT',
    organisms: ['klebe']
  }
];
