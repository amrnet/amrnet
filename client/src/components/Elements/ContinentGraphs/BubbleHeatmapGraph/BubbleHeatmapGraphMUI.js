import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  bubbleHeatmapGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    padding: '16px 0px 24px 0px !important',
  },
  selectsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    padding: '0px 16px',
  },
  selectPreWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '20px',
    width: '100%',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '50%',
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important',
  },
  multipleSelectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important',
    marginRight: '-80px !important',
  },
  selectButton: {
    height: '20px',
    fontSize: '10px !important',
    padding: '3px 5px !important',
    whiteSpace: 'nowrap',
    position: 'absolute',
    right: '18px',
  },
  menuPaper: {
    maxHeight: '350px !important',
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px',
    },
    '& .MuiCheckbox-root': {
      padding: '0px 8px 0px 0px',
    },
  },
  graphWrapper: {
    padding: '16px 16px 0px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      height: '100%',
    },
  },
  graph: {
    height: '100%',
    width: '100%',

    '@media (max-width: 1000px)': {
      width: '100%',
    },

    '@media (max-width: 500px)': {
      width: '100%',
      height: '460px',
    },
  },
  chartTooltipLabel: {
    backgroundColor: '#fff',
    padding: '8px',
    border: 'solid rgba(0, 0, 0, 0.25) 1px',
  },
  bottomLegend: {
    padding: '16px 16px 0px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '16px',
  },
  legend: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
  },
  singleBox: {
    height: '15px',
    width: '15px',
  },
  gradientBox: {
    height: '15px',
    width: '100px',
    backgroundImage: 'linear-gradient(to right, #FAAD8F, #FA694A, #DD2C24, #A20F17)',
  },
  divider: {
    paddingTop: '16px',
  },
}));

export { useStyles };
