import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  cooccurrenceGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  controlsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    paddingTop: '8px',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px',
    paddingBottom: '4px',
  },
  graphWrapper: {
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    minHeight: '500px',

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
    },
  },
  matrixContainer: {
    width: '70%',
    overflowX: 'auto',
    overflowY: 'auto',

    '@media (max-width: 1000px)': {
      width: '100%',
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
  legendBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
  },
  legendGradient: {
    width: '160px',
    height: '14px',
    borderRadius: '2px',
    border: '1px solid #ccc',
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
    height: '400px',
  },
}));

export { useStyles };
