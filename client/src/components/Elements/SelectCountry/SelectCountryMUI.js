import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: '8px',
  },
  // selectInput: {
  //   fontSize: '16px !important',
  //   fontWeight: '600 !important',
  //   textAlign: 'start',
  //   minWidth: '250px !important',
  // },
  // selectMenu: {
  //   '& .MuiMenuItem-root': {
  //     fontSize: '16px',
  //   },
  // },
  // menuPaper: {
  //   maxHeight: '350px !important',
  // },
  // selectWrapper: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   gap: '16px',

  //   '@media (max-width: 650px)': {
  //     flexDirection: 'column',
  //     width: '100%',
  //   },
  // },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px',
    paddingBottom: '4px',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuPaper: {
    maxHeight: '350px !important',
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important',
    marginRight: '-80px !important',
  },
  selectMenu: {
    '& .MuiCheckbox-root': {
      padding: '0px 8px 0px 0px',
    },
    '& .MuiTypography-root': {
      fontSize: '14px',
    },
  },
  labelTooltipIcon: {
    cursor: 'pointer',
  },
}));

export { useStyles };
