import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  floatingFilter: {
    position: 'absolute',
    top: 16,
    right: -(280 + 16),
    width: 'auto',
    zIndex: 1,

    '@media (max-width: 1900px)': {
      right: 16,
    },
  },
  titleWrapper: {
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPreWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    textAlign: 'start',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px',
    paddingBottom: '4px',
  },
  labelTooltipIcon: {
    cursor: 'pointer',
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 56px 8px 8px !important',
    textAlign: 'left',
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px',
    },
    '& .MuiCheckbox-root': {
      padding: '0px 8px 0px 0px',
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
  selectButton: {
    width: '100%',
    height: '20px',
    fontSize: '10px !important',
    padding: '3px 5px !important',
    whiteSpace: 'nowrap',
    position: 'absolute',
    right: '18px',
  },
  autoWidthSelect: {
    width: 'auto',
    display: 'inline-flex',
    position: 'relative',
    minWidth: '80px',
  },
  multipleSelectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 50px 8px 8px !important',
    textAlign: 'left',

    '@media (max-width: 400px)': {
      fontSize: '10px !important',
      padding: '8px 40px 8px 8px !important',
    },
  },
  menuPaper: {
    maxHeight: '350px !important',
  },
  selectSearch: {
    padding: '0px 16px !important',
  },
  warningGenotypes: {
    padding: '0px 16px !important',
    backgroundColor: 'rgb(211, 211, 211)',
  },
}));

export { useStyles };
