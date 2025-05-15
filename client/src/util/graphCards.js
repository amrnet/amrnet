import { BubbleChart, MultilineChart, StackedBarChart, Timeline } from '@mui/icons-material';
import { DrugResistanceGraph } from '../components/Elements/Graphs/DrugResistanceGraph';
import { DeterminantsGraph } from '../components/Elements/Graphs/DeterminantsGraph';
import { DistributionGraph } from '../components/Elements/Graphs/DistributionGraph';
import { TrendsGraph } from '../components/Elements/Graphs/TrendsGraph';
import { KODiversityGraph } from '../components/Elements/Graphs/KODiversityGraph';
import { ConvergenceGraph } from '../components/Elements/Graphs/ConvergenceGraph';
import { BubbleHeatmapGraph2 } from '../components/Elements/Graphs/BubbleHeatmapGraph2';
import { amrLikeOrganisms, organismsCards } from './organismsCards';

function getHeatMapsTitle(organism) {
  switch (organism) {
    case 'kpneumo':
      return 'AMR by ST';
    case 'sentericaints':
      return 'AMR by lineage';
    default:
      return 'AMR by genotype';
  }
}

function getTrendstitle(organism) {
  switch (organism) {
    case 'kpneumo':
      return 'Bla trends';
    case 'ngono':
      return 'Marker trends';
    default:
      return '';
  }
}

const heatmapCards = organismsCards.map((organismCard) => ({
  title: getHeatMapsTitle(organismCard.value),
  description: [''],
  icon: <BubbleChart color="primary" />,
  id: 'HSG2',
  organisms: [organismCard.value],
  component: <BubbleHeatmapGraph2 />,
}));

export const graphCards = [
  {
    title: 'AMR trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: organismsCards.map((x) => x.value),
    component: <DrugResistanceGraph />,
  },
  {
    title: 'Genotype trends',
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
    title: 'Lineage trends',
    description: [''],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: amrLikeOrganisms,
    component: <DistributionGraph />,
  },
  // {
  //   title: 'Resistance frequencies within genotypes',
  //   description: ['Top Genotypes (up to 7)'],
  //   icon: <BarChart color="primary" />,
  //   id: 'RFWG',
  //   organisms: ['styphi', 'kpneumo', 'ngono'],
  //   component: <FrequenciesGraph />,
  // },
  // {
  //   title: 'Resistance frequencies within lineages',
  //   description: ['Top Lineages (up to 7)'],
  //   icon: <BarChart color="primary" />,
  //   id: 'RFWG',
  //   organisms: ['sentericaints'],
  //   component: <FrequenciesGraph />,
  // },
  
  {
    title: 'AMR markers by ST',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['kpneumo'],
    component: <DeterminantsGraph />,
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
    title: 'AMR markers by genotype',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['styphi', 'ngono'],
    component: <DeterminantsGraph />,
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
    title: 'AMR/virulence',
    description: ['Top Genotypes (up to 30)'],
    icon: <BubbleChart color="primary" />,
    // changed id="CVM" to id="convergence-graph", as 'CVM' is used as 'id' for The "Heatmap View",
    id: 'convergence-graph',
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
  // {
  //   title: getHeatMapsTitle('styphi'),
  //   description: [''],
  //   icon: <BubbleChart color="primary" />,
  //   id: 'HSG2',
  //   organisms: ['styphi', 'ngono', 'shige', 'decoli', 'ecoli'],
  //   component: <BubbleHeatmapGraph2 />,
  // },
  // {
  //   title: getHeatMapsTitle('ints'),
  //   description: [''],
  //   icon: <BubbleChart color="primary" />,
  //   id: 'HSG2',
  //   organisms: ['sentericaints'],
  //   component: <BubbleHeatmapGraph2 />,
  // },
  // {
  //   title: getHeatMapsTitle(),
  //   description: [''],
  //   icon: <BubbleChart color="primary" />,
  //   id: 'HSG2',
  //   organisms: organismsCards.map((x) => x.value),
  //   component: <BubbleHeatmapGraph2 />,
  // },
  ...heatmapCards,
];

export const continentGraphCard = {
  title: 'Geographic Comparisons',
  description: [''],
  icon: <BubbleChart color="primary" />,
  id: 'CGC',
  organisms: organismsCards.map((x) => x.value),
};
