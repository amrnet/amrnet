import { BarChart, BubbleChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';

export const graphCards = [
  {
    collapse: 'drugResistance',
    title: 'Drug resistance trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: ['styphi', 'ngono']
  },
  {
    collapse: 'frequencies',
    title: 'Resistance frequencies within genotypes',
    description: ['Top Genotypes (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
    organisms: ['styphi', 'kpneumo', 'ngono']
  },
  {
    collapse: 'determinants',
    title: 'Resistance determinants within genotypes',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['styphi', 'kpneumo', 'ngono']
  },
  {
    collapse: 'distribution',
    title: 'Genotype distribution',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['styphi', 'kpneumo', 'ngono', 'ecoli', 'senterica', 'decoli', 'sentericaints']
  },
  {
    //TODO: add this chart above because this chart is a distribution chart, which means is the same plot, only the title will change(same id as well)
    collapse: 'distribution',
    title: 'Lineage prevalence',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['shige']
  },
  {
    collapse: 'trendsKP',
    title: 'Carbapenems and ESBL resistant determinant trends',
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'CERDT',
    organisms: ['']
  },
  {
    collapse: 'KODiversity',
    title: 'K/O diversity',
    description: ['Top K/O (up to 20)'],
    icon: <StackedBarChart color="primary" />,
    id: 'KO',
    organisms: ['']
  },
  {
    collapse: 'convergence',
    title: 'Convergence vs metadata',
    description: [''],
    icon: <BubbleChart color="primary" />,
    id: 'CVM',
    organisms: ['']
  }
];
