import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  serotypeResistanceGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '550px',
  },
  rightSide: {
    display: 'flex',
    flexDirection: 'column',
    width: '250px',
    minWidth: '250px',
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
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  serotypeLabel: {
    width: '100px',
    minWidth: '100px',
    paddingRight: '8px',
    textAlign: 'right',
    flexShrink: 0,
  },
  drugLabel: {
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
    height: '24px',
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
    height: '100%',
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
  },
  controlsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    paddingTop: '8px',
  },
}));

export { useStyles };
