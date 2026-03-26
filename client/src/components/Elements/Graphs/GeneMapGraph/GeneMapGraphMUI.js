import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  geneMapGraph: {
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

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
    },
  },
  heatmapArea: {
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
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '4px',
    marginBottom: '2px',
  },
  locationLabel: {
    width: '160px',
    minWidth: '160px',
    paddingRight: '8px',
    textAlign: 'right',
    flexShrink: 0,
  },
  geneLabel: {
    flex: '1 1 0',
    minWidth: 0,
    textAlign: 'center',
  },
  dataRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.03)',
    },
  },
  cell: {
    flex: '1 1 0',
    minWidth: 0,
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0.5px',
    borderRadius: '2px',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8,
      outline: '1px solid #333',
    },
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
  tooltipWrapper: {
    borderRadius: '6px',
    backgroundColor: '#E5E5E5',
    overflowY: 'auto',
    padding: '12px',
    maxHeight: '350px',
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
  },
}));

export { useStyles };
