import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  qrdrPathwayGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  graphWrapper: {
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    height: '520px',

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      height: '100%',
    },
  },
  graph: {
    height: '100%',
    width: '70%',

    '@media (max-width: 1000px)': {
      width: '100%',
      height: '400px',
    },
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    width: '30%',
    rowGap: '8px',

    '@media (max-width: 1000px)': {
      width: '100%',
    },
  },
  tooltipWrapper: {
    borderRadius: '6px',
    backgroundColor: '#E5E5E5',
    overflowY: 'auto',
    height: '100%',
    padding: '12px',

    '@media (max-width: 1000px)': {
      height: '300px',
    },
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  mutationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
  },
  mutationChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
  },
}));

export { useStyles };
