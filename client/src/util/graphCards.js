import { BarChart, BubbleChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';
import { DrugResistanceGraph } from '../components/Elements/Graphs/DrugResistanceGraph';
import { FrequenciesGraph } from '../components/Elements/Graphs/FrequenciesGraph';
import { DeterminantsGraph } from '../components/Elements/Graphs/DeterminantsGraph';
import { DistributionGraph } from '../components/Elements/Graphs/DistributionGraph';
import { TrendsGraph } from '../components/Elements/Graphs/TrendsGraph';
import { KODiversityGraph } from '../components/Elements/Graphs/KODiversityGraph';
import { ConvergenceGraph } from '../components/Elements/Graphs/ConvergenceGraph';
import { BubbleHeatmapGraph2 } from '../components/Elements/Graphs/BubbleHeatmapGraph2';

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
    title: 'Drug resistance trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: ['styphi', 'ngono', 'kpneumo', 'sentericaints'],
    component: <DrugResistanceGraph />,
  },
  {
    title: 'Resistance frequencies within genotypes',
    description: ['Top Genotypes (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
    organisms: ['styphi', 'kpneumo', 'ngono'],
    component: <FrequenciesGraph />,
  },
  {
    title: 'Resistance frequencies within lineages',
    description: ['Top Lineages (up to 7)'],
    icon: <BarChart color="primary" />,
    id: 'RFWG',
    organisms: ['sentericaints'],
    component: <FrequenciesGraph />,
  },
  {
    title: 'Resistance determinants within genotypes',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['styphi', 'kpneumo', 'ngono'],
    component: <DeterminantsGraph />,
  },
  {
    title: 'Genotype distribution',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['styphi', 'ngono'],
    component: <DistributionGraph />,
  },
  {
    title: 'ST distribution',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['kpneumo'],
    component: <DistributionGraph />,
  },
  {
    //TODO: add this chart above because this chart is a distribution chart, which means is the same plot, only the title will change(same id as well)
    title: 'Lineage prevalence',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['shige', 'decoli', 'sentericaints', 'ecoli', 'senterica'],
    component: <DistributionGraph />,
  },
  {
    title: getTrendstitle('kpneumo'),
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'RDT',
    organisms: ['kpneumo'],
    component: <TrendsGraph />,
  },
  {
    title: getTrendstitle('ngono'),
    description: ['Top Genotypes (up to 10)', 'Data are plotted for years with N ≥ 10 genomes'],
    icon: <MultilineChart color="primary" />,
    id: 'RDT',
    organisms: ['ngono'],
    component: <TrendsGraph />,
  },
  {
    title: 'K/O diversity',
    description: ['Top K/O (up to 20)'],
    icon: <StackedBarChart color="primary" />,
    id: 'KO',
    organisms: [''],
    component: <KODiversityGraph />,
  },
  {
    title: 'Convergence vs metadata',
    description: ['Top Genotypes (up to 30)'],
    icon: <BubbleChart color="primary" />,
    id: 'CVM',
    organisms: ['kpneumo'],
    component: <ConvergenceGraph />,
  },
  // {
  //   title: 'Heatmap ST vs genotype',
  //   description: [''],
  //   icon: <BubbleChart color="primary" />,
  //   id: 'HSG',
  //   organisms: ['styphi', 'ngono', 'kpneumo', 'shige', 'decoli', 'ecoli'],
  //   component: <BubbleHeatmapGraph />,
  // },
  {
    title: 'Heatmap ST vs genotype',
    description: [''],
    icon: <BubbleChart color="primary" />,
    id: 'HSG2',
    organisms: ['styphi', 'ngono', 'kpneumo', 'shige', 'decoli', 'ecoli', 'sentericaints'],
    component: <BubbleHeatmapGraph2 />,
  },
];

export const continentGraphCard = {
  title: 'Geographic Comparisons',
  description: [''],
  icon: <BubbleChart color="primary" />,
  id: 'CGC',
  organisms: ['styphi', 'ngono', 'kpneumo'],
};
