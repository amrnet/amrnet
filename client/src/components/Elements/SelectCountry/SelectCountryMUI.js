import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    }
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: '8px'
  },
  selectInput: {
    fontSize: '16px !important',
    fontWeight: '600 !important',
    textAlign: 'start',
    minWidth: '250px !important'
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '16px'
    }
  },
  menuPaper: {
    maxHeight: '350px !important'
  }
}));

export { useStyles };
