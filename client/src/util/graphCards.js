import { BarChart, BubbleChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';

export const graphCards = [
  {
    collapse: 'drugResistance',
    title: 'Drug resistance trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: ['typhi', 'klebe']
  },
  {
    collapse: 'frequencies',
    title: 'Resistance frequencies within genotypes',
    description: ['Top Genotypes (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
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
  },
  {
    collapse: 'KODiversity',
    title: 'K/O diversity',
    description: ['Top K/O (up to 20)'],
    icon: <StackedBarChart color="primary" />,
    id: 'KO',
    organisms: ['klebe']
  },
  {
    collapse: 'convergence',
    title: 'Convergence vs metadata',
    description: [''],
    icon: <BubbleChart color="primary" />,
    id: 'CVM',
    organisms: ['klebe']
  }
];
