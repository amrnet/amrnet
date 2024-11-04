import { BarChart, BubbleChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';

function getTrendstitle(organism) {
  switch (organism) {
    case 'kpneumo':
      return 'Carbapenemase and ESBL distribution';
    case 'ngono':
      return 'Azithromycin and Ceftriaxone resistant determinant trends';
    default:
      return '';
  }
}

export const graphCards = [
  {
    collapse: 'drugResistance',
    title: 'Drug resistance trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: ['styphi', 'ngono', 'kpneumo'],
  },
  {
    collapse: 'frequencies',
    title: 'Resistance frequencies within genotypes',
    description: ['Top Genotypes (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
    organisms: ['styphi', 'kpneumo', 'ngono'],
  },
  {
    collapse: 'determinants',
    title: 'Resistance determinants within genotypes',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['styphi', 'kpneumo', 'ngono'],
  },
  {
    collapse: 'distribution',
    title: 'Genotype distribution',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['styphi', 'kpneumo', 'ngono'],
  },
  {
    //TODO: add this chart above because this chart is a distribution chart, which means is the same plot, only the title will change(same id as well)
    collapse: 'distribution',
    title: 'Lineage prevalence',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['shige', 'decoli', 'sentericaints', 'ecoli', 'senterica'],
  },
  {
    collapse: 'trends',
    title: getTrendstitle('kpneumo'),
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'RDT',
    organisms: ['kpneumo'],
  },
  {
    collapse: 'trends',
    title: getTrendstitle('ngono'),
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'RDT',
    organisms: ['ngono'],
  },
  {
    collapse: 'KODiversity',
    title: 'K/O diversity',
    description: ['Top K/O (up to 20)'],
    icon: <StackedBarChart color="primary" />,
    id: 'KO',
    organisms: [''],
  },
  {
    collapse: 'convergence',
    title: 'Convergence vs metadata',
    description: ['Top Genotypes (up to 30)'],
    icon: <BubbleChart color="primary" />,
    id: 'CVM',
    organisms: ['kpneumo'],
  },
];
