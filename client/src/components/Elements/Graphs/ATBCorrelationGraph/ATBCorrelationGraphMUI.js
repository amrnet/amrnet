import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  atbCorrelationGraph: {
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
      height: '420px',
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
      height: '250px',
    },
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  rSquared: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
}));

export { useStyles };
