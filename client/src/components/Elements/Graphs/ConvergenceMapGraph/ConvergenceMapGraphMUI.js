import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  convergenceMapGraph: {
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
  graphWrapper: {
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
    },
  },
  chartArea: {
    flex: 1,
    overflow: 'hidden',
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    width: '280px',
    minWidth: '280px',
    rowGap: '8px',

    '@media (max-width: 1000px)': {
      width: '100%',
      minWidth: 'unset',
    },
  },
  tooltipWrapper: {
    borderRadius: '6px',
    backgroundColor: '#E5E5E5',
    overflowY: 'auto',
    padding: '12px',
    flex: 1,
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
  },
  legendBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
  legendGradient: {
    width: '160px',
    height: '14px',
    borderRadius: '2px',
    border: '1px solid #ccc',
  },
  dataRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '1px 0',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.03)',
    },
  },
  countryLabel: {
    width: '140px',
    minWidth: '140px',
    paddingRight: '8px',
    textAlign: 'right',
    flexShrink: 0,
  },
}));

export { useStyles };
