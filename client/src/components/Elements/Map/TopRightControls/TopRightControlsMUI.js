import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  topRightControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    right: 0,

    '&$bp700': {
      position: 'relative',
    },
  },
  card: { borderRadius: '6px !important' },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  },
  font: {
    fontSize: 'small !important',
    marginRight: '0px !important',
  },
  label: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px',
  },
  labelTooltipIcon: {
    cursor: 'pointer',
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    textAlign: 'start',
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px',
    },
  },
  legendWrapper: {
    marginTop: '8px',
    maxHeight: '140px',
    overflowY: 'auto',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
  },
  legendColorBox: {
    width: '10px',
    height: '10px',
    marginRight: '4px',
  },
  legendText: {
    fontSize: '10px',
  },
  mapViewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: '16px',
  },
  toggleGroup: {
    textWrap: 'nowrap',
  },
  bp700: {},
}));

export { useStyles };
