import { BubbleChart, StackedBarChart, Timeline, ViewModule, BarChart } from '@mui/icons-material';
import { DrugResistanceGraph } from '../components/Elements/Graphs/DrugResistanceGraph';
import { DeterminantsGraph } from '../components/Elements/Graphs/DeterminantsGraph';
import { DistributionGraph } from '../components/Elements/Graphs/DistributionGraph';
import { TrendsGraph } from '../components/Elements/Graphs/TrendsGraph';
import { KODiversityGraph } from '../components/Elements/Graphs/KODiversityGraph';
import { ConvergenceGraph } from '../components/Elements/Graphs/ConvergenceGraph';
import { BubbleHeatmapGraph2 } from '../components/Elements/Graphs/BubbleHeatmapGraph2';
import { amrLikeOrganisms, organismsCards } from './organismsCards';
import { KOTrendsGraph } from '../components/Elements/Graphs/KOTrends';
import { BubbleKOHeatmapGraph } from '../components/Elements/Graphs/BubbleKOHeatmapGraph';
import { BubbleMarkersHeatmapGraph } from '../components/Elements/Graphs/BubbleMarkersHeatmapGraph';
import { MarkerTrendsGraph } from '../components/Elements/Graphs/MarkerTrendsGraph';
import { FrequenciesGraph } from '../components/Elements/Graphs/FrequenciesGraph';

function getHeatMapsTitle(organism) {
  switch (organism) {
    case 'sentericaints':
      return 'AMR by lineage';
    default:
      return 'AMR by genotype';
  }
}

const heatmapCards = organismsCards.map(organismCard => ({
  title: getHeatMapsTitle(organismCard.value),
  description: [''],
  icon: <ViewModule color="primary" />,
  id: 'HSG2',
  organisms: [organismCard.value],
  component: <BubbleHeatmapGraph2 />,
}));

export const graphCards = [
  {
    title: 'AMR Trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'DRT',
    organisms: organismsCards.map(x => x.value),
    component: <DrugResistanceGraph />,
  },
  ...heatmapCards,
  {
    title: 'AMR marker trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <Timeline color="primary" />,
    id: 'RDT',
    organisms: ['ngono', 'kpneumo', 'styphi', 'shige'],
    component: <MarkerTrendsGraph />,
  },
  {
    title: 'AMR marker by genotype',
    description: ['Top Genotypes (up to 10)'],
    icon: <StackedBarChart color="primary" />,
    id: 'RDWG',
    organisms: ['styphi', 'ngono', 'shige', 'ecoli', 'decoli'],
    component: <DeterminantsGraph />,
  },
  {
    title: 'AMR marker by genotype',
    description: [''],
    icon: <ViewModule color="primary" />,
    id: 'BAMRH',
    organisms: ['kpneumo'],
    component: <BubbleMarkersHeatmapGraph />,
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
  {
    title: 'Genotype trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: [
      'styphi',
      'ngono',
      'kpneumo',
      // 'senterica',
      ...amrLikeOrganisms.filter(x => !['sentericaints', 'senterica'].includes(x)),
    ],
    component: <DistributionGraph />,
  },
  {
    title: 'Lineage trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <StackedBarChart color="primary" />,
    id: 'GD',
    organisms: ['sentericaints', 'senterica'],
    component: <DistributionGraph />,
  },
  {
    title: 'KO trends',
    description: ['Data are plotted for years with N ≥ 10 genomes'],
    icon: <StackedBarChart color="primary" />,
    id: 'KOT',
    organisms: ['kpneumo'],
    component: <KOTrendsGraph />,
  },
  {
    title: 'KO by genotype',
    description: [''],
    icon: <ViewModule color="primary" />,
    id: 'BKOH',
    organisms: ['kpneumo'],
    component: <BubbleKOHeatmapGraph />,
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
  // {
  //   title: 'Bla trends',
  //   description: ['Data are plotted for years with N ≥ 10 genomes'],
  //   icon: <MultilineChart color="primary" />,
  //   id: 'RDT',
  //   organisms: ['kpneumo'],
  //   component: <TrendsGraph />,
  // },
  // {
  //   title: 'Marker trends',
  //   description: ['Data are plotted for years with N ≥ 10 genomes'],
  //   icon: <MultilineChart color="primary" />,
  //   id: 'RDT',
  //   organisms: ['ngono'],
  //   component: <TrendsGraph />,
  // },
  // {
  //   title: 'K/O Trends',
  //   description: ['Top K/O (up to 10)'],
  //   icon: <StackedBarChart color="primary" />,
  //   id: 'KO',
  //   organisms: [],
  //   component: <TrendsGraph />,
  // },
];

export const continentGraphCard = {
  title: 'Geographic Comparisons',
  icon: <ViewModule color="primary" />,
  organisms: organismsCards.map(x => x.value),
};

export const continentPGraphCard = {
  title: 'Pathotype Comparisons',
  icon: <ViewModule color="primary" />,
  organisms: ['shige', 'decoli', 'sentericaints'],
};
