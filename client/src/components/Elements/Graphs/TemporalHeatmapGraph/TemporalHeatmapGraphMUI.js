import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  temporalHeatmapGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '8px',
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
  graph: {
    width: '100%',
    overflow: 'hidden',
  },
  heatmapContainer: {
    display: 'flex',
    flexDirection: 'column',
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
  countryLabel: {
    width: '160px',
    minWidth: '160px',
    paddingRight: '8px',
    textAlign: 'right',
  },
  yearLabel: {
    flex: 1,
    textAlign: 'center',
    minWidth: '44px',
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
    flex: 1,
    minWidth: '44px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
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
    padding: '12px 0px 8px 168px',
  },
  legendGradient: {
    width: '200px',
    height: '14px',
    borderRadius: '2px',
    border: '1px solid #ccc',
  },
  noSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important',
  },
  menuPaper: {
    maxHeight: '350px !important',
  },
  tooltipBox: {
    backgroundColor: '#fff',
    padding: '8px 12px',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: '4px',
    maxWidth: '250px',
  },
}));

export { useStyles };
