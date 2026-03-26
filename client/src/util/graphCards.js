import { BubbleChart, GridOn, Radar, ShowChart, StackedBarChart, Timeline, ViewModule } from '@mui/icons-material';
import { BubbleHeatmapGraph2 } from '../components/Elements/Graphs/BubbleHeatmapGraph2';
import { BubbleKOHeatmapGraph } from '../components/Elements/Graphs/BubbleKOHeatmapGraph';
import { BubbleMarkersHeatmapGraph } from '../components/Elements/Graphs/BubbleMarkersHeatmapGraph';
import { ConvergenceGraph } from '../components/Elements/Graphs/ConvergenceGraph';
import { DeterminantsGraph } from '../components/Elements/Graphs/DeterminantsGraph';
import { DistributionGraph } from '../components/Elements/Graphs/DistributionGraph';
import { DrugResistanceGraph } from '../components/Elements/Graphs/DrugResistanceGraph';
import { KOTrendsGraph } from '../components/Elements/Graphs/KOTrends';
import { MarkerTrendsGraph } from '../components/Elements/Graphs/MarkerTrendsGraph';
import { RadarProfileGraph } from '../components/Elements/Graphs/RadarProfileGraph';
import { TemporalHeatmapGraph } from '../components/Elements/Graphs/TemporalHeatmapGraph';
import { EmergenceRateGraph } from '../components/Elements/Graphs/EmergenceRateGraph';
import { amrLikeOrganisms, organismsCards } from './organismsCards';
import { BubbleHPGraph } from '../components/Elements/ContinentPathotypeGraphs/BubbleHPGraph/BubbleHPGraph';
import { useTranslation } from 'react-i18next';
import { t } from 'react-i18next';

function getHeatMapsTitle(organism, t) {
  switch (organism) {
    case 'sentericaints':
      return t('graphs.amrByLineage');
    case 'senterica':
      return t('graphs.amrByST');
    default:
      return t('graphs.amrByGenotype');
  }
}

export function getGraphCards(t){
  const heatmapCards = organismsCards.map(organismCard => ({
    title: getHeatMapsTitle(organismCard.value, t),
    description: [''],
    icon: <ViewModule color="primary" />,
    id: 'HSG2',
    organisms: [organismCard.value],
    component: <BubbleHeatmapGraph2 />,
  }));

  return [
    {
      title: t('graphs.amrTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <Timeline color="primary" />,
      id: 'DRT',
      organisms: organismsCards.map(x => x.value),
      component: <DrugResistanceGraph />,
    },
    {
      title: t('graphs.radarProfile'),
      description: [t('graphs.radarProfileDescription')],
      icon: <Radar color="primary" />,
      id: 'RAD',
      organisms: organismsCards.map(x => x.value),
      component: <RadarProfileGraph />,
    },
    {
      title: t('graphs.temporalHeatmap'),
      description: [t('graphs.temporalHeatmapDescription')],
      icon: <GridOn color="primary" />,
      id: 'TEH',
      organisms: organismsCards.map(x => x.value),
      component: <TemporalHeatmapGraph />,
    },
    {
      title: t('graphs.emergenceRate'),
      description: [t('graphs.emergenceRateDescription')],
      icon: <ShowChart color="primary" />,
      id: 'EMR',
      organisms: organismsCards.map(x => x.value),
      component: <EmergenceRateGraph />,
    },
    ...heatmapCards,
    {
      title: t('graphs.amrMarkerTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <Timeline color="primary" />,
      id: 'RDT',
      organisms: ['ngono', 'kpneumo', 'styphi', 'shige', 'senterica', 'decoli', 'ecoli', 'sentericaints', 'saureus', 'strepneumo'],
      component: <MarkerTrendsGraph />,
    },
    {
      title: t('graphs.amrMarkerByGenotype'),
      description: [t('graphs.topGenotypesUpTo10')],
      icon: <StackedBarChart color="primary" />,
      id: 'RDWG',
      organisms: [],
      component: <DeterminantsGraph />,
    },
    {
      title: t('graphs.amrMarkerByGenotype'),
      description: [''],
      icon: <ViewModule color="primary" />,
      id: 'BAMRH',
      organisms: ['ngono', 'kpneumo', 'styphi', 'shige', 'decoli', 'ecoli', 'saureus', 'strepneumo'],
      component: <BubbleMarkersHeatmapGraph />,
    },
    {
      title: t('graphs.amrMarkerByLineage'),
      description: [''],
      icon: <ViewModule color="primary" />,
      id: 'BAMRH',
      organisms: ['sentericaints'],
      component: <BubbleMarkersHeatmapGraph />,
    },
    {
      title: t('graphs.amrMarkerByST'),
      description: [''],
      icon: <ViewModule color="primary" />,
      id: 'BAMRH',
      organisms: ['senterica'],
      component: <BubbleMarkersHeatmapGraph />,
    },
    {
      title: t('graphs.amrVirulence'),
      description: [t('graphs.topGenotypesUpTo30')],
      icon: <BubbleChart color="primary" />,
      // changed id="CVM" to id="convergence-graph", as 'CVM' is used as 'id' for The "Heatmap View",
      id: 'convergence-graph',
      organisms: ['kpneumo'],
      component: <ConvergenceGraph />,
    },
    {
      title: t('graphs.genotypeTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <StackedBarChart color="primary" />,
      id: 'GD',
      organisms: [
        'styphi',
        'ngono',
        'kpneumo',
        'saureus',
        'strepneumo',
        // 'senterica',
        ...amrLikeOrganisms.filter(x => !['sentericaints', 'senterica'].includes(x)),
      ],
      component: <DistributionGraph />,
    },
    {
      title: t('graphs.lineageTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <StackedBarChart color="primary" />,
      id: 'GD',
      organisms: ['sentericaints'],
      component: <DistributionGraph />,
    },
    {
      title: t('graphs.stTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <StackedBarChart color="primary" />,
      id: 'GD',
      organisms: ['senterica'],
      component: <DistributionGraph />,
    },
    {
      title: t('graphs.koTrends'),
      description: [t('graphs.dataPlottedForYearsWithNGreaterThan10Genomes')],
      icon: <StackedBarChart color="primary" />,
      id: 'KOT',
      organisms: ['kpneumo'],
      component: <KOTrendsGraph />,
    },
    {
      title: t('graphs.koByGenotype'),
      description: [''],
      icon: <ViewModule color="primary" />,
      id: 'BKOH',
      organisms: ['kpneumo'],
      component: <BubbleKOHeatmapGraph />,
    },
    {
      title: t('graphs.amrbyserotype'),
      description: [''],
      icon: <ViewModule color="primary" />,
      id: 'BHP',
      organisms: ['senterica'],
      component: <BubbleHPGraph />,
    },
  ];
};
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
// ];

export const getContinentGraphCard = (t) => ({
  title: t('graphs.geographicComparisons'),
  icon: <ViewModule color="primary" />,
  organisms: organismsCards.map(x => x.value),
});

export const getContinentPGraphCard = (t) => ({
  title: t('graphs.pathotypeComparisons'),
  icon: <ViewModule color="primary" />,
  organisms: ['shige', 'decoli','ecoli', 'sentericaints',],
});
